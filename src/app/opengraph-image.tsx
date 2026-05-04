import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Tarzi – Your Tailor, Your Style'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
          }}
        >
          {/* Logo circle */}
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: 40,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            }}
          >
            {/* Scissors SVG */}
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3"/>
              <circle cx="6" cy="18" r="3"/>
              <line x1="20" y1="4" x2="8.12" y2="15.88"/>
              <line x1="14.47" y1="14.48" x2="20" y2="20"/>
              <line x1="8.12" y1="8.12" x2="12" y2="12"/>
            </svg>
          </div>

          {/* App name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                fontSize: 96,
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-3px',
                lineHeight: 1,
              }}
            >
              Tarzi
            </div>
            <div
              style={{
                fontSize: 30,
                color: 'rgba(255,255,255,0.88)',
                fontWeight: 500,
                letterSpacing: '0.5px',
              }}
            >
              Your Tailor, Your Style
            </div>
          </div>

          {/* Tagline chips */}
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {['Alterations', 'From Scratch', 'Upcycling'].map(label => (
              <div
                key={label}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: 100,
                  padding: '10px 24px',
                  fontSize: 22,
                  fontWeight: 600,
                  border: '1.5px solid rgba(255,255,255,0.35)',
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
