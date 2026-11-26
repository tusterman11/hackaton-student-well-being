import { useState } from 'react';
import { Moon, Trash2 } from 'lucide-react';
import { createId, formatDateTime } from '../utils/wellnessData';

const QUALITY_LABELS = ['Muito difícil', 'Difícil', 'Razoável', 'Boa', 'Muito boa'];

export function SleepView({ localData, onUpdateLocalData }) {
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState(3);
  const [error, setError] = useState('');

  function saveSleep(event) {
    event.preventDefault();
    if (!bedtime || !wakeTime) {
      setError('Informe os horários de dormir e acordar.');
      return;
    }
    const createdAt = new Date().toISOString();
    onUpdateLocalData((data) => ({
      ...data,
      sleep: [{
        id: createId(),
        bedtime,
        wakeTime,
        quality,
        createdAt
      }, ...data.sleep]
    }));
    setError('');
  }

  function removeEntry(id) {
    onUpdateLocalData((data) => ({ ...data, sleep: data.sleep.filter((entry) => entry.id !== id) }));
  }

  return (
    <div className="view-stack">
      <header className="view-header">
        <p className="eyebrow">Sono e descanso</p>
        <h1>Registre como foi sua noite</h1>
        <p>Uma percepção pessoal, sem diagnóstico ou avaliação médica.</p>
      </header>

      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">Novo registro</p><h2>Horários e qualidade percebida</h2></div>
          <span className="section-icon"><Moon size={20} /></span>
        </div>
        <form onSubmit={saveSleep}>
          <div className="form-grid-two">
            <div>
              <label className="field-label" htmlFor="sleep-bedtime">Horário de dormir</label>
              <input id="sleep-bedtime" className="text-input" type="time" value={bedtime} onChange={(event) => setBedtime(event.target.value)} required />
            </div>
            <div>
              <label className="field-label" htmlFor="sleep-waketime">Horário de acordar</label>
              <input id="sleep-waketime" className="text-input" type="time" value={wakeTime} onChange={(event) => setWakeTime(event.target.value)} required />
            </div>
          </div>
          <fieldset className="choice-fieldset quality-fieldset">
            <legend>Como você percebeu a qualidade do sono?</legend>
            <div className="mood-options">
              {QUALITY_LABELS.map((label, index) => (
                <button key={label} type="button" className={`mood-option${quality === index + 1 ? ' is-selected' : ''}`} aria-pressed={quality === index + 1} onClick={() => setQuality(index + 1)}>
                  <span className="quality-number">{index + 1}</span><span>{label}</span>
                </button>
              ))}
            </div>
          </fieldset>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="button button-primary">Salvar registro de sono</button>
        </form>
      </section>

      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">Seu histórico</p><h2>Registros recentes ({localData.sleep.length})</h2></div>
        </div>
        {localData.sleep.length === 0 ? (
          <p className="empty-state">Ainda não há registros de sono.</p>
        ) : (
          <ul className="record-list">
            {localData.sleep.map((entry) => (
              <li key={entry.id}>
                <Moon size={17} className="record-icon" />
                <strong>{entry.bedtime}–{entry.wakeTime}</strong>
                <span>{QUALITY_LABELS[entry.quality - 1]}</span>
                <time>{formatDateTime(entry.createdAt)}</time>
                <button type="button" className="icon-button danger-action" aria-label="Excluir registro de sono" onClick={() => removeEntry(entry.id)}><Trash2 size={17} /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
