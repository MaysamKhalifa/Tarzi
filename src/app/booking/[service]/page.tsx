'use client'

import { use, useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload, X, ChevronDown, Scissors, RefreshCw, Sparkles, Check } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import TailorPicker, { type RealTailor } from '@/components/TailorPicker'
import { MALE_GARMENTS, FEMALE_GARMENTS, MALE_UPCYCLING_ITEMS, FEMALE_UPCYCLING_ITEMS } from '@/lib/data/garments'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import { useLanguage } from '@/lib/context/LanguageContext'
import type { Measurement } from '@/types/database'

type Gender = 'male' | 'female'
type ServiceType = 'alterations' | 'from_scratch' | 'upcycling'

function useServiceMeta() {
  const { t } = useLanguage()
  return {
    alterations: { label: t('home', 'alterations'), icon: Scissors, color: '#e91e8c', bg: '#fce4ec', price: 45, subtitleKey: 'subtitle_alterations' as const },
    from_scratch: { label: t('home', 'from_scratch'), icon: Sparkles, color: '#f57c00', bg: '#fff3e0', price: 200, subtitleKey: 'subtitle_from_scratch' as const },
    upcycling: { label: t('home', 'upcycling'), icon: RefreshCw, color: '#7b1fa2', bg: '#f3e5f5', price: 80, subtitleKey: 'subtitle_upcycling' as const },
  }
}

/* ── Toast Banner ── */
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const start = Date.now()
    const duration = 7000
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(pct)
      if (pct === 0) {
        clearInterval(interval)
        onDone()
      }
    }, 50)
    return () => clearInterval(interval)
  }, [onDone])

  return (
    <div
      className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-[400px] px-4"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#1a1a1a',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}
      >
        <div className="px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#e91e8c' }}>
            <Scissors size={15} color="white" />
          </div>
          <p style={{ fontSize: 14, color: 'white', fontWeight: 600, flex: 1 }}>{message}</p>
        </div>
        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.1)' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: '#e91e8c',
              transition: 'width 0.05s linear',
            }}
          />
        </div>
      </div>
    </div>
  )
}

/* ── Main Booking Content ── */
function BookingContent({ serviceParam }: { serviceParam: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, addToCart } = useApp()
  const { t, isRTL } = useLanguage()
  const SERVICE_META = useServiceMeta()

  const svcKey = (serviceParam as ServiceType) in SERVICE_META ? (serviceParam as ServiceType) : 'alterations'
  const meta = SERVICE_META[svcKey]
  const Icon = meta.icon

  const preselectedGender = (searchParams.get('gender') as Gender) || 'female'
  const preselectedTailor = searchParams.get('tailorId') || ''
  const preselectedTailorName = searchParams.get('tailorName') || ''

  const [gender, setGender] = useState<Gender>(preselectedGender)
  const [garment, setGarment] = useState('')
  const [autoFill, setAutoFill] = useState<'yes' | 'no'>('no')
  const [selectedMeasurement, setSelectedMeasurement] = useState('')
  const [measurementsLoading, setMeasurementsLoading] = useState(false)
  const [comments, setComments] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [selectedTailor, setSelectedTailor] = useState(preselectedTailor)
  const [selectedTailorName, setSelectedTailorName] = useState(preselectedTailorName)
  const [realTailors, setRealTailors] = useState<RealTailor[]>([])
  const [tailorsLoading, setTailorsLoading] = useState(true)
  const [tailorPrice, setTailorPrice] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [added, setAdded] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [manualMeasurements, setManualMeasurements] = useState({
    profileName: '',
    chest: '', waist: '', hips: '', shoulder: '', armLength: '',
    neck: '', inseam: '', height: '', weight: '',
  })
  const [savingManual, setSavingManual] = useState(false)

  const updateManual = (k: keyof typeof manualMeasurements, v: string) =>
    setManualMeasurements(prev => ({ ...prev, [k]: v }))

  // Load real tailors from Supabase profiles
  useEffect(() => {
    const supabase = createClient()

    // Try approved tailors first; fall back to all tailors if none are approved yet
    supabase
      .from('profiles')
      .select('id, full_name, shop_name, area, city, avatar_url')
      .eq('role', 'tailor')
      .eq('is_approved', true)
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          // Fallback: show all tailors so booking is never blocked
          return supabase
            .from('profiles')
            .select('id, full_name, shop_name, area, city, avatar_url')
            .eq('role', 'tailor')
            .then(({ data: fallback }) => {
              setRealTailors((fallback as RealTailor[]) || [])
              setTailorsLoading(false)
              if (preselectedTailor && fallback) {
                const found = fallback.find((t: RealTailor) => t.id === preselectedTailor)
                if (found) setSelectedTailorName(found.shop_name || found.full_name || '')
              }
            })
        }
        setRealTailors((data as RealTailor[]) || [])
        setTailorsLoading(false)
        if (preselectedTailor && data) {
          const found = data.find((t: RealTailor) => t.id === preselectedTailor)
          if (found) setSelectedTailorName(found.shop_name || found.full_name || '')
        }
      })
  }, [preselectedTailor])

  // Fetch tailor-specific pricing whenever a tailor is selected
  useEffect(() => {
    if (!selectedTailor) { setTailorPrice(null); return }
    createClient()
      .from('tailor_services')
      .select('price_from')
      .eq('tailor_id', selectedTailor)
      .eq('service_type', svcKey)
      .maybeSingle()
      .then(({ data }) => setTailorPrice(data?.price_from ?? null))
  }, [selectedTailor, svcKey])

  // Gender-aware garment list — now including upcycling
  const garmentList =
    svcKey === 'upcycling'
      ? (gender === 'male' ? MALE_UPCYCLING_ITEMS : FEMALE_UPCYCLING_ITEMS)
      : (gender === 'male' ? MALE_GARMENTS : FEMALE_GARMENTS)

  // Auto-fill: fetch measurements; show toast + redirect if none
  useEffect(() => {
    if (autoFill !== 'yes') return

    if (!user) {
      setToast(t('booking', 'sign_in_measurements'))
      return
    }

    setMeasurementsLoading(true)
    const supabase = createClient()
    supabase
      .from('measurements')
      .select('*')
      .eq('user_id', user.id)
      .eq('gender', gender)
      .order('is_default', { ascending: false })
      .then(({ data, error }) => {
        setMeasurementsLoading(false)
        if (error) {
          console.error('Measurements fetch error:', error)
          setToast(t('booking', 'could_not_load_measurements'))
          setAutoFill('no')
          return
        }
        const list = data || []
        setMeasurements(list)
        if (list.length === 0) {
          // Show toast then redirect after 7 seconds
          setToast(t('booking', 'no_measurements_found'))
          setTimeout(() => {
            router.push('/measurements')
          }, 7000)
        } else {
          const defaultOne = list.find(m => m.is_default) || list[0]
          setSelectedMeasurement(defaultOne.id)
        }
      })
  }, [autoFill, user, gender, router])

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const newFiles = Array.from(files)
    setImages(prev => [...prev, ...newFiles])

    if (!user) return
    setUploading(true)
    const supabase = createClient()
    const uploaded: string[] = []

    for (const file of newFiles) {
      try {
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data, error } = await supabase.storage
          .from('garment-images')
          .upload(path, file, { upsert: true, contentType: file.type })
        if (error) { console.error('Upload error:', error.message); continue }
        if (data) {
          const { data: urlData } = supabase.storage.from('garment-images').getPublicUrl(data.path)
          uploaded.push(urlData.publicUrl)
        }
      } catch (err) {
        console.error('Upload failed for file:', file.name, err)
      }
    }

    setImageUrls(prev => [...prev, ...uploaded])
    setUploading(false)
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddToBag = () => {
    if (!garment) return
    addToCart({
      // Pass empty string → bag page converts to null → no FK violation
      tailorId: selectedTailor,
      tailorName: selectedTailorName || 'Any Available Tailor',
      serviceType: svcKey,
      garmentType: garment,
      gender,
      comments,
      imageUrls,
      price: tailorPrice !== null ? tailorPrice : meta.price,
      measurementId: selectedMeasurement || null,
    })
    setAdded(true)
    setTimeout(() => router.push('/bag'), 900)
  }

  const inputStyle: React.CSSProperties = {
    border: '1.5px solid #e8e8e8',
    background: '#fafafa',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 15,
    width: '100%',
    outline: 'none',
  }

  return (
    <div className="min-h-dvh bg-white pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Toast */}
      {toast && (
        <Toast message={toast} onDone={() => setToast(null)} />
      )}

      <PageHeader title={meta.label} subtitle={t('booking', meta.subtitleKey)} />

      <div className="px-5 py-4 flex flex-col gap-5">
        {/* Service badge */}
        <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: meta.bg }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white">
            <Icon size={24} color={meta.color} />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{meta.label}</p>
            <p style={{ fontSize: 13, color: '#757575' }}>
              {t('booking', 'starting_from')} AED {tailorPrice !== null ? tailorPrice : meta.price}
              {tailorPrice !== null && <span style={{ fontSize: 11, color: '#9e9e9e' }}> {t('booking', 'this_tailor')}</span>}
            </p>
          </div>
        </div>

        {/* Gender — shown for ALL service types including upcycling */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
            {t('booking', 'gender')}
          </label>
          <div className="flex gap-3">
            {(['female', 'male'] as Gender[]).map(g => (
              <button
                key={g}
                onClick={() => { setGender(g); setGarment(''); setMeasurements([]); setSelectedMeasurement('') }}
                className="flex-1 py-3 rounded-xl font-semibold text-sm capitalize transition-all"
                style={{
                  border: `2px solid ${gender === g ? '#e91e8c' : '#e8e8e8'}`,
                  background: gender === g ? '#fce4ec' : '#fafafa',
                  color: gender === g ? '#e91e8c' : '#9e9e9e',
                }}>
                {g === 'female' ? t('booking', 'female') : t('booking', 'male')}
              </button>
            ))}
          </div>
        </div>

        {/* Garment type */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
            {svcKey === 'upcycling' ? t('booking', 'garment_upcycling') : svcKey === 'from_scratch' ? t('booking', 'garment_scratch') : t('booking', 'garment_label')} *
          </label>
          <div className="relative">
            <select
              value={garment}
              onChange={e => setGarment(e.target.value)}
              style={{ ...inputStyle, paddingRight: 40, appearance: 'none', cursor: 'pointer' }}>
              <option value="">{t('booking', 'select_garment')}</option>
              {garmentList.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" color="#9e9e9e" />
          </div>
        </div>

        {/* Tailor selection — searchable */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
            {t('booking', 'select_tailor')}
          </label>
          <TailorPicker
            value={selectedTailor}
            tailors={realTailors}
            loading={tailorsLoading}
            onChange={(id, name) => {
              setSelectedTailor(id)
              setSelectedTailorName(name)
            }}
          />
        </div>

        {/* Auto-fill measurements */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
            {t('booking', 'autofill')}
          </label>
          <div className="flex gap-3">
            {(['yes', 'no'] as const).map(v => (
              <button key={v} onClick={() => setAutoFill(v)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  border: `2px solid ${autoFill === v ? '#e91e8c' : '#e8e8e8'}`,
                  background: autoFill === v ? '#fce4ec' : '#fafafa',
                  color: autoFill === v ? '#e91e8c' : '#9e9e9e',
                }}>
                {v === 'yes' ? t('booking', 'autofill_yes') : t('booking', 'autofill_no')}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {autoFill === 'yes' && measurementsLoading && (
            <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: '#f9f9f9' }}>
              <div className="w-4 h-4 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin flex-shrink-0" />
              <p style={{ fontSize: 13, color: '#9e9e9e' }}>{t('booking', 'loading_measurements')}</p>
            </div>
          )}

          {/* Measurement profile selector */}
          {autoFill === 'yes' && !measurementsLoading && measurements.length > 0 && (
            <div className="mt-3">
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
                {t('booking', 'choose_measurement')}
              </label>
              <div className="flex flex-col gap-2">
                {measurements.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMeasurement(m.id)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                    style={{
                      border: `2px solid ${selectedMeasurement === m.id ? '#e91e8c' : '#e8e8e8'}`,
                      background: selectedMeasurement === m.id ? '#fce4ec' : '#fafafa',
                    }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: selectedMeasurement === m.id ? '#e91e8c' : '#e0e0e0' }}>
                      <Check size={14} color="white" />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{m.name}</p>
                      <p style={{ fontSize: 11, color: '#9e9e9e' }}>
                        {m.gender} {m.is_default ? t('booking', 'default_tag') : ''} {m.chest ? `• Chest: ${m.chest}cm` : ''}
                      </p>
                    </div>
                    {selectedMeasurement === m.id && (
                      <span style={{ fontSize: 10, background: '#e91e8c', color: 'white', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                        {t('booking', 'selected_badge')}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: '#4caf50', marginTop: 6, fontWeight: 600 }}>
                {t('booking', 'measurements_shared')}
              </p>
            </div>
          )}

          {/* Manual measurement entry when user picks "No" */}
          {autoFill === 'no' && (
            <div className="mt-4 p-4 rounded-2xl" style={{ background: '#f9f9f9', border: '1.5px solid #f0f0f0' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
                {t('booking', 'enter_measurements')}
              </p>
              <p style={{ fontSize: 11, color: '#9e9e9e', marginBottom: 12 }}>
                {t('booking', 'enter_measurements_sub')}
              </p>

              {/* Profile name */}
              <div className="mb-3">
                <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>
                  {t('booking', 'profile_name_label')}
                </label>
                <input
                  type="text"
                  placeholder={t('booking', 'profile_name_placeholder')}
                  value={manualMeasurements.profileName}
                  onChange={e => updateManual('profileName', e.target.value)}
                  style={{ ...inputStyle, fontSize: 13 }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: 'chest', labelKey: 'field_chest' },
                  { key: 'waist', labelKey: 'field_waist' },
                  { key: 'hips', labelKey: 'field_hips' },
                  { key: 'shoulder', labelKey: 'field_shoulder' },
                  { key: 'armLength', labelKey: 'field_arm' },
                  { key: 'neck', labelKey: 'field_neck' },
                  { key: 'inseam', labelKey: 'field_inseam' },
                  { key: 'height', labelKey: 'field_height' },
                  { key: 'weight', labelKey: 'field_weight' },
                ] as { key: keyof typeof manualMeasurements; labelKey: 'field_chest' | 'field_waist' | 'field_hips' | 'field_shoulder' | 'field_arm' | 'field_neck' | 'field_inseam' | 'field_height' | 'field_weight' }[]).map(({ key, labelKey }) => (
                  <div key={key}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: '#555', display: 'block', marginBottom: 3 }}>{t('booking', labelKey)}</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder={t('booking', 'field_value_placeholder')}
                      value={manualMeasurements[key]}
                      onChange={e => {
                        const v = e.target.value
                        if (v === '' || /^[\d.,]*$/.test(v)) updateManual(key, v)
                      }}
                      style={{ ...inputStyle, fontSize: 13, padding: '10px 12px' }}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={async () => {
                  if (!user) return
                  setSavingManual(true)
                  const supabase = createClient()
                  const { data, error } = await supabase
                    .from('measurements')
                    .insert({
                      user_id: user.id,
                      name: manualMeasurements.profileName || t('booking', 'profile_name_placeholder'),
                      gender,
                      chest: manualMeasurements.chest ? parseFloat(manualMeasurements.chest.replace(',', '.')) : null,
                      waist: manualMeasurements.waist ? parseFloat(manualMeasurements.waist.replace(',', '.')) : null,
                      hips: manualMeasurements.hips ? parseFloat(manualMeasurements.hips.replace(',', '.')) : null,
                      shoulder_width: manualMeasurements.shoulder ? parseFloat(manualMeasurements.shoulder.replace(',', '.')) : null,
                      arm_length: manualMeasurements.armLength ? parseFloat(manualMeasurements.armLength.replace(',', '.')) : null,
                      neck: manualMeasurements.neck ? parseFloat(manualMeasurements.neck.replace(',', '.')) : null,
                      inseam: manualMeasurements.inseam ? parseFloat(manualMeasurements.inseam.replace(',', '.')) : null,
                      height: manualMeasurements.height ? parseFloat(manualMeasurements.height.replace(',', '.')) : null,
                      weight: manualMeasurements.weight ? parseFloat(manualMeasurements.weight.replace(',', '.')) : null,
                      is_default: false,
                    })
                    .select('id')
                    .single()
                  if (data && !error) {
                    setSelectedMeasurement(data.id)
                  }
                  setSavingManual(false)
                }}
                disabled={savingManual}
                className="mt-4 w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: savingManual ? '#f9a0c8' : 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)',
                  color: 'white',
                }}>
                {savingManual ? t('booking', 'saving') : selectedMeasurement ? t('booking', 'measurements_saved') : t('booking', 'save_measurements_btn')}
              </button>

              {selectedMeasurement && !savingManual && (
                <p style={{ fontSize: 11, color: '#4caf50', textAlign: 'center', marginTop: 6, fontWeight: 600 }}>
                  {t('booking', 'saved_linked')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Image upload */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
            {t('booking', 'images')}
          </label>
          <label
            className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl cursor-pointer transition-all"
            style={{ border: '2px dashed #e8e8e8', background: '#fafafa' }}>
            <input type="file" multiple accept="image/*" className="hidden"
              onChange={e => handleImageUpload(e.target.files)} />
            <Upload size={22} color="#9e9e9e" />
            <span style={{ fontSize: 13, color: uploading ? '#e91e8c' : '#9e9e9e' }}>
              {uploading ? t('booking', 'uploading') : t('booking', 'tap_upload')}
            </span>
            <span style={{ fontSize: 11, color: '#bbb' }}>{t('booking', 'no_limit')}</span>
          </label>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(img)} alt=""
                    className="w-16 h-16 rounded-xl object-cover" />
                  <button onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <X size={10} color="white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
            {t('booking', 'comments')}
          </label>
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder={t('booking', 'comments_placeholder')}
            rows={3}
            style={{ ...inputStyle, resize: 'none' }}
            onFocus={e => (e.target.style.borderColor = '#e91e8c')}
            onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
          />
        </div>

        {/* Price estimate */}
        <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: '#f9f9f9' }}>
          <div>
            <p style={{ fontSize: 13, color: '#9e9e9e' }}>
              {tailorPrice !== null ? t('booking', 'tailors_price') : t('booking', 'estimated')}
            </p>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#e91e8c' }}>
              AED {tailorPrice !== null ? tailorPrice : meta.price}
            </p>
          </div>
          <p style={{ fontSize: 11, color: '#bbb', textAlign: 'right', maxWidth: 120, lineHeight: 1.4 }}>
            {t('booking', 'final_note')}
          </p>
        </div>

        <button
          onClick={handleAddToBag}
          disabled={!garment || added || uploading}
          className="w-full py-4 rounded-full text-white font-bold text-base flex items-center justify-center gap-2"
          style={{
            background: added
              ? '#4caf50'
              : (!garment || uploading)
                ? '#f0f0f0'
                : 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)',
            color: (!garment || uploading) && !added ? '#bbb' : 'white',
            boxShadow: (!garment || uploading) && !added ? 'none' : '0 4px 15px rgba(233, 30, 140, 0.3)',
          }}>
          {added
            ? <><Check size={18} /> {t('booking', 'added')}</>
            : uploading
              ? t('booking', 'adding')
              : !garment
                ? t('booking', 'select_to_continue')
                : t('booking', 'add_to_bag')}
        </button>
      </div>
    </div>
  )
}

export default function BookingPage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = use(params)
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
      </div>
    }>
      <BookingContent serviceParam={service} />
    </Suspense>
  )
}
