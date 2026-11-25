import { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { BreaksView } from './components/BreaksView';
import { GardenView } from './components/GardenView';
import { SupportView } from './components/SupportView';
import { GentleReminder } from './components/GentleReminder';
import { submitCheckin, logBreak } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [dailyNote, setDailyNote] = useState('');
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
