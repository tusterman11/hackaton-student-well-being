import { useState } from 'react';
import { Accessibility, Droplets, Footprints, Sprout } from 'lucide-react';

const BREAK_OPTIONS = [
  { type: 'water', label: 'Bebi água', icon: Droplets, color: '#3b82f6' },
  { type: 'stretch', label: 'Me alonguei', icon: Accessibility, color: 'var(--accent-green)' },
  { type: 'walk', label: 'Fiz uma pausa curta', icon: Footprints, color: 'var(--accent-orange)' }
];

export function BreaksView({ todayBreaks, onAddBreak }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function add(type, label) {
    setSaving(true);
    setError('');
    try {
      await onAddBreak(type, label);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-content">
      <h1 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Pausas de hoje</h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
        Pequenas pausas também contam. Escolha uma opção para registrar.
      </p>

      <section className="card" aria-label="Registrar uma pausa">
        <h2 style={{ fontSize: '1rem', marginBottom: '12px' }}>O que você fez?</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          {BREAK_OPTIONS.map(({ type, label, icon: Icon, color }) => (
            <button
              key={type}
              type="button"
              disabled={saving}
              onClick={() => add(type, label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '12px 14px',
                border: '1px solid var(--border-light)',
                borderRadius: '14px',
                background: 'var(--bg-app)',
                color: 'var(--text-primary)',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <Icon size={20} color={color} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
      </section>

      <section className="card" aria-label="Pausas registradas hoje">
        <h2 style={{ fontSize: '1rem', marginBottom: '12px' }}>
          Registradas hoje ({todayBreaks.length})
        </h2>
        {todayBreaks.length === 0 ? (
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Ainda não há pausas registradas. Quando quiser, você pode adicionar uma acima.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', display: 'grid', gap: '10px' }}>
            {todayBreaks.map((item) => {
              const option = BREAK_OPTIONS.find((entry) => entry.type === item.type);
              const Icon = option?.icon || Sprout;
              return (
                <li
                  key={item.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <Icon size={18} color={option?.color || 'var(--accent-green)'} />
                  <span style={{ flex: 1, fontSize: '0.9rem' }}>{item.label}</span>
                  <time style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {item.time}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
