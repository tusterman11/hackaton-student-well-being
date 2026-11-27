import { useEffect, useMemo, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { BreaksView } from './components/BreaksView';
import { GardenView } from './components/GardenView';
import { SupportView } from './components/SupportView';
import { ChatView } from './components/ChatView';
import { GentleReminder } from './components/GentleReminder';
import { PersonalViews } from './components/PersonalViews';
import { AuthView } from './components/AuthView';
import {
  clearChatHistory,
  fetchChatHistory,
  fetchWeeklyHistory,
  fetchWellnessData,
  getCurrentSession,
  importLocalData,
  logBreak,
  logoutAccount,
  sendChatMessage,
  submitCheckin
} from './services/api';
import { readAppStorage } from './utils/appStorage';

const EMPTY_WELLNESS = {
  hydrationGoalMl: 2000,
  localImportAvailable: false,
  hydration: [],
  journal: [],
  habits: [],
  sleep: [],
  study: [],
  focusSessions: [],
  habitCompletions: []
};
const EMPTY_HISTORY = { checkins: [], pauses: [] };
const LEGACY_WELLNESS_KEY = 'entrepausas_wellness_data_v1';
const WELCOME_CHAT_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: 'Oi! Sou a Interlude, assistente do EntrePausas. Posso ouvir como foi seu dia e pensar com você em uma pausa pequena. Não substituo apoio profissional. O que está passando pela sua cabeça?'
};
const LOCAL_KEYS = [
  'entrepausas-hydration',
  'entrepausas-water-goal',
  'entrepausas-journal',
  'entrepausas-habits',
  'entrepausas-sleep',
  'entrepausas-study'
];

function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

function readLocalRecords() {
  const aggregateValue = localStorage.getItem(LEGACY_WELLNESS_KEY)
    ?? localStorage.getItem('pausa_wellness_data_v1');
  let aggregate = {};
  if (aggregateValue !== null) {
    aggregate = JSON.parse(aggregateValue);
    if (!aggregate || typeof aggregate !== 'object' || Array.isArray(aggregate)) {
      throw new Error('Os dados locais estão em formato inválido e foram preservados.');
    }
    for (const key of ['hydration', 'diary', 'habits', 'sleep', 'studySessions']) {
      if (aggregate[key] !== undefined && !Array.isArray(aggregate[key])) {
        throw new Error('Os dados locais estão em formato inválido e foram preservados.');
      }
    }
  }
  const readList = (key, aggregateKey) => {
    const value = readAppStorage(key);
    const result = value === null ? aggregate[aggregateKey] || [] : JSON.parse(value);
    if (!Array.isArray(result)) throw new Error(`Os dados locais de ${key} estão em formato inválido.`);
    return result;
  };
  const goal = readAppStorage('entrepausas-water-goal');
  const today = todayDateKey();
  const hydrationGoalMl = Number(aggregate.hydrationGoalMl ?? goal) || 2000;
  return {
    today,
    hydrationGoalMl: hydrationGoalMl >= 250 && hydrationGoalMl <= 10000 ? hydrationGoalMl : 2000,
    hydration: readList('entrepausas-hydration', 'hydration').map((item) => ({
      ...item,
      amount: item.amount ?? item.amountMl,
      date: legacyDate(item.date ?? item.createdAt)
    })),
    journal: readList('entrepausas-journal', 'diary').map((item) => ({
      ...item,
      title: item.title || '',
      body: item.body ?? item.text,
      date: legacyDate(item.date ?? item.createdAt)
    })),
    habits: readList('entrepausas-habits', 'habits').map((item) => ({
      ...item,
      label: item.label ?? item.title,
      done: item.done === undefined ? Boolean(item.completedDates?.includes(today)) : item.done,
      completedDates: item.completedDates || []
    })),
    sleep: readList('entrepausas-sleep', 'sleep').map((item) => ({
      ...item,
      bed: item.bed ?? item.bedtime,
      wake: item.wake ?? item.wakeTime,
      date: legacyDate(item.date ?? item.createdAt)
    })),
    study: readList('entrepausas-study', 'study'),
    focusSessions: aggregate.studySessions || []
  };
}

function hasLocalRecords(data) {
  return ['hydration', 'journal', 'habits', 'sleep', 'study', 'focusSessions']
    .some((key) => data[key].length > 0) || data.hydrationGoalMl !== 2000;
}

function legacyDate(value) {
  if (typeof value !== 'string'
    || /^\d{4}-\d{2}-\d{2}$/.test(value)
    || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function todayDateKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function clearLocalRecords() {
  LOCAL_KEYS.forEach((key) => {
    const legacyKey = key.replace(/^entrepausas-/, 'pausa-');
    localStorage.removeItem(key);
    localStorage.removeItem(legacyKey);
  });
  localStorage.removeItem('entrepausas-water-goal');
  localStorage.removeItem('pausa-water-goal');
  localStorage.removeItem(LEGACY_WELLNESS_KEY);
  localStorage.removeItem('pausa_wellness_data_v1');
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => readAppStorage('entrepausas-theme') === 'dark');
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [dataError, setDataError] = useState('');
  const [history, setHistory] = useState(EMPTY_HISTORY);
  const [wellnessData, setWellnessData] = useState(EMPTY_WELLNESS);
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [dailyNote, setDailyNote] = useState('');
  const [chatMessages, setChatMessages] = useState([WELCOME_CHAT_MESSAGE]);
  const [isChatSending, setIsChatSending] = useState(false);
  const [aiTip, setAiTip] = useState(
    'Que tal olhar para longe por 20 segundos? Procure algo verde ou um pedaço de céu.'
  );
  const [showReminder, setShowReminder] = useState(false);
  const [importPrompt, setImportPrompt] = useState(null);
  const [importBusy, setImportBusy] = useState(false);
  const [importError, setImportError] = useState('');

  const todayBreaks = useMemo(() => history.pauses
    .filter((pause) => isToday(pause.created_at))
    .map((pause) => ({
      id: pause.id,
      type: pause.type,
      label: pause.type === 'water' ? 'Bebi água' : pause.type === 'stretch' ? 'Me alonguei' : 'Fiz uma pausa curta',
      time: new Date(pause.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    })), [history.pauses]);

  async function loadAccountData() {
    const [nextHistory, nextWellness, nextChat] = await Promise.all([
      fetchWeeklyHistory(),
      fetchWellnessData(),
      fetchChatHistory()
    ]);
    setHistory(nextHistory);
    setWellnessData(nextWellness);
    const checkin = nextHistory.checkins.find((item) => isToday(item.created_at)) || null;
    setTodayCheckin(checkin);
    setDailyNote(checkin?.note || '');
    setChatMessages(nextChat.length > 0 ? nextChat : [WELCOME_CHAT_MESSAGE]);

    if (nextWellness.localImportAvailable) {
      const local = readLocalRecords();
      if (hasLocalRecords(local)) {
        setImportPrompt(local);
      } else {
        await importLocalData({}, true);
      }
    }
  }

  function updateWellnessCollection(collection, update) {
    setWellnessData((current) => ({
      ...current,
      [collection]: update(current[collection])
    }));
  }

  function retryAccountData() {
    setDataError('');
    loadAccountData().catch((error) => setDataError(error.message));
  }

  useEffect(() => {
    let active = true;
    getCurrentSession()
      .then(async (session) => {
        if (!active) return;
        if (session.user) {
          setUser(session.user);
          try {
            await loadAccountData();
          } catch (error) {
            setDataError(error.message);
          }
        }
      })
      .catch((error) => {
        if (active) setAuthError(error.message);
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    function expireSession() {
      setUser(null);
      setAuthError('Sua sessão expirou. Entre novamente para continuar.');
      setHistory(EMPTY_HISTORY);
      setWellnessData(EMPTY_WELLNESS);
      setTodayCheckin(null);
      setDailyNote('');
      setChatMessages([WELCOME_CHAT_MESSAGE]);
      setImportPrompt(null);
      setImportError('');
      setShowReminder(false);
      setDataError('');
      setActiveTab('home');
    }
    window.addEventListener('entrepausas:session-expired', expireSession);
    return () => window.removeEventListener('entrepausas:session-expired', expireSession);
  }, []);

  async function handleAuthenticated(session) {
    setUser(session.user);
    setAuthError('');
    setDataError('');
    try {
      await loadAccountData();
    } catch (error) {
      setDataError(error.message);
    }
  }

  async function handleImport(skip) {
    setImportBusy(true);
    setImportError('');
    try {
      await importLocalData(importPrompt || {}, skip);
      if (!skip) clearLocalRecords();
      setImportPrompt(null);
      const nextData = await fetchWellnessData();
      setWellnessData(nextData);
    } catch (error) {
      setImportError(error.message);
    } finally {
      setImportBusy(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutAccount();
      setUser(null);
      setHistory(EMPTY_HISTORY);
      setWellnessData(EMPTY_WELLNESS);
      setTodayCheckin(null);
      setDailyNote('');
      setChatMessages([WELCOME_CHAT_MESSAGE]);
      setImportPrompt(null);
      setDataError('');
      setActiveTab('home');
    } catch (error) {
      setDataError(error.message);
    }
  }

  async function handleSaveCheckin(data) {
    const response = await submitCheckin(data);
    setTodayCheckin(response.checkin);
    setDailyNote(data.note || '');
    setHistory((current) => ({
      ...current,
      checkins: [response.checkin, ...current.checkins.filter((item) => !isToday(item.created_at))]
    }));
    if (response.tip) setAiTip(response.tip);
    if (response.showSupportAlert) setActiveTab('support');
    return response;
  }

  async function handleAddBreak(type) {
    const saved = await logBreak(type);
    setHistory((current) => ({ ...current, pauses: [saved, ...current.pauses] }));
    return saved;
  }

  async function handleSendChatMessage(message) {
    const userMessage = { id: `user-${Date.now()}`, role: 'user', content: message };

    setIsChatSending(true);
    setChatMessages((current) => [...current, userMessage]);
    try {
      const response = await sendChatMessage({
        message,
        mood: todayCheckin?.mood,
        energy: todayCheckin?.energy
      });
      if (response.messages) {
        setChatMessages((current) => [
          ...current.filter((item) => item.id !== userMessage.id),
          ...response.messages
        ]);
      } else {
        setChatMessages((current) => [...current, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.reply,
          supportLevel: response.supportLevel
        }]);
      }
    } catch (error) {
      setChatMessages((current) => [...current, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: error.message || 'Não consegui responder agora. Você pode abrir a seção Apoio para ver os contatos disponíveis.',
        supportLevel: 'suggested'
      }]);
    } finally {
      setIsChatSending(false);
    }
  }

  async function handleClearChatHistory() {
    try {
      await clearChatHistory();
      setChatMessages([WELCOME_CHAT_MESSAGE]);
    } catch (error) {
      setDataError(error.message);
    }
  }

  if (authLoading) {
    return <div className="auth-shell" role="status">Carregando sua conta…</div>;
  }

  if (!user) {
    return (
      <AuthView
        onAuthenticated={handleAuthenticated}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((current) => {
          const next = !current;
          localStorage.setItem('entrepausas-theme', next ? 'dark' : 'light');
          return next;
        })}
        startupError={authError}
      />
    );
  }

  return (
    <div className="app-shell" data-theme={isDarkMode ? 'dark' : 'light'}>
      {dataError && <div className="app-error" role="alert"><span>{dataError}</span><button type="button" onClick={retryAccountData}>Tentar novamente</button></div>}
      {activeTab === 'home' && (
        <HomeView
          todayCheckin={todayCheckin}
          aiTip={aiTip}
          todayBreaks={todayBreaks}
          onSaveCheckin={handleSaveCheckin}
          note={dailyNote}
          onNoteChange={setDailyNote}
          onAddBreak={handleAddBreak}
          onNavigate={setActiveTab}
          onTriggerReminder={() => setShowReminder(true)}
        />
      )}
      {activeTab === 'breaks' && <BreaksView todayBreaks={todayBreaks} onAddBreak={handleAddBreak} />}
      {activeTab === 'garden' && <GardenView history={history} wellnessData={wellnessData} />}
      {activeTab === 'support' && <SupportView />}
      {['hydration', 'journal', 'habits', 'sleep', 'study'].includes(activeTab) && (
        <PersonalViews
          tab={activeTab}
          data={wellnessData}
          onCollectionChange={(collection, update) => updateWellnessCollection(collection, update)}
          onGoalChange={(hydrationGoalMl) => setWellnessData((current) => ({ ...current, hydrationGoalMl }))}
        />
      )}
      {activeTab === 'chat' && (
        <ChatView
          messages={chatMessages}
          isSending={isChatSending}
          onSendMessage={handleSendChatMessage}
          onClearHistory={handleClearChatHistory}
          onNavigate={setActiveTab}
        />
      )}
      {showReminder && (
        <GentleReminder
          onAccept={() => {
            setShowReminder(false);
            setActiveTab('breaks');
          }}
          onDismiss={() => setShowReminder(false)}
        />
      )}
      {importPrompt && (
        <div className="modal-backdrop" role="presentation">
          <section className="card import-dialog" role="dialog" aria-modal="true" aria-labelledby="import-title">
            <h2 id="import-title">Importar seus dados deste navegador?</h2>
            <p>Encontramos {importPrompt.hydration.length + importPrompt.journal.length + importPrompt.habits.length + importPrompt.sleep.length + importPrompt.study.length + importPrompt.focusSessions.length} registros locais e uma meta de água de {importPrompt.hydrationGoalMl} ml. Se importar, eles serão copiados para sua conta e a cópia local será removida somente após a confirmação de sucesso.</p>
            <p className="muted">Registros sem uma data confiável serão associados à data de hoje; datas de conclusão de hábitos disponíveis serão mantidas. Check-ins e pausas antigos do SQLite são anônimos e não serão atribuídos a esta conta.</p>
            <p className="auth-privacy">Se não importar, os dados permanecerão apenas neste navegador. Esta escolha vale para esta conta.</p>
            {importError && <p className="auth-error" role="alert">{importError}</p>}
            <div className="import-actions">
              <button type="button" className="btn-secondary" disabled={importBusy} onClick={() => handleImport(true)}>Manter somente no navegador</button>
              <button type="button" className="btn-primary" disabled={importBusy} onClick={() => handleImport(false)}>{importBusy ? 'Importando…' : 'Importar para minha conta'}</button>
            </div>
          </section>
        </div>
      )}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((current) => {
          const next = !current;
          localStorage.setItem('entrepausas-theme', next ? 'dark' : 'light');
          return next;
        })}
        userEmail={user.email}
        onLogout={handleLogout}
      />
    </div>
  );
}
