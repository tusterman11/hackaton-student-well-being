import { useEffect, useState } from 'react';
import { BookOpen, Clock3, Plus, Trash2 } from 'lucide-react';
import './StudyView.css';

const STORAGE_KEY = 'pausa-leve-study-sessions';

const DAYS = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' }
];

function isStudySession(value) {
  return value
    && typeof value.id === 'string'
    && typeof value.subject === 'string'
    && DAYS.some((day) => day.value === value.day)
    && typeof value.time === 'string'
    && typeof value.completed === 'boolean';
}

function readStudySessions() {
  try {
    const storedSessions = window.localStorage.getItem(STORAGE_KEY);
    if (!storedSessions) return { sessions: [], error: '' };

    const parsedSessions = JSON.parse(storedSessions);
    if (!Array.isArray(parsedSessions) || !parsedSessions.every(isStudySession)) {
      throw new Error('Os dados salvos da rotina de estudos têm um formato inválido.');
    }

    return { sessions: parsedSessions, error: '' };
  } catch (error) {
    console.error('Não foi possível carregar a rotina de estudos salva.', error);
    return {
      sessions: [],
      error: 'Não foi possível carregar a rotina salva neste navegador.'
    };
  }
}

export function StudyView() {
  const [initialData] = useState(readStudySessions);
  const [sessions, setSessions] = useState(initialData.sessions);
  const [selectedDay, setSelectedDay] = useState('monday');
  const [subject, setSubject] = useState('');
  const [time, setTime] = useState('');
  const [storageError, setStorageError] = useState(initialData.error);

  useEffect(() => {
    if (storageError) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Não foi possível salvar a rotina de estudos.', error);
      setStorageError('Não foi possível salvar as alterações neste navegador.');
    }
  }, [sessions, storageError]);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedSubject = subject.trim();
    if (!trimmedSubject || !time) return;

    setSessions((currentSessions) => [
      ...currentSessions,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        subject: trimmedSubject,
        day: selectedDay,
        time,
        completed: false
      }
    ]);
    setSubject('');
    setTime('');
  }

  const selectedDayLabel = DAYS.find((day) => day.value === selectedDay).label;
  const daySessions = sessions
    .filter((session) => session.day === selectedDay)
    .sort((first, second) => first.time.localeCompare(second.time));

  return (
    <main className="page-content study-page">
      <header className="study-header">
        <div className="study-title-icon" aria-hidden="true">
          <BookOpen size={22} />
        </div>
        <div>
          <h1>Rotina de estudos</h1>
          <p>Organize seus estudos no seu ritmo.</p>
        </div>
      </header>

      {storageError && (
        <p className="study-storage-error" role="alert">
          {storageError}
        </p>
      )}

      <section className="card study-card">
        <h2>Adicionar estudo</h2>
        <form className="study-form" onSubmit={handleSubmit}>
          <label>
            Matéria ou atividade
            <input
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Ex.: Matemática"
              maxLength={80}
              required
            />
          </label>

          <div className="study-form-row">
            <label>
              Dia da semana
              <select
                value={selectedDay}
                onChange={(event) => setSelectedDay(event.target.value)}
              >
                {DAYS.map((day) => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </label>

            <label>
              Horário
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                required
              />
            </label>
          </div>

          <button type="submit" className="btn-primary study-add-button">
            <Plus size={18} />
            Adicionar à rotina
          </button>
        </form>
      </section>

      <section className="card study-card" aria-labelledby="study-agenda-title">
        <div className="study-agenda-heading">
          <div>
            <h2 id="study-agenda-title">Agenda</h2>
            <p>{selectedDayLabel}</p>
          </div>
          <span className="study-session-count">
            {daySessions.length} {daySessions.length === 1 ? 'estudo' : 'estudos'}
          </span>
        </div>

        {daySessions.length === 0 ? (
          <p className="study-empty-state">
            Nenhum estudo planejado para este dia. Adicione uma atividade acima.
          </p>
        ) : (
          <ul className="study-session-list">
            {daySessions.map((session) => (
              <li className="study-session" key={session.id}>
                <input
                  type="checkbox"
                  checked={session.completed}
                  onChange={() => setSessions((currentSessions) => currentSessions.map((item) => (
                    item.id === session.id
                      ? { ...item, completed: !item.completed }
                      : item
                  )))}
                  aria-label={`Marcar ${session.subject} como concluído`}
                />
                <div className={`study-session-details${session.completed ? ' is-completed' : ''}`}>
                  <strong>{session.subject}</strong>
                  <span><Clock3 size={14} /> {session.time}</span>
                </div>
                <button
                  type="button"
                  className="study-remove-button"
                  onClick={() => setSessions((currentSessions) => (
                    currentSessions.filter((item) => item.id !== session.id)
                  ))}
                  aria-label={`Remover ${session.subject}`}
                >
                  <Trash2 size={17} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
