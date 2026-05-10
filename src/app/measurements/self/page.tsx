'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import { Check } from 'lucide-react'

type Gender = 'male' | 'female'
type Unit = 'cm' | 'in'

interface MeasurementFields {
  chest: string; waist: string; hips: string; shoulder: string
  armLength: string; neck: string; inseam: string; thigh: string
  height: string; weight: string; notes: string
}

export default function MeasureBySelfPage() {
  const router = useRouter()
  const { user } = useApp()
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
    if (!name.trim()) { setError('Please enter a name for this measurement profile'); return }
    if (!user) { setError('Please log in to save measurements'); return }
    setSaving(true)
    setError('')
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
    setSaving(false)
    if (insertError) {
      console.error('Measurements save error:', insertError)
      setError(`Save failed: ${insertError.message}`)
      return
    }
    setSuccess(true)
    setTimeout(() => router.push('/measurements'), 1400)
  }

  const inputStyle: React.CSSProperties = {
    border: '1.5px solid #e8e8e8',
    background: '#fafafa',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 16,        // Larger so mobile doesn't auto-zoom
    width: '100%',
    outline: 'none',
    WebkitAppearance: 'none',
  }

  // Fix: no filtering in onChange — just store whatever user types.
  // Validate only on save via parseNum().
  // The key= prop prevents React from blurring the input on each keystroke.
  const MeasureField = ({ label, field }: { label: string; field: keyof MeasurementFields }) => (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>
        {label}
      </label>
      <div className="relative">
        <input
          key={field}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={fields[field]}
          onChange={e => update(field, e.target.value)}
          placeholder={unit === 'cm' ? 'e.g. 90' : 'e.g. 35'}
          style={{ ...inputStyle, paddingRight: 42 }}
          onFocus={e => (e.target.style.borderColor = '#e91e8c')}
          onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ fontSize: 12, color: '#9e9e9e', fontWeight: 700, pointerEvents: 'none' }}>
          {field === 'weight' ? 'kg' : unit}
        </span>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-white pb-8">
      <PageHeader
        title="Measure by Myself"
        subtitle={`Enter your measurements in ${unit}`}
      />

      <div className="px-5 py-4 flex flex-col gap-5">
        {/* Tip banner */}
        <div className="p-4 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>📏 Measurement Tips</p>
          <p style={{ fontSize: 12, color: '#757575', lineHeight: 1.6 }}>
            Use a soft measuring tape. Stand straight, breathe normally. Measure close to the body without pulling tight.
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
            Profile Name * <span style={{ color: '#9e9e9e', fontWeight: 400, fontSize: 11 }}>(e.g. "Khalifa" or "My Work Suit")</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Hamda's Abayas"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#e91e8c')}
            onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
          />
        </div>

        {/* Gender */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Gender</label>
          <div className="flex gap-3">
            {(['female', 'male'] as Gender[]).map(g => (
              <button key={g} onClick={() => setGender(g)}
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

        {/* Unit selector */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
            Unit of Measurement
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
                {u === 'cm' ? '📐 Centimeters (cm)' : '📏 Inches (in)'}
              </button>
            ))}
          </div>
        </div>

        {/* Upper body */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>Upper Body</h3>
          <div className="grid grid-cols-2 gap-3">
            <MeasureField label="Chest / Bust" field="chest" />
            <MeasureField label="Waist" field="waist" />
            <MeasureField label="Hips" field="hips" />
            <MeasureField label="Shoulder Width" field="shoulder" />
            <MeasureField label="Arm Length" field="armLength" />
            <MeasureField label="Neck" field="neck" />
          </div>
        </div>

        {/* Lower body */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>Lower Body</h3>
          <div className="grid grid-cols-2 gap-3">
            <MeasureField label="Inseam" field="inseam" />
            <MeasureField label="Thigh" field="thigh" />
          </div>
        </div>

        {/* General */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>General</h3>
          <div className="grid grid-cols-2 gap-3">
            <MeasureField label="Height" field="height" />
            <MeasureField label="Weight (kg)" field="weight" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
            Notes <span style={{ color: '#9e9e9e', fontWeight: 400, fontSize: 11 }}>(optional)</span>
          </label>
          <textarea
            value={fields.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Any special notes for the tailor..."
            rows={3}
            style={{ ...inputStyle, resize: 'none' as const }}
            onFocus={e => (e.target.style.borderColor = '#e91e8c')}
            onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
          />
        </div>

        {/* Default toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#f9f9f9' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>Set as default</p>
            <p style={{ fontSize: 12, color: '#9e9e9e' }}>Auto-fill orders with these measurements</p>
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
          {success ? (<><Check size={18} /> Saved!</>) : saving ? 'Saving...' : 'Save Measurements'}
        </button>
      </div>
    </div>
  )
}
