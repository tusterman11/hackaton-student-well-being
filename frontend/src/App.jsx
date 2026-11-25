import { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { BreaksView } from './components/BreaksView';
import { GardenView } from './components/GardenView';
import { SupportView } from './components/SupportView';
import { ChatView } from './components/ChatView';
import { GentleReminder } from './components/GentleReminder';
import { submitCheckin, logBreak, sendChatMessage } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [dailyNote, setDailyNote] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Oi! Posso ouvir como foi seu dia e pensar com você em uma pausa pequena. Não substituo apoio profissional. O que está passando pela sua cabeça?'
    }
  ]);
  const [isChatSending, setIsChatSending] = useState(false);
  const [aiTip, setAiTip] = useState(
    'Que tal olhar para longe por 20 segundos? Procure algo verde ou um pedaço de céu.'
  );
  const [todayBreaks, setTodayBreaks] = useState([
    { id: 1, type: 'water', label: 'Bebi água', time: '10:20' }
  ]);
  const [showReminder, setShowReminder] = useState(false);

  async function handleSaveCheckin(data) {
    const response = await submitCheckin(data);
    setTodayCheckin(response.checkin);
    if (response.tip) setAiTip(response.tip);
    if (response.showSupportAlert) {
      setActiveTab('support');
    }
  }

  async function handleAddBreak(type, label) {
    const saved = await logBreak(type);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setTodayBreaks((prev) => [{ id: saved.id, type, label, time: timeStr }, ...prev]);
  }

  async function handleSendChatMessage(message) {
    const history = chatMessages
      .slice(-10)
      .map(({ role, content }) => ({ role, content }));
    const userMessage = { id: `user-${Date.now()}`, role: 'user', content: message };

    setIsChatSending(true);
    setChatMessages((prev) => [...prev, userMessage]);

    try {
      const response = await sendChatMessage({
        message,
        history,
        mood: todayCheckin?.mood,
        energy: todayCheckin?.energy
      });
      setChatMessages((prev) => [...prev, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        supportLevel: response.supportLevel
      }]);
    } catch (error) {
      setChatMessages((prev) => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: error.message || 'Não consegui responder agora. Você pode abrir a seção Apoio para ver os contatos disponíveis.',
        supportLevel: 'suggested'
      }]);
    } finally {
      setIsChatSending(false);
    }
  }

  return (
    <div className="app-shell">
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

      {activeTab === 'breaks' && (
        <BreaksView todayBreaks={todayBreaks} onAddBreak={handleAddBreak} />
      )}

      {activeTab === 'garden' && (
        <GardenView todayCheckin={todayCheckin} todayBreaksCount={todayBreaks.length} />
      )}

      {activeTab === 'support' && <SupportView />}

      {activeTab === 'chat' && (
        <ChatView
          messages={chatMessages}
          isSending={isChatSending}
          onSendMessage={handleSendChatMessage}
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

      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}
