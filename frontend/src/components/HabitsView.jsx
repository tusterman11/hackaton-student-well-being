import { useState } from 'react';
import { Check, Plus, Sprout, Trash2 } from 'lucide-react';
import { createId, getLastSevenDateKeys } from '../utils/wellnessData';

export function HabitsView({ localData, onUpdateLocalData }) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const today = getLastSevenDateKeys().at(-1);
  const week = getLastSevenDateKeys();

  function createHabit(event) {
    event.preventDefault();
    const value = title.trim();
    if (!value) {
      setError('Escreva o nome de um hábito.');
      return;
    }
    onUpdateLocalData((data) => ({
      ...data,
      habits: [{ id: createId(), title: value, createdAt: new Date().toISOString(), completedDates: [] }, ...data.habits]
    }));
    setTitle('');
    setError('');
  }

  function toggleToday(habit) {
    onUpdateLocalData((data) => ({
      ...data,
      habits: data.habits.map((item) => {
        if (item.id !== habit.id) return item;
        const dates = item.completedDates || [];
        return {
          ...item,
          completedDates: dates.includes(today)
            ? dates.filter((date) => date !== today)
            : [...dates, today]
        };
      })
    }));
  }

  function deleteHabit(id) {
    onUpdateLocalData((data) => ({ ...data, habits: data.habits.filter((habit) => habit.id !== id) }));
  }

  return (
    <div className="view-stack">
      <header className="view-header">
        <p className="eyebrow">Metas e hábitos</p>
        <h1>Pequenos passos, no seu ritmo</h1>
        <p>Acompanhe o que faz sentido para você. Sem ranking e sem comparação.</p>
      </header>

      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">Novo hábito</p><h2>O que gostaria de acompanhar?</h2></div>
          <span className="section-icon"><Sprout size={20} /></span>
        </div>
        <form className="input-action-row" onSubmit={createHabit}>
          <label className="sr-only" htmlFor="habit-title">Nome do hábito</label>
          <input id="habit-title" className="text-input" value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: caminhar um pouco" />
          <button type="submit" className="button button-primary"><Plus size={17} /> Adicionar</button>
        </form>
        {error && <p className="form-error" role="alert">{error}</p>}
      </section>

      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">Seu acompanhamento</p><h2>Hábitos que você escolheu</h2></div>
        </div>
        {localData.habits.length === 0 ? (
          <p className="empty-state">Você ainda não criou hábitos. Adicione um para começar, sem meta obrigatória.</p>
        ) : (
          <div className="habit-list">
            {localData.habits.map((habit) => {
              const completedDates = habit.completedDates || [];
              const completedToday = completedDates.includes(today);
              return (
                <article className="habit-item" key={habit.id}>
                  <div className="habit-main">
                    <div><strong>{habit.title}</strong><span>{completedDates.filter((date) => week.includes(date)).length} conclusão(ões) nos últimos 7 dias</span></div>
                    <div className="habit-actions">
                      <button type="button" className={`button ${completedToday ? 'button-completed' : 'button-secondary'}`} aria-pressed={completedToday} onClick={() => toggleToday(habit)}>
                        <Check size={17} /> {completedToday ? 'Concluído hoje' : 'Marcar hoje'}
                      </button>
                      <button type="button" className="icon-button danger-action" aria-label={`Excluir hábito ${habit.title}`} onClick={() => deleteHabit(habit.id)}><Trash2 size={17} /></button>
                    </div>
                  </div>
                  <div className="habit-week" aria-label="Histórico de conclusão da semana">
                    {week.map((date) => (
                      <span key={date} className={completedDates.includes(date) ? 'habit-day is-done' : 'habit-day'} title={`${date}${completedDates.includes(date) ? ': concluído' : ': sem registro'}`}>
                        {new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'narrow' })}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
