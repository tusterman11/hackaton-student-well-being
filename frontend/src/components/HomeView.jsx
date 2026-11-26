
import { useEffect, useState } from 'react';
import {
  CloudRain,
  Cloud,
  CloudSun,
  Sun,
  Sparkles,
  Leaf,
  Droplets,
  Accessibility,
  Footprints,
  HeartHandshake,
  Bell
} from 'lucide-react';

const MOODS = [
  { value: 1, label: 'Pesado', icon: CloudRain },
  { value: 2, label: 'Nublado', icon: Cloud },
  { value: 3, label: 'Meio a meio', icon: CloudSun },
  { value: 4, label: 'Bom', icon: Sun },
  { value: 5, label: 'Radiante', icon: Sparkles }
];

const quickBtnStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '6px',
  padding: '12px 6px',
  borderRadius: '14px',
  border: '1px solid var(--border-light)',
  backgroundColor: 'var(--bg-app)',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'var(--text-primary)',
  cursor: 'pointer'
};

export function HomeView({
  todayCheckin,
  aiTip,
  todayBreaks,
  onSaveCheckin,
  note,
  onNoteChange,
  onAddBreak,
  onNavigate,
  onTriggerReminder
}) {
  const [mood, setMood] = useState(todayCheckin?.mood || 4);
  const [energy, setEnergy] = useState(todayCheckin?.energy || 3);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [breakError, setBreakError] = useState('');

  useEffect(() => {
    if (!todayCheckin) return;
    setMood(todayCheckin.mood);
    setEnergy(todayCheckin.energy);
  }, [todayCheckin]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await onSaveCheckin({ mood, energy, note });
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function addQuickBreak(type, label) {
    setBreakError('');
    try {
      await onAddBreak(type, label);
    } catch (error) {
      setBreakError(error.message);
    }
  }

  return (
    <div>
      {/* Cabeçalho */}
      <header
        className="home-header"
        style={{
          backgroundColor: 'var(--bg-sage-dark)',
          color: 'var(--text-on-dark)'
        }}
      >
        <div className="home-header-inner" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>
            EntrePausas · bem-estar no campus
          </span>

          <button
            type="button"
            onClick={onTriggerReminder}
            title="Simular lembrete gentil"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <Bell size={13} /> Testar lembrete
          </button>
        </div>

        <h1 style={{
          fontWeight: 700
        }}>
          Respire. Hoje o dia pode ser leve.
        </h1>

        <p style={{
          opacity: 0.85,
        }}>
          Um espaço sem pressa para notar como você está.
        </p>
      </header>

      <main className="home-content">
        {/* Card 1: Check-in Diário */}
        <section className="card home-checkin">
          <h2 style={{
            fontSize: '1.05rem',
            marginBottom: '12px'
          }}>
            Como está o seu céu hoje?
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '6px',
              marginBottom: '16px'
            }}>
              {MOODS.map((item) => {
                const Icon = item.icon;
                const selected = mood === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setMood(item.value)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 4px',
                      borderRadius: '14px',
                      border: selected
                        ? '2px solid var(--bg-sage-dark)'
                        : '1px solid var(--border-light)',
                      backgroundColor: selected
                        ? 'var(--bg-sage-soft)'
                        : '#fff',
                      color: selected
                        ? 'var(--bg-sage-dark)'
                        : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    <Icon size={20} />
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: selected ? 700 : 500
                    }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Seletor de Energia */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                marginBottom: '6px'
              }}>
                <span style={{ fontWeight: 600 }}>
                  Nível de energia
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {energy} de 5
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEnergy(lvl)}
                    aria-label={`Energia ${lvl}`}
                    aria-pressed={lvl <= energy}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: lvl <= energy
                        ? 'var(--bg-sage-soft)'
                        : '#fff',
                      color: lvl <= energy
                        ? 'var(--accent-green)'
                        : 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    <Leaf
                      size={18}
                      fill={lvl <= energy ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <label htmlFor="daily-reflection" style={{
              display: 'block',
              fontSize: '0.88rem',
              fontWeight: 600,
              marginBottom: '6px'
            }}>
              Anotação do check-in <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span>
            </label>
            <textarea
              id="daily-reflection"
              placeholder="Quer registrar algo sobre como foi seu dia?"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              maxLength={500}
              rows={5}
              className="reflection-input"
              aria-describedby="daily-reflection-hint"
            />
            <div className="reflection-meta">
              <p id="daily-reflection-hint">
                Para conversar com a Interlude, abra a aba Conversa.
              </p>
              <span aria-live="polite">{note.length}/500</span>
            </div>

            {saveError && <p className="form-error" role="alert">{saveError}</p>}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando…' : savedFeedback
                ? 'Check-in guardado com carinho ✓'
                : 'Salvar check-in de hoje'}
            </button>
          </form>
        </section>

        {/* Card 2: Dica da IA */}
        <section
          className="card"
          style={{ backgroundColor: 'var(--bg-amber-soft)' }}
        >
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--accent-orange-hover)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            Sugestão para agora
          </span>

          <p style={{
            fontSize: '0.95rem',
            marginTop: '6px',
            color: 'var(--text-primary)'
          }}>
            {aiTip}
          </p>

          <p style={{
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            marginTop: '8px'
          }}>
            Uma ideia simples para sua pausa. Você decide o que faz sentido no seu ritmo.
          </p>

          <button
            type="button"
            onClick={() => onNavigate('chat')}
            style={{
              marginTop: '12px',
              padding: '9px 14px',
              border: 'none',
              borderRadius: '999px',
              backgroundColor: 'var(--bg-sage-dark)',
              color: 'var(--text-on-dark)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Conversar com a Interlude
          </button>
        </section>

        {/* Card 3: Pausas Rápidas */}
        <section className="card">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h2 style={{ fontSize: '1rem' }}>
              Pausa rápida ({todayBreaks.length} hoje)
            </h2>

            <button
              type="button"
              onClick={() => onNavigate('breaks')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--bg-sage-dark)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Ver todas →
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px'
          }}>
            <button
              type="button"
              onClick={() => addQuickBreak('water', 'Bebi água')}
              style={quickBtnStyle}
            >
              <Droplets size={18} color="#3b82f6" />
              <span>Bebi água</span>
            </button>

            <button
              type="button"
              onClick={() => addQuickBreak('stretch', 'Me alonguei')}
              style={quickBtnStyle}
            >
              <Accessibility size={18} color="#4e7a65" />
              <span>Alonguei</span>
            </button>

            <button
              type="button"
              onClick={() => addQuickBreak('walk', 'Pausa curta')}
              style={quickBtnStyle}
            >
              <Footprints size={18} color="#f2994a" />
              <span>Pausa curta</span>
            </button>
          </div>
          {breakError && <p className="form-error" role="alert">{breakError}</p>}
        </section>

        {/* Banner de Apoio */}
        <section
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: '#fff'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <HeartHandshake
              size={24}
              color="var(--bg-sage-dark)"
            />

            <div>
              <strong style={{
                fontSize: '0.88rem',
                display: 'block'
              }}>
                Precisa conversar com alguém?
              </strong>

              <span style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                Este app apoia pausas e hábitos. Não substitui atendimento médico ou psicológico.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('support')}
            style={{
              backgroundColor: 'var(--bg-sage-soft)',
              color: 'var(--bg-sage-dark)',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 12px',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Apoio
          </button>
        </section>
      </main>
    </div>
  );
}
