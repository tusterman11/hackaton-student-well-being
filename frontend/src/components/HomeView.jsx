import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Cloud,
  CloudDrizzle,
  CloudSun,
  Droplets,
  Heart,
  Moon,
  Pause,
  ShieldAlert,
  Smile,
  Sparkles,
  Sun,
  Timer
} from 'lucide-react';
import { formatDateTime } from '../utils/wellnessData';

const MOODS = [
  { value: 1, label: 'Pesado', icon: CloudDrizzle },
  { value: 2, label: 'Nublado', icon: Cloud },
  { value: 3, label: 'Meio a meio', icon: CloudSun },
  { value: 4, label: 'Bom', icon: Sun },
  { value: 5, label: 'Radiante', icon: Sparkles }
];

const ENERGY_LEVELS = [
  'Muito baixa — vá com calma',
  'Baixa — escolha um passo pequeno',
  'Moderada — respeite seu ritmo',
  'Boa — lembre-se de fazer pausas',
  'Alta — distribua sua energia ao longo do dia'
];

const QUICK_LINKS = [
  { id: 'study', label: 'Rotina de estudos', icon: Timer },
  { id: 'garden', label: 'Semana', icon: CalendarDays },
  { id: 'hydration', label: 'Hidratação', icon: Droplets },
  { id: 'breaks', label: 'Fazer uma pausa', icon: Pause },
  { id: 'journal', label: 'Diário', icon: BookOpen },
  { id: 'habits', label: 'Metas e hábitos', icon: Activity },
  { id: 'sleep', label: 'Sono', icon: Moon },
  { id: 'support', label: 'Área de apoio', icon: Heart }
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function HomeView({
  todayCheckin,
  aiTip,
  todayBreaks,
  todayWaterMl,
  waterGoalMl,
  checkins,
  historyStatus,
  historyError,
  onRetryHistory,
  onSaveCheckin,
  onAddWater,
  onNavigate,
  onTriggerReminder
}) {
  const [mood, setMood] = useState(todayCheckin?.mood || 4);
  const [energy, setEnergy] = useState(todayCheckin?.energy || 3);
  const [note, setNote] = useState(todayCheckin?.note || '');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (!todayCheckin) return;
    setMood(todayCheckin.mood);
    setEnergy(todayCheckin.energy);
    setNote(todayCheckin.note || '');
  }, [todayCheckin]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await onSaveCheckin({ mood, energy, note: note.trim() });
      setSavedFeedback(true);
      window.setTimeout(() => setSavedFeedback(false), 2500);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="view-stack">
      <header className="welcome-header">
        <div>
          <p className="eyebrow">{greeting()}, seja bem-vinda(o)</p>
          <h1>Como você está hoje?</h1>
          <p>Um espaço gentil para cuidar do seu ritmo, sem pressão.</p>
        </div>
        <button type="button" className="button button-quiet" onClick={onTriggerReminder}>
          <Pause size={17} /> Lembrete gentil
        </button>
      </header>

      {historyStatus === 'error' && (
        <div className="notice notice-error" role="alert">
          <span>{historyError} O resumo de check-ins e pausas está indisponível.</span>
          <button type="button" className="text-button" onClick={onRetryHistory}>Tentar novamente</button>
        </div>
      )}

      <section className="summary-grid" aria-label="Resumo de hoje">
        <article className="summary-card">
          <span className="summary-icon"><Smile size={19} /></span>
          <span className="summary-label">Humor</span>
          <strong>{todayCheckin ? MOODS.find((item) => item.value === todayCheckin.mood)?.label : historyStatus === 'ready' ? 'Sem registro' : '—'}</strong>
        </article>
        <article className="summary-card">
          <span className="summary-icon"><Activity size={19} /></span>
          <span className="summary-label">Energia</span>
          <strong>{todayCheckin ? `${todayCheckin.energy}/5` : historyStatus === 'ready' ? 'Sem registro' : '—'}</strong>
        </article>
        <article className="summary-card">
          <span className="summary-icon"><Pause size={19} /></span>
          <span className="summary-label">Pausas</span>
          <strong>{historyStatus === 'ready' ? todayBreaks.length : '—'}</strong>
        </article>
        <article className="summary-card">
          <span className="summary-icon"><Droplets size={19} /></span>
          <span className="summary-label">Água</span>
          <strong>{todayWaterMl ? `${todayWaterMl} ml` : 'Sem registro'}</strong>
          {todayWaterMl > 0 && <span className="summary-progress">{Math.round((todayWaterMl / waterGoalMl) * 100)}% da meta diária</span>}
        </article>
      </section>

      <div className="dashboard-grid">
        <section className="card checkin-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Check-in diário</p>
              <h2>Como está seu humor e sua energia?</h2>
            </div>
            <span className="section-icon"><Sparkles size={20} /></span>
          </div>

          <form onSubmit={handleSubmit}>
            <fieldset className="choice-fieldset">
              <legend>Humor</legend>
              <div className="mood-options">
                {MOODS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    className={`mood-option${mood === value ? ' is-selected' : ''}`}
                    onClick={() => setMood(value)}
                    aria-pressed={mood === value}
                  >
                    <Icon size={20} strokeWidth={1.7} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="choice-fieldset">
              <legend>Nível de energia</legend>
              <div className="energy-options" role="group" aria-label="Nível de energia">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`energy-option${energy === level ? ' is-selected' : ''}`}
                    aria-label={`Energia ${level}`}
                    aria-pressed={energy === level}
                    onClick={() => setEnergy(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="field-hint" aria-live="polite">{ENERGY_LEVELS[energy - 1]}</p>
            </fieldset>

            <label className="field-label" htmlFor="daily-reflection">
              Anotação <span>(opcional)</span>
            </label>
            <textarea
              id="daily-reflection"
              className="text-area"
              placeholder="Se quiser, conte algo sobre como está se sentindo."
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={500}
              rows={3}
              aria-describedby="checkin-note-count"
            />
            <div className="form-meta">
              <span id="checkin-note-count">{note.length}/500</span>
              {todayCheckin && <span>Check-in de hoje salvo</span>}
            </div>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <button type="submit" className="button button-primary" disabled={saving}>
              {savedFeedback ? <Check size={18} /> : null}
              {saving ? 'Salvando…' : savedFeedback ? 'Check-in salvo' : 'Salvar check-in'}
            </button>
          </form>

          {todayCheckin?.created_at && (
            <p className="field-hint">Último registro: {formatDateTime(todayCheckin.created_at)}</p>
          )}
        </section>

        <div className="dashboard-side">
          <section className="card suggestion-card">
            <span className="eyebrow">{aiTip ? 'Sugestão para agora' : 'Uma ideia para agora'}</span>
            <p>{aiTip || 'Você pode escolher uma pausa curta ou registrar uma reflexão, no seu tempo.'}</p>
            <button type="button" className="text-button" onClick={() => onNavigate('breaks')}>
              Ver opções de pausa <ArrowRight size={16} />
            </button>
          </section>

          <section className="card">
            <div className="section-heading">
              <div><p className="eyebrow">Acessos rápidos</p><h2>O que você precisa?</h2></div>
            </div>
            <div className="quick-links">
              {QUICK_LINKS.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" className="quick-link" onClick={() => onNavigate(id)}>
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{label}</span>
                  <ArrowRight size={15} className="quick-link-arrow" />
                </button>
              ))}
            </div>
            <button type="button" className="button button-secondary water-quick-action" onClick={() => onAddWater(250)}>
              <Droplets size={17} /> Registrar um copo de água (250 ml)
            </button>
          </section>
        </div>
      </div>

      <section className="card history-card">
        <div className="section-heading">
          <div><p className="eyebrow">Seus registros reais</p><h2>Check-ins recentes</h2></div>
          <button type="button" className="text-button" onClick={() => onNavigate('garden')}>
            Ver semana <ArrowRight size={16} />
          </button>
        </div>
        {historyStatus === 'loading' ? (
          <p className="empty-state">Carregando seu histórico…</p>
        ) : historyStatus === 'error' ? (
          <p className="empty-state">Não foi possível consultar os registros no servidor.</p>
        ) : checkins.length === 0 ? (
          <p className="empty-state">Seus check-ins aparecerão aqui depois que você registrar um.</p>
        ) : (
          <ul className="record-list">
            {checkins.slice(0, 5).map((item) => (
              <li key={item.id}>
                <span className="record-dot" />
                <strong>{MOODS.find((moodItem) => moodItem.value === item.mood)?.label || `Humor ${item.mood}/5`}</strong>
                <span>Energia {item.energy}/5</span>
                <time>{formatDateTime(item.created_at)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="notice notice-privacy">
        <ShieldAlert size={19} />
        <p>Este app não tem contas de usuário. O identificador do navegador não isola usuários e os dados salvos localmente não são criptografados. Evite usar em dispositivo compartilhado.</p>
      </aside>
    </div>
  );
}
