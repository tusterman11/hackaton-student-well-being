import { useEffect, useState } from 'react';
import { BookOpen, Droplets, Moon, Plus, Target, Trash2 } from 'lucide-react';
import {
  createWellnessRecord,
  deleteWellnessRecord,
  setHabitCompletion,
  updateHydrationGoal,
  updateJournalEntry
} from '../services/api';

function localDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDate(value) {
  if (!value) return '';
  const dateKey = value instanceof Date
    ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
    : String(value).slice(0, 10);
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleDateString('pt-BR');
}

function formatTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function useRemoteList(key, records, onChange = () => {}) {
  const [items, setItems] = useState(records || []);
  const [error, setError] = useState('');
  useEffect(() => setItems(records || []), [records]);

  async function add(payload) {
    try {
      const item = await createWellnessRecord(key, payload);
      setItems((current) => [item, ...current]);
      onChange((current) => [item, ...current]);
      setError('');
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    }
  }

  async function remove(id) {
    try {
      await deleteWellnessRecord(key, id);
      setItems((current) => current.filter((item) => String(item.id) !== String(id)));
      onChange((current) => current.filter((item) => String(item.id) !== String(id)));
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function replace(id, updated) {
    setItems((current) => current.map((item) => String(item.id) === String(id) ? updated : item));
    onChange((current) => current.map((item) => String(item.id) === String(id) ? updated : item));
  }

  return { items, setItems, error, setError, add, remove, replace };
}

function PageIntro({ eyebrow, title, children }) {
  return <header className="page-intro"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{children}</p></header>;
}

function Empty({ children }) { return <div className="empty-state">{children}</div>; }

function RequestError({ children }) {
  return children ? <p className="form-error" role="alert">{children}</p> : null;
}

function RemoveButton({ label, onClick }) {
  return <button className="icon-action" type="button" aria-label={label} onClick={onClick}><Trash2 size={16} /></button>;
}

export function PersonalViews({ tab, data, onCollectionChange, onGoalChange }) {
  const notifyCollectionChange = (update) => onCollectionChange?.(tab, update);
  if (tab === 'hydration') return <HydrationView records={data.hydration} goal={data.hydrationGoalMl} onCollectionChange={notifyCollectionChange} onGoalChange={onGoalChange} />;
  if (tab === 'journal') return <JournalView records={data.journal} onCollectionChange={notifyCollectionChange} />;
  if (tab === 'habits') return <HabitsView records={data.habits} onCollectionChange={notifyCollectionChange} />;
  if (tab === 'sleep') return <SleepView records={data.sleep} onCollectionChange={notifyCollectionChange} />;
  if (tab === 'study') return <StudyView records={data.study} focusSessions={data.focusSessions || []} onCollectionChange={notifyCollectionChange} />;
  return null;
}

function HydrationView({ records, goal, onCollectionChange, onGoalChange }) {
  const { items: logs, error, add, remove } = useRemoteList('hydration', records, onCollectionChange);
  const [amount, setAmount] = useState(250);
  const [goalValue, setGoalValue] = useState(goal);
  const [goalDraft, setGoalDraft] = useState(goal);
  const [goalError, setGoalError] = useState('');
  useEffect(() => {
    setGoalValue(goal);
    setGoalDraft(goal);
  }, [goal]);
  const today = localDate();
  const total = logs.filter((item) => item.date === today).reduce((sum, item) => sum + Number(item.amount), 0);

  async function saveGoal() {
    try {
      const saved = await updateHydrationGoal(Number(goalDraft));
      setGoalValue(saved.hydrationGoalMl);
      onGoalChange(saved.hydrationGoalMl);
      setGoalError('');
    } catch (requestError) {
      setGoalError(requestError.message);
    }
  }

  return <main className="page-content personal-page">
    <PageIntro eyebrow="Hábito de hidratação" title="Água, no seu ritmo">Registre o que beber e acompanhe seu próprio objetivo diário.</PageIntro>
    <section className="card water-summary">
      <div className="water-total"><span className="icon-tile"><Droplets /></span><div><span className="eyebrow">Registrado hoje</span><h2>{total} <small>ml</small></h2></div><strong>{Math.min(100, Math.round(total / Math.max(1, goalValue) * 100))}%</strong></div>
      <div className="progress-track"><span style={{ width: `${Math.min(100, total / Math.max(1, goalValue) * 100)}%` }} /></div>
      <p className="muted">Meta pessoal: {Number(goalValue).toLocaleString('pt-BR')} ml</p>
    </section>
    <div className="two-column">
      <section className="card">
        <span className="eyebrow">Novo registro</span><h2>Quanto você bebeu?</h2>
        <label htmlFor="water-amount">Quantidade em ml</label>
        <div className="inline-input"><button type="button" onClick={() => setAmount((value) => Math.max(1, value - 50))}>−</button><input id="water-amount" type="number" min="1" max="5000" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /><button type="button" onClick={() => setAmount((value) => Math.min(5000, value + 50))}>+</button></div>
        <button className="btn-primary" type="button" onClick={() => add({ amount, date: today })}>Registrar água</button>
        <RequestError>{error}</RequestError>
      </section>
      <section className="card">
        <span className="eyebrow">Sua meta</span><h2>Personalize seu objetivo</h2>
        <label htmlFor="water-goal">Meta diária em ml</label>
        <input id="water-goal" type="number" min="250" max="10000" step="250" value={goalDraft} onChange={(event) => setGoalDraft(Number(event.target.value))} />
        <button className="btn-primary" type="button" onClick={saveGoal}>Salvar meta</button>
        <small className="muted">A meta é pessoal e editável; não é uma recomendação médica.</small>
        <RequestError>{goalError}</RequestError>
      </section>
    </div>
    <section className="card"><span className="eyebrow">Últimos registros</span><h2>Histórico de água</h2>
      {logs.length ? <ul className="record-list">{logs.slice(0, 20).map((item) => <li key={item.id}><Droplets size={18} /> {item.amount} ml <time>{formatDate(item.date)} {formatTime(item.created_at)}</time><RemoveButton label={`Excluir registro de ${item.amount} ml`} onClick={() => remove(item.id)} /></li>)}</ul> : <Empty>Ainda não há água registrada.</Empty>}
    </section>
  </main>;
}

function JournalView({ records, onCollectionChange }) {
  const { items: entries, error, add, remove, replace, setError } = useRemoteList('journal', records, onCollectionChange);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingDate, setEditingDate] = useState('');

  async function save(event) {
    event.preventDefault();
    if (!body.trim()) return;
    if (editingId !== null) {
      try {
        const updated = await updateJournalEntry(editingId, { title: title.trim(), body: body.trim(), date: editingDate });
        replace(editingId, updated);
        setError('');
      } catch (requestError) {
        setError(requestError.message);
        return;
      }
    } else if (!(await add({ title: title.trim(), body: body.trim(), date: localDate() }))) {
      return;
    }
    setTitle('');
    setBody('');
    setEditingId(null);
    setEditingDate('');
  }

  function edit(entry) {
    setTitle(entry.title);
    setBody(entry.body);
    setEditingId(entry.id);
    setEditingDate(String(entry.date).slice(0, 10));
  }

  return <main className="page-content personal-page">
    <PageIntro eyebrow="Espaço pessoal" title="Diário">Escreva sem pressa. Seus pensamentos não precisam estar organizados.</PageIntro>
    <form className="card form-stack" onSubmit={save}>
      <span className="eyebrow">{editingId === null ? 'Novo registro' : 'Editar registro'}</span><h2>O que está na sua cabeça?</h2>
      <label htmlFor="journal-title">Título <span className="muted">(opcional)</span></label>
      <input id="journal-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Uma palavra ou frase curta" maxLength={100} />
      <label htmlFor="journal-body">Seu registro</label>
      <textarea id="journal-body" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Escreva livremente…" maxLength={5000} rows={6} required />
      <RequestError>{error}</RequestError>
      <div className="form-footer"><small className="muted">{body.length}/5000 · A data será registrada automaticamente.</small><button className="btn-primary" type="submit"><Plus size={16} /> {editingId === null ? 'Salvar registro' : 'Atualizar registro'}</button></div>
    </form>
    <section className="card"><span className="eyebrow">Seus textos</span><h2>Registros anteriores <span className="count-pill">{entries.length}</span></h2>
      {entries.length ? <div className="entry-list">{entries.map((item) => <article key={item.id}><time>{formatDate(item.date)}</time>{item.title && <h3>{item.title}</h3>}<p>{item.body}</p><div className="record-actions"><button type="button" onClick={() => edit(item)}>Editar</button><RemoveButton label="Excluir registro do diário" onClick={() => remove(item.id)} /></div></article>)}</div> : <Empty>Seus registros aparecerão aqui depois que você salvar o primeiro.</Empty>}
    </section>
  </main>;
}

function HabitsView({ records, onCollectionChange }) {
  const { items, error, setError, add, remove, replace } = useRemoteList('habits', records, onCollectionChange);
  const [draft, setDraft] = useState('');
  const done = items.filter((item) => item.done).length;

  async function toggle(item) {
    try {
      const result = await setHabitCompletion(item.id, !item.done);
      replace(item.id, { ...item, done: result.done });
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return <main className="page-content personal-page">
    <PageIntro eyebrow="Pequenos passos" title="Metas e hábitos">Escolha objetivos gentis e acompanhe seu progresso sem competição.</PageIntro>
    <section className="card progress-card"><span className="icon-tile"><Target /></span><div><strong>{done} hábitos concluídos hoje</strong><p className="muted">Seu progresso é pessoal; cada dia é uma nova oportunidade.</p></div><strong className="progress-percent">{items.length ? Math.round(done / items.length * 100) : 0}%</strong><div className="progress-track"><span style={{ width: `${items.length ? done / items.length * 100 : 0}%` }} /></div></section>
    <section className="card"><span className="eyebrow">Nova meta</span><h2>O que você quer cultivar?</h2>
      <form className="inline-input habit-form" onSubmit={async (event) => { event.preventDefault(); if (await add({ label: draft.trim() })) setDraft(''); }}>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ex.: fazer uma pausa depois de estudar" maxLength={100} />
        <button className="btn-primary" type="submit"><Plus size={16} /> Adicionar</button>
      </form>
      <RequestError>{error}</RequestError>
      <div className="suggestions">{['Beber água', 'Fazer uma pausa', 'Descansar os olhos', 'Organizar o tempo de estudo', 'Fazer respiração guiada'].map((label) => <button type="button" key={label} onClick={() => add({ label })}>＋ {label}</button>)}</div>
    </section>
    <section className="card"><span className="eyebrow">Seu acompanhamento</span><h2>Metas pessoais <span className="count-pill">{items.length}</span></h2>
      {items.length ? <ul className="habit-list">{items.map((item) => <li key={item.id}><label><input type="checkbox" checked={Boolean(item.done)} onChange={() => toggle(item)} /><span className={item.done ? 'completed' : ''}>{item.label}</span></label><RemoveButton label={`Excluir hábito ${item.label}`} onClick={() => remove(item.id)} /></li>)}</ul> : <Empty>Adicione uma meta pequena para começar.</Empty>}
    </section>
    <p className="disclaimer-text">Sem rankings e sem cobrança: este espaço apoia seus próprios objetivos.</p>
  </main>;
}

function SleepView({ records, onCollectionChange }) {
  const { items: entries, error, add, remove } = useRemoteList('sleep', records, onCollectionChange);
  const [bed, setBed] = useState('23:00');
  const [wake, setWake] = useState('07:00');
  const [quality, setQuality] = useState(3);

  return <main className="page-content personal-page">
    <PageIntro eyebrow="Rotina de descanso" title="Como foi seu sono?">Registre horários e uma percepção pessoal da noite, sem diagnósticos.</PageIntro>
    <form className="card form-stack" onSubmit={async (event) => { event.preventDefault(); await add({ bed, wake, quality, date: localDate() }); }}>
      <span className="eyebrow">Novo registro</span><h2><Moon size={20} /> Anote sua noite</h2>
      <div className="two-column"><label>Horário de dormir<input type="time" value={bed} onChange={(event) => setBed(event.target.value)} required /></label><label>Horário de acordar<input type="time" value={wake} onChange={(event) => setWake(event.target.value)} required /></label></div>
      <fieldset><legend>Como você percebeu a qualidade do sono?</legend><div className="rating-row">{['Muito difícil', 'Difícil', 'Mais ou menos', 'Boa', 'Muito boa'].map((label, index) => <button type="button" className={quality === index + 1 ? 'selected' : ''} key={label} onClick={() => setQuality(index + 1)}><strong>{index + 1}</strong><small>{label}</small></button>)}</div></fieldset>
      <RequestError>{error}</RequestError>
      <div className="form-footer"><small className="muted">A data de hoje será adicionada automaticamente.</small><button type="submit" className="btn-primary">Salvar registro</button></div>
    </form>
    <section className="card"><span className="eyebrow">Seu histórico</span><h2>Registros de sono <span className="count-pill">{entries.length}</span></h2>
      {entries.length ? <ul className="record-list">{entries.map((item) => <li key={item.id}><Moon size={18} /> {item.bed} – {item.wake}<span>Qualidade: {item.quality}/5</span><time>{formatDate(item.date)}</time><RemoveButton label="Excluir registro de sono" onClick={() => remove(item.id)} /></li>)}</ul> : <Empty>Seus registros aparecerão aqui. Não há análise médica nesta seção.</Empty>}
    </section>
    <p className="disclaimer-text">O acompanhamento é apenas informativo e não substitui orientação de um profissional de saúde.</p>
  </main>;
}

function StudyView({ records, focusSessions, onCollectionChange }) {
  const { items, error, add, remove } = useRemoteList('study', records, onCollectionChange);
  const [subject, setSubject] = useState('');
  const [day, setDay] = useState('Segunda-feira');
  const [time, setTime] = useState('');

  return <main className="page-content personal-page">
    <PageIntro eyebrow="Organização gentil" title="Rotina de estudos">Organize seus estudos no seu ritmo.</PageIntro>
    <div className="two-column study-layout">
      <form className="card form-stack" onSubmit={async (event) => { event.preventDefault(); if (await add({ subject: subject.trim(), day, time })) setSubject(''); }}>
        <h2>Adicionar estudo</h2>
        <label>Matéria ou atividade<input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Ex.: Matemática" maxLength={200} required /></label>
        <div className="two-column"><label>Dia da semana<select value={day} onChange={(event) => setDay(event.target.value)}>{['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'].map((weekday) => <option key={weekday}>{weekday}</option>)}</select></label><label>Horário<input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label></div>
        <RequestError>{error}</RequestError>
        <button className="btn-primary" type="submit"><Plus size={16} /> Adicionar à rotina</button>
      </form>
      <section className="card"><h2>Agenda <span className="count-pill">{items.length} estudos</span></h2>
        {items.length ? <ul className="record-list">{items.map((item) => <li key={item.id}><BookOpen size={18} /><strong>{item.subject}</strong><span>{item.day} · {item.time || 'sem horário'}</span><RemoveButton label={`Excluir estudo ${item.subject}`} onClick={() => remove(item.id)} /></li>)}</ul> : <Empty>Nenhum estudo planejado. Adicione uma atividade acima.</Empty>}
      </section>
      {focusSessions.length > 0 && <section className="card"><span className="eyebrow">Histórico importado</span><h2>Períodos de foco concluídos <span className="count-pill">{focusSessions.length}</span></h2>
        <ul className="record-list">{focusSessions.map((session) => <li key={session.id}><BookOpen size={18} /><strong>{session.minutes} minutos de foco</strong><time>{formatDate(session.createdAt)} {formatTime(session.createdAt)}</time></li>)}</ul>
      </section>}
    </div>
  </main>;
}
