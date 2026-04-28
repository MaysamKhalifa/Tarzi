'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import { Check } from 'lucide-react'

type Gender = 'male' | 'female'

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
  const [isDefault, setIsDefault] = useState(false)
  const [fields, setFields] = useState<MeasurementFields>({
    chest: '', waist: '', hips: '', shoulder: '', armLength: '', neck: '',
    inseam: '', thigh: '', height: '', weight: '', notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const update = (k: keyof MeasurementFields, v: string) => setFields(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!name.trim()) { setError('Please enter a name for this measurement profile'); return }
    if (!user) { setError('Please log in'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.from('measurements').insert({
      user_id: user.id,
      name,
      gender,
      chest: fields.chest ? +fields.chest : null,
      waist: fields.waist ? +fields.waist : null,
      hips: fields.hips ? +fields.hips : null,
      shoulder_width: fields.shoulder ? +fields.shoulder : null,
      arm_length: fields.armLength ? +fields.armLength : null,
      neck: fields.neck ? +fields.neck : null,
      inseam: fields.inseam ? +fields.inseam : null,
      thigh: fields.thigh ? +fields.thigh : null,
      height: fields.height ? +fields.height : null,
      weight: fields.weight ? +fields.weight : null,
      notes: fields.notes || null,
      is_default: isDefault,
    })
    setSaving(false)
    if (error) { setError(error.message); return }
    setSuccess(true)
    setTimeout(() => router.push('/measurements'), 1200)
  }

  const inputStyle = {
    border: '1.5px solid #e8e8e8',
    background: '#fafafa',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 15,
    width: '100%',
    outline: 'none',
  }

  const MeasureField = ({ label, field, unit = 'cm' }: { label: string; field: keyof MeasurementFields; unit?: string }) => (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>{label}</label>
      <div className="relative">
        <input type="number" value={fields[field]} onChange={e => update(field, e.target.value)}
          placeholder="0" style={{ ...inputStyle, paddingRight: 40 }}
          onFocus={e => (e.target.style.borderColor = '#e91e8c')}
          onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ fontSize: 12, color: '#9e9e9e', fontWeight: 600 }}>{unit}</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-white pb-8">
      <PageHeader title="Measure by Myself" subtitle="Enter your measurements in cm" />

      <div className="px-5 py-4 flex flex-col gap-5">
        {/* Guide illustration */}
        <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>📏 Measurement Tips</p>
          <p style={{ fontSize: 12, color: '#757575', lineHeight: 1.6 }}>
            Use a soft measuring tape. Stand straight, breathe normally. Measure close to the body without pulling tight.
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: '#fff0f0', color: '#d32f2f', border: '1px solid #ffcdd2' }}>{error}</div>
        )}

        {/* Profile name */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
            Profile Name (e.g. "Khalifa" or "My Work Suit") *
          </label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Hamda's Abayas" style={inputStyle}
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
            <MeasureField label="Weight" field="weight" unit="kg" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Notes (optional)</label>
          <textarea value={fields.notes} onChange={e => update('notes', e.target.value)}
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
          <button onClick={() => setIsDefault(!isDefault)}
            className="w-12 h-6 rounded-full transition-all relative"
            style={{ background: isDefault ? '#e91e8c' : '#e0e0e0' }}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
              style={{ left: isDefault ? '26px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </button>
        </div>

        <button onClick={handleSave} disabled={saving || success}
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
