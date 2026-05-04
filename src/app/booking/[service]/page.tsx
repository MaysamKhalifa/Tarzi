'use client'

import { use, useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload, X, ChevronDown, Scissors, RefreshCw, Sparkles, Check } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { MALE_GARMENTS, FEMALE_GARMENTS, UPCYCLING_ITEMS } from '@/lib/data/garments'
import { SAMPLE_TAILORS } from '@/lib/data/tailors'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import type { Measurement } from '@/types/database'

type Gender = 'male' | 'female'
type ServiceType = 'alterations' | 'from_scratch' | 'upcycling'

const SERVICE_META = {
  alterations: { label: 'Alterations', icon: Scissors, color: '#e91e8c', bg: '#fce4ec', price: 45 },
  from_scratch: { label: 'From Scratch', icon: Sparkles, color: '#f57c00', bg: '#fff3e0', price: 200 },
  upcycling: { label: 'Upcycling', icon: RefreshCw, color: '#7b1fa2', bg: '#f3e5f5', price: 80 },
}

function BookingContent({ serviceParam }: { serviceParam: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, addToCart } = useApp()

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
  const [comments, setComments] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [selectedTailor, setSelectedTailor] = useState(preselectedTailor)
  const [uploading, setUploading] = useState(false)
  const [added, setAdded] = useState(false)
  const [manualMeasurements, setManualMeasurements] = useState({
    profileName: '',
    chest: '', waist: '', hips: '', shoulder: '', armLength: '',
    neck: '', inseam: '', height: '', weight: '',
  })
  const [savingManual, setSavingManual] = useState(false)
  const updateManual = (k: keyof typeof manualMeasurements, v: string) =>
    setManualMeasurements(prev => ({ ...prev, [k]: v }))

  const garmentList = svcKey === 'upcycling'
    ? UPCYCLING_ITEMS
    : gender === 'male' ? MALE_GARMENTS : FEMALE_GARMENTS

  // Auto-fill: fetch measurements; redirect if none exist
  useEffect(() => {
    if (!user || autoFill !== 'yes' || svcKey === 'upcycling') return
    const supabase = createClient()
    supabase
      .from('measurements')
      .select('*')
      .eq('user_id', user.id)
      .eq('gender', gender)
      .order('is_default', { ascending: false })
      .then(({ data }) => {
        const list = data || []
        setMeasurements(list)
        if (list.length === 0) {
          // No measurements saved — redirect to measurements page
          router.push('/measurements')
        } else {
          const defaultOne = list.find(m => m.is_default) || list[0]
          setSelectedMeasurement(defaultOne.id)
        }
      })
  }, [autoFill, user, gender, svcKey, router])

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
        if (error) {
          console.error('Upload error:', error.message)
          continue
        }
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
    if (!garment && svcKey !== 'upcycling') return
    const tailor = SAMPLE_TAILORS.find(t => t.id === selectedTailor)
    addToCart({
      tailorId: selectedTailor,
      tailorName: tailor?.name || preselectedTailorName || 'Any Available Tailor',
      serviceType: svcKey,
      garmentType: garment || 'General',
      gender,
      comments,
      imageUrls,
      price: meta.price,
      measurementId: selectedMeasurement || null,
    })
    setAdded(true)
    setTimeout(() => router.push('/bag'), 900)
  }

  const inputStyle = {
    border: '1.5px solid #e8e8e8', background: '#fafafa', borderRadius: 12,
    padding: '12px 14px', fontSize: 15, width: '100%', outline: 'none',
  }

  return (
    <div className="min-h-dvh bg-white pb-8">
      <PageHeader title={meta.label} subtitle={`Book a ${meta.label.toLowerCase()} service`} />

      <div className="px-5 py-4 flex flex-col gap-5">
        {/* Service badge */}
        <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: meta.bg }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white">
            <Icon size={24} color={meta.color} />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{meta.label}</p>
            <p style={{ fontSize: 13, color: '#757575' }}>Starting from AED {meta.price}</p>
          </div>
        </div>

        {/* Gender (not for upcycling) */}
        {svcKey !== 'upcycling' && (
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>Gender</label>
            <div className="flex gap-3">
              {(['female', 'male'] as Gender[]).map(g => (
                <button key={g} onClick={() => { setGender(g); setGarment('') }}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm capitalize transition-all"
                  style={{
                    border: `2px solid ${gender === g ? '#e91e8c' : '#e8e8e8'}`,
                    background: gender === g ? '#fce4ec' : '#fafafa',
                    color: gender === g ? '#e91e8c' : '#9e9e9e',
                  }}>
                  {g === 'female' ? '👗 Female' : '👔 Male'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Garment type */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
            {svcKey === 'upcycling' ? 'Garment to Upcycle' : svcKey === 'from_scratch' ? 'Outfit Style' : 'Garment Type'} *
          </label>
          <div className="relative">
            <select value={garment} onChange={e => setGarment(e.target.value)}
              style={{ ...inputStyle, paddingRight: 40, appearance: 'none', cursor: 'pointer' }}>
              <option value="">Select garment...</option>
              {garmentList.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" color="#9e9e9e" />
          </div>
        </div>

        {/* Tailor selection */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
            Select Tailor (optional)
          </label>
          <div className="relative">
            <select value={selectedTailor} onChange={e => setSelectedTailor(e.target.value)}
              style={{ ...inputStyle, paddingRight: 40, appearance: 'none', cursor: 'pointer' }}>
              <option value="">Any available tailor</option>
              {SAMPLE_TAILORS.filter(t => t.is_available).map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} – {t.area} ({t.distance_km < 1 ? `${t.distance_km * 1000}m` : `${t.distance_km}km`})
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" color="#9e9e9e" />
          </div>
        </div>

        {/* Auto-fill measurements */}
        {svcKey !== 'upcycling' && (
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
              Auto-fill from Measurements?
            </label>
            <div className="flex gap-3">
              {(['yes', 'no'] as const).map(v => (
                <button key={v} onClick={() => setAutoFill(v)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm capitalize transition-all"
                  style={{
                    border: `2px solid ${autoFill === v ? '#e91e8c' : '#e8e8e8'}`,
                    background: autoFill === v ? '#fce4ec' : '#fafafa',
                    color: autoFill === v ? '#e91e8c' : '#9e9e9e',
                  }}>
                  {v === 'yes' ? '✓ Yes' : '✗ No'}
                </button>
              ))}
            </div>

            {autoFill === 'yes' && measurements.length > 0 && (
              <div className="mt-3">
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
                  Choose measurement profile
                </label>
                <div className="relative">
                  <select value={selectedMeasurement} onChange={e => setSelectedMeasurement(e.target.value)}
                    style={{ ...inputStyle, paddingRight: 40, appearance: 'none' }}>
                    {measurements.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.gender})</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" color="#9e9e9e" />
                </div>
              </div>
            )}

            {/* Manual measurement entry when user picks "No" */}
            {autoFill === 'no' && (
              <div className="mt-4 p-4 rounded-2xl" style={{ background: '#f9f9f9', border: '1.5px solid #f0f0f0' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
                  Enter Your Measurements
                </p>
                <p style={{ fontSize: 11, color: '#9e9e9e', marginBottom: 12 }}>
                  All fields in cm — fill what you know, skip the rest.
                </p>

                {/* Profile name */}
                <div className="mb-3">
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Profile name (e.g. "My Measurements")</label>
                  <input
                    type="text"
                    placeholder="e.g. My Measurements"
                    value={manualMeasurements.profileName ?? ''}
                    onChange={e => updateManual('profileName' as keyof typeof manualMeasurements, e.target.value)}
                    style={{ ...inputStyle, fontSize: 13 }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {([
                    { key: 'chest', label: 'Chest (cm)' },
                    { key: 'waist', label: 'Waist (cm)' },
                    { key: 'hips', label: 'Hips (cm)' },
                    { key: 'shoulder', label: 'Shoulder width (cm)' },
                    { key: 'armLength', label: 'Arm length (cm)' },
                    { key: 'neck', label: 'Neck (cm)' },
                    { key: 'inseam', label: 'Inseam (cm)' },
                    { key: 'height', label: 'Height (cm)' },
                    { key: 'weight', label: 'Weight (kg)' },
                  ] as { key: keyof typeof manualMeasurements; label: string }[]).map(({ key, label }) => (
                    <div key={key}>
                      <label style={{ fontSize: 10, fontWeight: 600, color: '#555', display: 'block', marginBottom: 3 }}>{label}</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="—"
                        value={manualMeasurements[key]}
                        onChange={e => updateManual(key, e.target.value)}
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
                        name: (manualMeasurements as Record<string, string>).profileName || 'My Measurements',
                        gender,
                        chest: manualMeasurements.chest ? parseFloat(manualMeasurements.chest) : null,
                        waist: manualMeasurements.waist ? parseFloat(manualMeasurements.waist) : null,
                        hips: manualMeasurements.hips ? parseFloat(manualMeasurements.hips) : null,
                        shoulder_width: manualMeasurements.shoulder ? parseFloat(manualMeasurements.shoulder) : null,
                        arm_length: manualMeasurements.armLength ? parseFloat(manualMeasurements.armLength) : null,
                        neck: manualMeasurements.neck ? parseFloat(manualMeasurements.neck) : null,
                        inseam: manualMeasurements.inseam ? parseFloat(manualMeasurements.inseam) : null,
                        height: manualMeasurements.height ? parseFloat(manualMeasurements.height) : null,
                        weight: manualMeasurements.weight ? parseFloat(manualMeasurements.weight) : null,
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
                  {savingManual ? 'Saving...' : selectedMeasurement ? '✓ Measurements Saved!' : 'Save Measurements'}
                </button>

                {selectedMeasurement && (
                  <p style={{ fontSize: 11, color: '#4caf50', textAlign: 'center', marginTop: 6, fontWeight: 600 }}>
                    ✓ Saved and linked to your order
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Image upload — no limit */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
            Attach Images (optional)
          </label>
          <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl cursor-pointer transition-all"
            style={{ border: '2px dashed #e8e8e8', background: '#fafafa' }}>
            <input type="file" multiple accept="image/*" className="hidden"
              onChange={e => handleImageUpload(e.target.files)} />
            <Upload size={22} color="#9e9e9e" />
            <span style={{ fontSize: 13, color: uploading ? '#e91e8c' : '#9e9e9e' }}>
              {uploading ? 'Uploading...' : 'Tap to upload photos'}
            </span>
            <span style={{ fontSize: 11, color: '#bbb' }}>JPG, PNG • No limit</span>
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
            Comments (optional)
          </label>
          <textarea value={comments} onChange={e => setComments(e.target.value)}
            placeholder="Describe your requirements, fabric preferences, style details..."
            rows={3}
            style={{ ...inputStyle, resize: 'none' as const }}
            onFocus={e => (e.target.style.borderColor = '#e91e8c')}
            onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
          />
        </div>

        {/* Price estimate */}
        <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: '#f9f9f9' }}>
          <div>
            <p style={{ fontSize: 13, color: '#9e9e9e' }}>Estimated price</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#e91e8c' }}>AED {meta.price}</p>
          </div>
          <p style={{ fontSize: 11, color: '#bbb', textAlign: 'right', maxWidth: 120, lineHeight: 1.4 }}>
            Final price decided by tailor after review
          </p>
        </div>

        <button onClick={handleAddToBag}
          disabled={(!garment && svcKey !== 'upcycling') || added || uploading}
          className="w-full py-4 rounded-full text-white font-bold text-base flex items-center justify-center gap-2"
          style={{
            background: added ? '#4caf50' : ((!garment && svcKey !== 'upcycling') || uploading) ? '#f9a0c8' : 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)',
            boxShadow: '0 4px 15px rgba(233, 30, 140, 0.3)',
          }}>
          {added ? (<><Check size={18} /> Added to Bag!</>) : uploading ? 'Uploading images...' : 'Add to Bag'}
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
