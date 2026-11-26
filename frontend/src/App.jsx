import { useCallback, useEffect, useState } from 'react';
import { Moon, ShieldAlert, Sun } from 'lucide-react';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { BreaksView } from './components/BreaksView';
import { GardenView } from './components/GardenView';
import { SupportView } from './components/SupportView';
import { ChatView } from './components/ChatView';
import { GentleReminder } from './components/GentleReminder';
import { HydrationView } from './components/HydrationView';
import { JournalView } from './components/JournalView';
import { HabitsView } from './components/HabitsView';
import { SleepView } from './components/SleepView';
import { StudyView } from './components/StudyView';
import { fetchCheckins, fetchPauses, logBreak, sendChatMessage, submitCheckin } from './services/api';
import {
  EMPTY_WELLNESS_DATA,
  getLocalDateKey,
  getRecordDateKey,
  loadWellnessData,
  THEME_STORAGE_KEY,
  WELLNESS_STORAGE_KEY
} from './utils/wellnessData';

const BREAK_LABELS = {
  water: 'Bebi água',
  stretch: 'Alongamento',
  walk: 'Pausa curta'
};

function normalizePause(pause) {
  return { ...pause, label: pause.label || BREAK_LABELS[pause.type] || 'Pausa registrada' };
}

function readInitialState() {
  try {
    return { data: loadWellnessData(), error: '', canPersist: true };
  } catch (error) {
    return {
      data: { ...EMPTY_WELLNESS_DATA },
      error: `${error.message} Os dados locais não serão sobrescritos.`,
      canPersist: false
    };
  }
}

function readTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function ViewTitle({ activeTab }) {
  const titles = {
    home: 'EntrePausas',
    study: 'Rotina de estudos',
    garden: 'Sua semana',
    hydration: 'Hidratação',
    breaks: 'Pausas',
    journal: 'Diário',
    habits: 'Metas e hábitos',
    sleep: 'Sono',
    chat: 'Conversa',
    support: 'Apoio'
  };
  return <span className="topbar-title">{titles[activeTab] || 'EntrePausas'}</span>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [initialLocalState] = useState(readInitialState);
  const [localData, setLocalData] = useState(initialLocalState.data);
  const [storageError, setStorageError] = useState(initialLocalState.error);
  const [canPersist, setCanPersist] = useState(initialLocalState.canPersist);
  const [theme, setTheme] = useState(readTheme);
  const [checkins, setCheckins] = useState([]);
  const [pauses, setPauses] = useState([]);
  const [historyStatus, setHistoryStatus] = useState('loading');
  const [historyError, setHistoryError] = useState('');
  const [actionNotice, setActionNotice] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Oi! Sou a EntrePausas. Posso ouvir como foi seu dia e pensar com você em uma pausa pequena. Não substituo apoio profissional. O que está passando pela sua cabeça?'
    }
  ]);
  const [isChatSending, setIsChatSending] = useState(false);
  const [aiTip, setAiTip] = useState('');
  const [showReminder, setShowReminder] = useState(false);

  const refreshHistory = useCallback(async () => {
    setHistoryStatus('loading');
    setHistoryError('');
    try {
      const [savedCheckins, savedPauses] = await Promise.all([fetchCheckins(), fetchPauses()]);
      setCheckins(savedCheckins);
      setPauses(savedPauses.map(normalizePause));
      setHistoryStatus('ready');
    } catch (error) {
      setHistoryStatus('error');
      setHistoryError(error.message);
    }
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    if (!canPersist) return;
    try {
      localStorage.setItem(WELLNESS_STORAGE_KEY, JSON.stringify(localData));
      setStorageError('');
    } catch {
      setCanPersist(false);
      setStorageError('Não foi possível salvar os dados neste navegador. As alterações desta sessão podem não persistir.');
    }
  }, [canPersist, localData]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      setStorageError('Não foi possível salvar a preferência de tema neste navegador.');
    }
  }, [theme]);

  function updateLocalData(updater) {
    setLocalData((current) => updater(current));
  }

  async function handleSaveCheckin(data) {
    const response = await submitCheckin(data);
    if (!response?.checkin) {
      throw new Error('O servidor não confirmou o check-in. Tente novamente.');
    }
    setCheckins((current) => [
      response.checkin,
      ...current.filter((entry) => entry.id !== response.checkin.id)
    ]);
    setAiTip(typeof response.tip === 'string' ? response.tip : '');
    setActionNotice({ kind: 'success', text: 'Check-in salvo no servidor.' });
    if (response.showSupportAlert) setActiveTab('support');
  }

  async function handleAddBreak(type, label) {
    const saved = await logBreak(type);
    const pause = normalizePause({ ...saved, type, label: label || BREAK_LABELS[type] });
    setPauses((current) => [pause, ...current.filter((entry) => entry.id !== pause.id)]);
    setActionNotice({ kind: 'success', text: 'Pausa salva no histórico do servidor.' });
    return pause;
  }

  function handleRegisterWater(amountMl) {
    const entry = {
      id: globalThis.crypto?.randomUUID?.() || `water-${Date.now()}`,
      amountMl,
      createdAt: new Date().toISOString()
    };
    updateLocalData((data) => ({ ...data, hydration: [entry, ...data.hydration] }));
    setActionNotice({ kind: 'success', text: `${amountMl} ml registrados somente neste navegador.` });
  }

  function handleCompleteStudy(minutes) {
    const session = { id: `study-${Date.now()}`, minutes, createdAt: new Date().toISOString() };
    updateLocalData((data) => ({ ...data, studySessions: [session, ...data.studySessions] }));
    setActionNotice({ kind: 'success', text: 'Período de foco registrado neste navegador. Que tal fazer uma pausa?' });
    setShowReminder(true);
  }

  async function handleSendChatMessage(message) {
    const history = chatMessages
      .filter((item) => item.role === 'user' || item.role === 'assistant')
      .slice(-10)
      .map(({ role, content }) => ({ role, content }));
    const userMessage = { id: `user-${Date.now()}`, role: 'user', content: message };

    setIsChatSending(true);
    setChatMessages((current) => [...current, userMessage]);
    try {
      const response = await sendChatMessage({
        message,
        history,
        mood: todayCheckin?.mood,
        energy: todayCheckin?.energy
      });
      if (typeof response?.reply !== 'string' || !response.reply.trim()) {
        throw new Error('O serviço de conversa não retornou uma resposta válida. Tente novamente.');
      }
      setChatMessages((current) => [...current, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        supportLevel: response.supportLevel
      }]);
    } catch (error) {
      setChatMessages((current) => [...current, {
        id: `error-${Date.now()}`,
        role: 'error',
        content: error.message || 'Não foi possível conectar à conversa. Tente novamente ou procure os contatos na área de Apoio.'
      }]);
    } finally {
      setIsChatSending(false);
    }
  }

  const todayKey = getLocalDateKey();
  const todayCheckin = checkins.find((entry) => (
    getRecordDateKey(entry.created_at || entry.createdAt) === todayKey
  )) || null;
  const todayPauses = pauses.filter((entry) => (
    entry.type !== 'water' && getRecordDateKey(entry.created_at || entry.createdAt) === todayKey
  ));
  const todayWaterMl = localData.hydration
    .filter((entry) => getRecordDateKey(entry.createdAt) === todayKey)
    .reduce((total, entry) => total + entry.amountMl, 0);

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-brand">
            <span className="brand-mark" aria-hidden="true">e</span>
            <ViewTitle activeTab={activeTab} />
          </div>
          <details className="privacy-details">
            <summary><ShieldAlert size={16} /> Privacidade e dados</summary>
            <p>Não há autenticação por conta. O identificador do navegador não garante isolamento seguro entre usuários, e os dados em localStorage não são criptografados. Autenticação e autorização no backend são necessárias para uso seguro com contas de usuário.</p>
          </details>
          <button type="button" className="topbar-theme-toggle" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}>
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </header>

        <main className="main-content">
          <div className="content-inner">
            {storageError && <div className="notice notice-error" role="alert">{storageError}</div>}
            {actionNotice && (
              <div className={`notice ${actionNotice.kind === 'error' ? 'notice-error' : 'notice-success'}`} role={actionNotice.kind === 'error' ? 'alert' : 'status'}>
                <span>{actionNotice.text}</span>
                <button type="button" className="notice-close" aria-label="Fechar aviso" onClick={() => setActionNotice(null)}>×</button>
              </div>
            )}

            {activeTab === 'home' && (
              <HomeView
                todayCheckin={todayCheckin}
                aiTip={aiTip}
                todayBreaks={todayPauses}
                todayWaterMl={todayWaterMl}
                waterGoalMl={localData.hydrationGoalMl}
                checkins={checkins}
                historyStatus={historyStatus}
                historyError={historyError}
                onRetryHistory={refreshHistory}
                onSaveCheckin={handleSaveCheckin}
                onAddWater={handleRegisterWater}
                onNavigate={setActiveTab}
                onTriggerReminder={() => setShowReminder(true)}
              />
            )}
            {activeTab === 'study' && (
              <StudyView localData={localData} onCompleteSession={handleCompleteStudy} />
            )}
            {activeTab === 'garden' && (
              <GardenView
                checkins={checkins}
                pauses={pauses}
                localData={localData}
                historyStatus={historyStatus}
                historyError={historyError}
                onRetryHistory={refreshHistory}
              />
            )}
            {activeTab === 'hydration' && (
              <HydrationView
                localData={localData}
                onUpdateLocalData={updateLocalData}
                onRegisterWater={handleRegisterWater}
                serverWaterRecords={pauses.filter((pause) => pause.type === 'water')}
              />
            )}
            {activeTab === 'breaks' && (
              <BreaksView
                todayBreaks={todayPauses}
                onAddBreak={handleAddBreak}
              />
            )}
            {activeTab === 'journal' && (
              <JournalView localData={localData} onUpdateLocalData={updateLocalData} />
            )}
            {activeTab === 'habits' && (
              <HabitsView localData={localData} onUpdateLocalData={updateLocalData} />
            )}
            {activeTab === 'sleep' && (
              <SleepView localData={localData} onUpdateLocalData={updateLocalData} />
            )}
            {activeTab === 'chat' && (
              <ChatView
                messages={chatMessages}
                isSending={isChatSending}
                onSendMessage={handleSendChatMessage}
                onNavigate={setActiveTab}
              />
            )}
            {activeTab === 'support' && <SupportView />}
          </div>
        </main>
      </div>

      {showReminder && (
        <GentleReminder
          onAccept={() => {
            setShowReminder(false);
            setActiveTab('breaks');
          }}
          onDismiss={() => setShowReminder(false)}
        />
      )}
    </div>
  );
}
