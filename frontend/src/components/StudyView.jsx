import { useEffect, useState } from 'react';
import { BookOpen, Pause, Play, RotateCcw, Timer } from 'lucide-react';
import { formatDateTime } from '../utils/wellnessData';

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function StudyView({ localData, onCompleteSession }) {
  const [minutes, setMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return undefined;
    if (secondsRemaining <= 0) {
      setIsRunning(false);
      onCompleteSession(minutes);
      return undefined;
    }
    const timeoutId = window.setTimeout(() => {
      setSecondsRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearTimeout(timeoutId);
  }, [isRunning, minutes, onCompleteSession, secondsRemaining]);

  function updateDuration(value) {
    const next = Number(value);
    if (!Number.isInteger(next) || next < 5 || next > 180) return;
    setMinutes(next);
    if (!isRunning) setSecondsRemaining(next * 60);
  }

  function resetTimer() {
    setIsRunning(false);
    setSecondsRemaining(minutes * 60);
  }

  return (
    <div className="view-stack">
      <header className="view-header">
        <p className="eyebrow">Rotina de estudos</p>
        <h1>Um passo de cada vez</h1>
        <p>Organize um período de foco e lembre-se de pausar quando terminar.</p>
      </header>

      <section className="card study-timer-card">
        <span className="section-icon"><Timer size={22} /></span>
        <p className="eyebrow">Período de foco</p>
        <h2 className="study-clock" aria-live="polite">{formatClock(secondsRemaining)}</h2>
        <p className="field-hint">Escolha um tempo confortável entre 5 e 180 minutos.</p>
        <label className="field-label study-duration-label" htmlFor="study-duration">Duração (minutos)</label>
        <input id="study-duration" className="text-input duration-input" type="number" min="5" max="180" step="5" value={minutes} disabled={isRunning} onChange={(event) => updateDuration(event.target.value)} />
        <div className="study-controls">
          <button type="button" className="button button-primary" onClick={() => setIsRunning((value) => !value)}>
            {isRunning ? <Pause size={17} /> : <Play size={17} />}
            {isRunning ? 'Pausar foco' : 'Começar foco'}
          </button>
          <button type="button" className="button button-quiet" onClick={resetTimer}><RotateCcw size={17} /> Reiniciar</button>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">Histórico local</p><h2>Períodos concluídos ({localData.studySessions.length})</h2></div>
          <BookOpen size={19} className="record-icon" />
        </div>
        {localData.studySessions.length === 0 ? (
          <p className="empty-state">Quando concluir um período de foco, ele aparecerá aqui.</p>
        ) : (
          <ul className="record-list">
            {localData.studySessions.map((session) => (
              <li key={session.id}>
                <BookOpen size={17} className="record-icon" />
                <strong>{session.minutes} minutos de foco</strong>
                <time>{formatDateTime(session.createdAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
