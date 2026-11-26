import { useState } from 'react';
import { BookOpen, Droplets, Moon, NotebookPen, Plus, Target } from 'lucide-react';
import { readAppStorage } from '../utils/appStorage';

function useLocalList(key) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(readAppStorage(key) || '[]'); } catch { return []; }
  });
  function save(next) { setItems(next); localStorage.setItem(key, JSON.stringify(next)); }
  return [items, save];
}

function PageIntro({ eyebrow, title, children }) {
  return <header className="page-intro"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{children}</p></header>;
}

function Empty({ children }) { return <div className="empty-state">{children}</div>; }

export function PersonalViews({ tab }) {
  if (tab === 'hydration') return <HydrationView />;
  if (tab === 'journal') return <JournalView />;
  if (tab === 'habits') return <HabitsView />;
  if (tab === 'sleep') return <SleepView />;
  if (tab === 'study') return <StudyView />;
  return null;
}

function HydrationView() {
  const [logs, setLogs] = useLocalList('entrepausas-hydration');
  const [amount, setAmount] = useState(250);
  const [goal, setGoal] = useState(() => Number(readAppStorage('entrepausas-water-goal')) || 2000);
  const total = logs.reduce((sum, item) => sum + item.amount, 0);
  return <main className="page-content personal-page">
    <PageIntro eyebrow="Hábito de hidratação" title="Água, no seu ritmo">Registre o que beber e acompanhe seu próprio objetivo diário.</PageIntro>
    <section className="card water-summary"><div className="water-total"><span className="icon-tile"><Droplets /></span><div><span className="eyebrow">Registrado hoje</span><h2>{total} <small>ml</small></h2></div><strong>{Math.min(100, Math.round(total / Math.max(1, goal) * 100))}%</strong></div><div className="progress-track"><span style={{ width: `${Math.min(100, total / Math.max(1, goal) * 100)}%` }} /></div><p className="muted">Meta pessoal: {goal.toLocaleString('pt-BR')} ml</p><div className="water-cups">{Array.from({ length: Math.min(8, Math.ceil(goal / 250)) }, (_, i) => <span key={i} className={total >= (i + 1) * 250 ? 'filled' : ''}><Droplets size={17} /></span>)}</div><small className="muted">O indicador considera copos de 250 ml; registros parciais também contam no total.</small></section>
    <div className="two-column"><section className="card"><span className="eyebrow">Novo registro</span><h2>Quanto você bebeu?</h2><label htmlFor="water-amount">Quantidade em ml</label><div className="inline-input"><button type="button" onClick={() => setAmount((n) => Math.max(50, n - 50))}>−</button><input id="water-amount" type="number" min="1" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /><button type="button" onClick={() => setAmount((n) => n + 50)}>+</button></div><button className="btn-primary" onClick={() => setLogs([{ amount, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }, ...logs])}>Registrar água</button></section><section className="card"><span className="eyebrow">Sua meta</span><h2>Personalize seu objetivo</h2><label htmlFor="water-goal">Meta diária em ml</label><input id="water-goal" type="number" min="250" step="250" value={goal} onChange={(e) => { const value = Number(e.target.value); setGoal(value); localStorage.setItem('entrepausas-water-goal', String(value)); }} /><small className="muted">A meta é pessoal e editável; não é uma recomendação médica.</small></section></div>
    <section className="card"><span className="eyebrow">Últimos registros</span><h2>Histórico de água</h2>{logs.length ? <ul className="record-list">{logs.slice(0, 8).map((item, i) => <li key={`${item.time}-${i}`}><Droplets size={18} /> {item.amount} ml <time>{item.time}</time></li>)}</ul> : <Empty>Ainda não há água registrada.</Empty>}</section>
  </main>;
}

function JournalView() {
  const [entries, setEntries] = useLocalList('entrepausas-journal');
  const [title, setTitle] = useState(''); const [body, setBody] = useState('');
  function add(e) { e.preventDefault(); if (!body.trim()) return; setEntries([{ title: title.trim(), body: body.trim(), date: new Date().toLocaleDateString('pt-BR') }, ...entries]); setTitle(''); setBody(''); }
  return <main className="page-content personal-page"><PageIntro eyebrow="Espaço pessoal" title="Diário">Escreva sem pressa. Seus pensamentos não precisam estar organizados.</PageIntro><div className="notice"><BookOpen size={18} /> Os registros ficam neste navegador, sem login ou sincronização. Quem tiver acesso a este perfil do dispositivo também poderá vê-los.</div><form className="card form-stack" onSubmit={add}><span className="eyebrow">Novo registro</span><h2>O que está na sua cabeça?</h2><label htmlFor="journal-title">Título <span className="muted">(opcional)</span></label><input id="journal-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Uma palavra ou frase curta" maxLength={100} /><label htmlFor="journal-body">Seu registro</label><textarea id="journal-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Escreva livremente…" maxLength={5000} rows={6} /><div className="form-footer"><small className="muted">{body.length}/5000</small><button className="btn-primary" type="submit"><Plus size={16} /> Salvar registro</button></div></form><section className="card"><span className="eyebrow">Seus textos</span><h2>Registros anteriores <span className="count-pill">{entries.length}</span></h2>{entries.length ? <div className="entry-list">{entries.map((item, i) => <article key={`${item.date}-${i}`}><time>{item.date}</time>{item.title && <h3>{item.title}</h3>}<p>{item.body}</p></article>)}</div> : <Empty>Seus registros aparecerão aqui depois que você salvar o primeiro.</Empty>}</section></main>;
}

function HabitsView() {
  const [items, setItems] = useLocalList('entrepausas-habits'); const [draft, setDraft] = useState('');
  function add(value) { const label = (value || draft).trim(); if (!label) return; setItems([{ label, done: false }, ...items]); setDraft(''); }
  function toggle(i) { setItems(items.map((item, index) => index === i ? { ...item, done: !item.done } : item)); }
  const done = items.filter((item) => item.done).length;
  return <main className="page-content personal-page"><PageIntro eyebrow="Pequenos passos" title="Metas e hábitos">Escolha objetivos gentis e acompanhe seu progresso sem competição.</PageIntro><section className="card progress-card"><span className="icon-tile"><Target /></span><div><strong>{done} hábitos concluídos</strong><p className="muted">Seu progresso é pessoal; cada dia é uma nova oportunidade.</p></div><strong className="progress-percent">{items.length ? Math.round(done / items.length * 100) : 0}%</strong><div className="progress-track"><span style={{ width: `${items.length ? done / items.length * 100 : 0}%` }} /></div></section><section className="card"><span className="eyebrow">Nova meta</span><h2>O que você quer cultivar?</h2><form className="inline-input habit-form" onSubmit={(e) => { e.preventDefault(); add(); }}><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ex.: fazer uma pausa depois de estudar" maxLength={100} /><button className="btn-primary" type="submit"><Plus size={16} /> Adicionar</button></form><div className="suggestions">{['Beber água', 'Fazer uma pausa', 'Descansar os olhos', 'Organizar o tempo de estudo', 'Fazer respiração guiada'].map((label) => <button type="button" key={label} onClick={() => add(label)}>＋ {label}</button>)}</div></section><section className="card"><span className="eyebrow">Seu acompanhamento</span><h2>Metas pessoais <span className="count-pill">{items.length}</span></h2>{items.length ? <ul className="habit-list">{items.map((item, i) => <li key={`${item.label}-${i}`}><label><input type="checkbox" checked={item.done} onChange={() => toggle(i)} /><span className={item.done ? 'completed' : ''}>{item.label}</span></label></li>)}</ul> : <Empty>Adicione uma meta pequena para começar. Ela só fica salva neste navegador.</Empty>}</section><p className="disclaimer-text">Sem rankings e sem cobrança: este espaço apoia seus próprios objetivos.</p></main>;
}

function SleepView() {
  const [entries, setEntries] = useLocalList('entrepausas-sleep'); const [bed, setBed] = useState('23:00'); const [wake, setWake] = useState('07:00'); const [quality, setQuality] = useState(3);
  return <main className="page-content personal-page"><PageIntro eyebrow="Rotina de descanso" title="Como foi seu sono?">Registre horários e uma percepção pessoal da noite, sem diagnósticos.</PageIntro><form className="card form-stack" onSubmit={(e) => { e.preventDefault(); setEntries([{ bed, wake, quality, date: new Date().toLocaleDateString('pt-BR') }, ...entries]); }}><span className="eyebrow">Novo registro</span><h2><Moon size={20} /> Anote sua noite</h2><div className="two-column"><label>Horário de dormir<input type="time" value={bed} onChange={(e) => setBed(e.target.value)} /></label><label>Horário de acordar<input type="time" value={wake} onChange={(e) => setWake(e.target.value)} /></label></div><fieldset><legend>Como você percebeu a qualidade do sono?</legend><div className="rating-row">{['Muito difícil', 'Difícil', 'Mais ou menos', 'Boa', 'Muito boa'].map((label, i) => <button type="button" className={quality === i + 1 ? 'selected' : ''} key={label} onClick={() => setQuality(i + 1)}><strong>{i + 1}</strong><small>{label}</small></button>)}</div></fieldset><div className="form-footer"><small className="muted">A data de hoje será adicionada automaticamente.</small><button type="submit" className="btn-primary">Salvar registro</button></div></form><section className="card"><span className="eyebrow">Seu histórico</span><h2>Registros de sono <span className="count-pill">{entries.length}</span></h2>{entries.length ? <ul className="record-list">{entries.map((item, i) => <li key={`${item.date}-${i}`}><Moon size={18} /> {item.bed} – {item.wake}<span>Qualidade: {item.quality}/5</span><time>{item.date}</time></li>)}</ul> : <Empty>Seus registros aparecerão aqui. Não há análise médica nesta seção.</Empty>}</section><p className="disclaimer-text">O acompanhamento é apenas informativo e não substitui orientação de um profissional de saúde.</p></main>;
}

function StudyView() {
  const [items, setItems] = useLocalList('entrepausas-study'); const [subject, setSubject] = useState(''); const [day, setDay] = useState('Segunda-feira'); const [time, setTime] = useState('');
  return <main className="page-content personal-page"><PageIntro eyebrow="Organização gentil" title="Rotina de estudos">Organize seus estudos no seu ritmo.</PageIntro><div className="two-column study-layout"><form className="card form-stack" onSubmit={(e) => { e.preventDefault(); if (!subject.trim()) return; setItems([...items, { subject: subject.trim(), day, time }]); setSubject(''); }}><h2>Adicionar estudo</h2><label>Matéria ou atividade<input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex.: Matemática" /></label><div className="two-column"><label>Dia da semana<select value={day} onChange={(e) => setDay(e.target.value)}>{['Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado','Domingo'].map((d) => <option key={d}>{d}</option>)}</select></label><label>Horário<input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label></div><button className="btn-primary" type="submit"><Plus size={16} /> Adicionar à rotina</button></form><section className="card"><h2>Agenda <span className="count-pill">{items.length} estudos</span></h2>{items.length ? <ul className="record-list">{items.map((item, i) => <li key={`${item.subject}-${i}`}><BookOpen size={18} /><strong>{item.subject}</strong><span>{item.day} · {item.time || 'sem horário'}</span></li>)}</ul> : <Empty>Nenhum estudo planejado. Adicione uma atividade acima.</Empty>}</section></div></main>;
}
