'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import { useLanguage } from '@/lib/context/LanguageContext'
import { Check } from 'lucide-react'

type Gender = 'male' | 'female'
type Unit = 'cm' | 'in'

interface MeasurementFields {
  chest: string; waist: string; hips: string; shoulder: string
  armLength: string; neck: string; inseam: string; thigh: string
  height: string; weight: string; notes: string
}

const inputStyle: React.CSSProperties = {
  border: '1.5px solid #e8e8e8',
  background: '#fafafa',
  borderRadius: 12,
  padding: '12px 14px',
  fontSize: 16,
  width: '100%',
  outline: 'none',
  WebkitAppearance: 'none',
}

// ─── CRITICAL: MeasureField must be defined OUTSIDE the page component ────────
// If defined inside, React creates a new function type on every keystroke/render,
// which causes the input to be unmounted and remounted — dismissing the keyboard.
interface MeasureFieldProps {
  label: string
  field: keyof MeasurementFields
  fields: MeasurementFields
  unit: Unit
  update: (k: keyof MeasurementFields, v: string) => void
}

function MeasureField({ label, field, fields, unit, update }: MeasureFieldProps) {
  const { t } = useLanguage()
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={fields[field]}
          onChange={e => update(field, e.target.value)}
          placeholder={unit === 'cm' ? t('measure_self', 'placeholder_cm') : t('measure_self', 'placeholder_in')}
          style={{ ...inputStyle, paddingRight: 42 }}
          onFocus={e => (e.target.style.borderColor = '#e91e8c')}
          onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
        />
        <span style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          fontSize: 12, color: '#9e9e9e', fontWeight: 700, pointerEvents: 'none',
        }}>
          {field === 'weight' ? 'kg' : unit}
        </span>
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

export default function MeasureBySelfPage() {
  const router = useRouter()
  const { user } = useApp()
  const { t, isRTL } = useLanguage()
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender>('female')
  const [unit, setUnit] = useState<Unit>('cm')
  const [isDefault, setIsDefault] = useState(false)
  const [fields, setFields] = useState<MeasurementFields>({
    chest: '', waist: '', hips: '', shoulder: '', armLength: '', neck: '',
    inseam: '', thigh: '', height: '', weight: '', notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const update = (k: keyof MeasurementFields, v: string) =>
    setFields(f => ({ ...f, [k]: v }))

  const parseNum = (v: string) => {
    const n = parseFloat(v.replace(',', '.').trim())
    return isNaN(n) ? null : n
  }

  const handleSave = async () => {
    if (!name.trim()) { setError(t('measure_self', 'err_name_required')); return }
    if (!user) { setError(t('measure_self', 'err_login_required')); return }
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const payload = {
        user_id: user.id,
        name: name.trim(),
        gender,
        unit,
        chest: parseNum(fields.chest),
        waist: parseNum(fields.waist),
        hips: parseNum(fields.hips),
        shoulder_width: parseNum(fields.shoulder),
        arm_length: parseNum(fields.armLength),
        neck: parseNum(fields.neck),
        inseam: parseNum(fields.inseam),
        thigh: parseNum(fields.thigh),
        height: parseNum(fields.height),
        weight: parseNum(fields.weight),
        notes: fields.notes.trim() || null,
        is_default: isDefault,
      }
      const { error: insertError } = await supabase.from('measurements').insert(payload)
      if (insertError) {
        setError(`${t('measure_self', 'err_save_failed')} ${insertError.message}`)
        return
      }
      setSuccess(true)
      setTimeout(() => router.push('/measurements'), 1400)
    } catch (err) {
      setError(t('measure_self', 'err_generic'))
      console.error('Measurements save error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-dvh bg-white pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={t('measure_self', 'title')}
        subtitle={`${t('measure_self', 'subtitle')} ${unit}`}
      />

      <div className="px-5 py-4 flex flex-col gap-5">
        {/* Tip banner */}
        <div className="p-4 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>{t('measure_self', 'tips_title')}</p>
          <p style={{ fontSize: 12, color: '#757575', lineHeight: 1.6 }}>
            {t('measure_self', 'tips_body')}
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: '#fff0f0', color: '#d32f2f', border: '1px solid #ffcdd2' }}>
            {error}
          </div>
        )}

        {/* Profile name */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
            {t('measure_self', 'profile_name')} <span style={{ color: '#9e9e9e', fontWeight: 400, fontSize: 11 }}>{t('measure_self', 'profile_name_hint')}</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('measure_self', 'profile_name_placeholder')}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#e91e8c')}
            onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
          />
        </div>

        {/* Gender */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>{t('measure_self', 'gender')}</label>
          <div className="flex gap-3">
            {(['female', 'male'] as Gender[]).map(g => (
              <button key={g} onClick={() => setGender(g)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm capitalize transition-all"
                style={{
                  border: `2px solid ${gender === g ? '#e91e8c' : '#e8e8e8'}`,
                  background: gender === g ? '#fce4ec' : '#fafafa',
                  color: gender === g ? '#e91e8c' : '#9e9e9e',
                }}>
                {g === 'female' ? t('measure_self', 'female') : t('measure_self', 'male')}
              </button>
            ))}
          </div>
        </div>

        {/* Unit selector */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
            {t('measure_self', 'unit_label')}
          </label>
          <div className="flex gap-3">
            {(['cm', 'in'] as Unit[]).map(u => (
              <button key={u} onClick={() => setUnit(u)}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  border: `2px solid ${unit === u ? '#e91e8c' : '#e8e8e8'}`,
                  background: unit === u ? '#fce4ec' : '#fafafa',
                  color: unit === u ? '#e91e8c' : '#9e9e9e',
                }}>
                {u === 'cm' ? t('measure_self', 'unit_cm') : t('measure_self', 'unit_in')}
              </button>
            ))}
          </div>
        </div>

        {/* Upper body */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>{t('measure_self', 'upper_body')}</h3>
          <div className="grid grid-cols-2 gap-3">
            <MeasureField label={t('measure_self', 'chest')} field="chest" fields={fields} unit={unit} update={update} />
            <MeasureField label={t('measure_self', 'waist')} field="waist" fields={fields} unit={unit} update={update} />
            <MeasureField label={t('measure_self', 'hips')} field="hips" fields={fields} unit={unit} update={update} />
            <MeasureField label={t('measure_self', 'shoulder')} field="shoulder" fields={fields} unit={unit} update={update} />
            <MeasureField label={t('measure_self', 'arm_length')} field="armLength" fields={fields} unit={unit} update={update} />
            <MeasureField label={t('measure_self', 'neck')} field="neck" fields={fields} unit={unit} update={update} />
          </div>
        </div>

        {/* Lower body */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>{t('measure_self', 'lower_body')}</h3>
          <div className="grid grid-cols-2 gap-3">
            <MeasureField label={t('measure_self', 'inseam')} field="inseam" fields={fields} unit={unit} update={update} />
            <MeasureField label={t('measure_self', 'thigh')} field="thigh" fields={fields} unit={unit} update={update} />
          </div>
        </div>

        {/* General */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>{t('measure_self', 'general')}</h3>
          <div className="grid grid-cols-2 gap-3">
            <MeasureField label={t('measure_self', 'height')} field="height" fields={fields} unit={unit} update={update} />
            <MeasureField label={t('measure_self', 'weight')} field="weight" fields={fields} unit={unit} update={update} />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
            {t('measure_self', 'notes')} <span style={{ color: '#9e9e9e', fontWeight: 400, fontSize: 11 }}>{t('measure_self', 'notes_optional')}</span>
          </label>
          <textarea
            value={fields.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder={t('measure_self', 'notes_placeholder')}
            rows={3}
            style={{ ...inputStyle, resize: 'none' as const }}
            onFocus={e => (e.target.style.borderColor = '#e91e8c')}
            onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
          />
        </div>

        {/* Default toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#f9f9f9' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{t('measure_self', 'set_default')}</p>
            <p style={{ fontSize: 12, color: '#9e9e9e' }}>{t('measure_self', 'set_default_desc')}</p>
          </div>
          <button
            onClick={() => setIsDefault(!isDefault)}
            className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
            style={{ background: isDefault ? '#e91e8c' : '#e0e0e0' }}>
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white"
              style={{ left: isDefault ? '26px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
            />
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || success}
          className="w-full py-4 rounded-full text-white font-bold text-base flex items-center justify-center gap-2"
          style={{
            background: success ? '#4caf50' : saving ? '#f9a0c8' : 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)',
            boxShadow: '0 4px 15px rgba(233, 30, 140, 0.3)',
          }}>
          {success ? (<><Check size={18} /> {t('measure_self', 'saved')}</>) : saving ? t('measure_self', 'saving') : t('measure_self', 'save_btn')}
        </button>
      </div>
    </div>
  )
}
