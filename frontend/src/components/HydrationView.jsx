import { useMemo, useState } from 'react';
import { Droplets, Plus, Target, Trash2 } from 'lucide-react';
import { formatDateTime, getLastSevenDateKeys, getRecordDateKey } from '../utils/wellnessData';

function dateLabel(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function HydrationView({ localData, onUpdateLocalData, onRegisterWater, serverWaterRecords }) {
  const [amount, setAmount] = useState('250');
  const [goal, setGoal] = useState(String(localData.hydrationGoalMl));
  const [formError, setFormError] = useState('');
  const todayKey = getRecordDateKey(new Date());
  const todayEntries = localData.hydration.filter((entry) => getRecordDateKey(entry.createdAt) === todayKey);
  const todayTotal = todayEntries.reduce((sum, entry) => sum + entry.amountMl, 0);
  const progress = Math.min(100, (todayTotal / localData.hydrationGoalMl) * 100);
  const dailyHistory = useMemo(() => getLastSevenDateKeys().map((dateKey) => ({
    dateKey,
    total: localData.hydration
      .filter((entry) => getRecordDateKey(entry.createdAt) === dateKey)
      .reduce((sum, entry) => sum + entry.amountMl, 0)
  })), [localData.hydration]);

  async function handleAdd(event) {
    event.preventDefault();
    const amountMl = Number(amount);
    if (!Number.isInteger(amountMl) || amountMl < 50 || amountMl > 2000) {
      setFormError('Informe uma quantidade entre 50 e 2.000 ml.');
      return;
    }
    setFormError('');
    await onRegisterWater(amountMl);
  }

  function saveGoal(event) {
    event.preventDefault();
    const value = Number(goal);
    if (!Number.isInteger(value) || value < 250 || value > 10000) {
      setFormError('A meta deve ficar entre 250 e 10.000 ml.');
      return;
    }
    setFormError('');
    onUpdateLocalData((data) => ({ ...data, hydrationGoalMl: value }));
  }

  function removeEntry(id) {
    onUpdateLocalData((data) => ({
      ...data,
      hydration: data.hydration.filter((entry) => entry.id !== id)
    }));
  }

  return (
    <div className="view-stack">
      <header className="view-header">
        <p className="eyebrow">Hidratação</p>
        <h1>Um gole de cada vez</h1>
        <p>Registre a água que fizer sentido para você e ajuste sua meta diária.</p>
      </header>

      <section className="card hydration-progress-card">
        <div className="section-heading">
          <div><p className="eyebrow">Hoje</p><h2>{todayTotal} ml registrados</h2></div>
          <span className="section-icon"><Droplets size={21} /></span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Progresso da meta diária de água"
          aria-valuemin={0}
          aria-valuemax={localData.hydrationGoalMl}
          aria-valuenow={todayTotal}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="field-hint">{Math.round(progress)}% da meta de {localData.hydrationGoalMl} ml</p>

        <form className="inline-form" onSubmit={handleAdd}>
          <label className="field-label" htmlFor="water-amount">Quantidade (ml)</label>
          <div className="input-action-row">
            <input id="water-amount" className="text-input" type="number" min="50" max="2000" step="50" value={amount} onChange={(event) => setAmount(event.target.value)} />
            <button type="submit" className="button button-primary"><Plus size={17} /> Registrar água</button>
          </div>
        </form>

        <form className="goal-form" onSubmit={saveGoal}>
          <label className="field-label" htmlFor="water-goal"><Target size={16} /> Meta diária</label>
          <div className="input-action-row">
            <input id="water-goal" className="text-input" type="number" min="250" max="10000" step="250" value={goal} onChange={(event) => setGoal(event.target.value)} />
            <button type="submit" className="button button-secondary">Salvar meta</button>
          </div>
        </form>
        {formError && <p className="form-error" role="alert">{formError}</p>}
      </section>

      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">Últimos sete dias</p><h2>Histórico diário</h2></div>
        </div>
        {localData.hydration.length === 0 ? (
          <p className="empty-state">Ainda não há registros de água. Eles aparecerão aqui quando você adicionar o primeiro.</p>
        ) : (
          <ul className="daily-history-list">
            {dailyHistory.map(({ dateKey, total }) => (
              <li key={dateKey}>
                <span>{dateLabel(dateKey)}</span>
                <strong>{total ? `${total} ml` : 'Sem registro'}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">Registros locais</p><h2>Água recente</h2></div>
        </div>
        {todayEntries.length === 0 ? (
          <p className="empty-state">Nenhum registro de água hoje.</p>
        ) : (
          <ul className="record-list">
            {[...todayEntries].reverse().map((entry) => (
              <li key={entry.id}>
                <Droplets size={17} className="record-icon" />
                <strong>{entry.amountMl} ml</strong>
                <time>{formatDateTime(entry.createdAt)}</time>
                <button type="button" className="icon-button danger-action" aria-label={`Remover registro de ${entry.amountMl} ml`} onClick={() => removeEntry(entry.id)}>
                  <Trash2 size={17} />
                </button>
              </li>
            ))}
          </ul>
        )}
        {localData.hydration.length > todayEntries.length && (
          <p className="field-hint">Há registros de outros dias disponíveis no histórico semanal acima.</p>
        )}
      </section>

      {serverWaterRecords.length > 0 && (
        <section className="card">
          <div className="section-heading">
            <div><p className="eyebrow">Histórico anterior</p><h2>Registros de água do servidor</h2></div>
          </div>
          <p className="field-hint">Estes registros antigos não informam volume; nenhum valor em ml foi estimado.</p>
          <ul className="record-list">
            {serverWaterRecords.slice(0, 10).map((entry) => (
              <li key={entry.id}>
                <Droplets size={17} className="record-icon" />
                <strong>Água registrada</strong>
                <time>{formatDateTime(entry.created_at || entry.createdAt)}</time>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
