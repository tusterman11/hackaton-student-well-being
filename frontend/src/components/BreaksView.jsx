import { useEffect, useState } from 'react';
import { Accessibility, Eye, Footprints, Wind } from 'lucide-react';
import { formatDateTime } from '../utils/wellnessData';

const BREAK_TIMERS = [
  {
    id: 'breathing',
    title: 'Respiração guiada',
    duration: 60,
    type: 'walk',
    label: 'Respiração guiada',
    description: 'Um minuto para desacelerar.',
    instructions: 'Inspire pelo nariz com suavidade e solte o ar devagar. Repita sem forçar o ritmo.'
  },
  {
    id: 'stretch',
    title: 'Alongamento leve',
    duration: 120,
    type: 'stretch',
    label: 'Alongamento de 2 minutos',
    description: 'Dois minutos para movimentar o corpo.',
    instructions: 'Alongue ombros e braços sem fazer força. Pare se sentir desconforto.'
  },
  {
    id: 'eyes',
    title: 'Descanso visual',
    duration: 20,
    type: 'walk',
    label: 'Descanso visual de 20 segundos',
    description: 'Descanse o olhar por vinte segundos.',
    instructions: 'Olhe para um ponto distante e pisque algumas vezes, sem apertar os olhos.'
  },
  {
    id: 'free',
    title: 'Pausa livre',
    duration: null,
    type: 'walk',
    label: 'Pausa livre',
    description: 'Escolha o tempo e o jeito da sua pausa.',
    instructions: 'Quando quiser encerrar, finalize para registrar essa pausa.'
  }
];

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function BreaksView({ todayBreaks, onAddBreak }) {
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerStatus, setTimerStatus] = useState('idle');
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (timerStatus !== 'running' || !activeTimer) return undefined;
    if (activeTimer.duration !== null && remaining === 0) {
      setTimerStatus('complete');
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      if (activeTimer.duration === null) {
        setElapsed((value) => value + 1);
      } else {
        setRemaining((value) => Math.max(0, value - 1));
      }
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [activeTimer, remaining, timerStatus]);

  function startTimer(timer) {
    setActiveTimer(timer);
    setRemaining(timer.duration || 0);
    setElapsed(0);
    setTimerStatus('running');
    setNotice('');
    setError('');
  }

  function cancelTimer() {
    setActiveTimer(null);
    setTimerStatus('idle');
    setRemaining(0);
    setElapsed(0);
    setError('');
    setNotice('');
  }

  async function saveCompletedBreak() {
    if (!activeTimer || saving) return;
    setSaving(true);
    setError('');
    try {
      await onAddBreak(activeTimer.type, activeTimer.label);
      setNotice('Pausa registrada no histórico.');
      setTimerStatus('saved');
    } catch (saveError) {
      setError(`${saveError.message} A pausa ainda não foi salva no servidor.`);
      setTimerStatus('complete');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="view-stack">
      <header className="view-header">
        <p className="eyebrow">Pausas conscientes</p>
        <h1>Escolha uma pausa</h1>
        <p>Temporizadores simples para respirar, alongar ou descansar os olhos. Faça no seu ritmo.</p>
      </header>

      <div className="break-timer-grid">
        {BREAK_TIMERS.map((timer) => {
          const Icon = timer.id === 'breathing' ? Wind
            : timer.id === 'stretch' ? Accessibility
              : timer.id === 'eyes' ? Eye : Footprints;
          const selected = activeTimer?.id === timer.id;
          return (
            <section className={`card break-option${selected ? ' is-active' : ''}`} key={timer.id}>
              <span className="section-icon"><Icon size={20} /></span>
              <h2>{timer.title}</h2>
              <p>{timer.description}</p>
              {selected ? (
                <div className="timer-panel" aria-live="polite">
                  <strong className="timer-display">
                    {timer.duration === null ? formatClock(elapsed) : formatClock(remaining)}
                  </strong>
                  <p>{timer.instructions}</p>
                  {timerStatus === 'complete' && <p className="success-text">Tempo concluído. Registre a pausa para adicioná-la ao histórico.</p>}
                  {timerStatus === 'saved' && <p className="success-text">{notice}</p>}
                  {error && <p className="form-error" role="alert">{error}</p>}
                  <div className="timer-actions">
                    {timerStatus === 'running' && timer.duration === null && (
                      <button type="button" className="button button-primary" onClick={() => setTimerStatus('complete')}>Concluir pausa</button>
                    )}
                    {timerStatus === 'running' && timer.duration !== null && (
                      <button type="button" className="button button-primary" disabled>Em andamento…</button>
                    )}
                    {timerStatus === 'complete' && (
                      <button type="button" className="button button-primary" onClick={saveCompletedBreak} disabled={saving}>
                        {saving ? 'Salvando…' : 'Registrar pausa concluída'}
                      </button>
                    )}
                    {timerStatus === 'saved' && (
                      <button type="button" className="button button-secondary" onClick={cancelTimer}>Pronto</button>
                    )}
                    <button type="button" className="button button-quiet" onClick={cancelTimer}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <button type="button" className="button button-secondary" onClick={() => startTimer(timer)}>
                  Iniciar {timer.duration === null ? 'pausa livre' : `(${timer.duration < 60 ? `${timer.duration} s` : `${timer.duration / 60} min`})`}
                </button>
              )}
            </section>
          );
        })}
      </div>

      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">Registros do servidor</p><h2>Pausas de hoje ({todayBreaks.length})</h2></div>
        </div>
        {todayBreaks.length === 0 ? (
          <p className="empty-state">Ainda não há pausas registradas hoje. As pausas concluídas aparecerão aqui.</p>
        ) : (
          <ul className="record-list">
            {todayBreaks.map((item) => (
              <li key={item.id}>
                <span className="record-dot" />
                <strong>{item.label}</strong>
                <time>{formatDateTime(item.created_at || item.createdAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
