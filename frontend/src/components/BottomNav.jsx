import { useState } from 'react';
import {
  CalendarDays, Droplets, Heart, Home, MessageCircle,
  Moon, Sun, Sprout, Bed, Menu, X, LogOut, Target
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'breaks', label: 'Pausas', icon: Sprout },
  { id: 'garden', label: 'Semana', icon: CalendarDays },
  { id: 'habits', label: 'Metas', icon: Target },
  { id: 'hydration', label: 'Água', icon: Droplets },
  { id: 'sleep', label: 'Sono', icon: Bed },
  { id: 'chat', label: 'Conversa', icon: MessageCircle },
  { id: 'support', label: 'Apoio', icon: Heart },
];

export function BottomNav({ activeTab, onChangeTab, isDarkMode, onToggleTheme, userEmail, onLogout }) {
  const [expanded, setExpanded] = useState(false);

  return (
      <nav
        className={`side-nav ${expanded ? 'is-expanded' : ''}`}
        aria-label="Navegação principal"
        onPointerEnter={(event) => { if (event.pointerType === 'mouse') setExpanded(true); }}
        onPointerLeave={(event) => { if (event.pointerType === 'mouse') setExpanded(false); }}
      >
        <button
          className="nav-menu-button"
          aria-label={expanded ? 'Recolher menu' : 'Expandir menu'}
          type="button"
          onClick={() => setExpanded((value) => !value)}
        >{expanded ? <X size={20} /> : <Menu size={20} />}</button>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`nav-item ${activeTab === id ? 'active' : ''}`} type="button" aria-label={label} aria-current={activeTab === id ? 'page' : undefined} title={expanded ? undefined : label} onClick={() => { onChangeTab(id); setExpanded(false); }}>
            <Icon size={19} strokeWidth={1.8} /><span>{label}</span>
          </button>
        ))}
        <button className="nav-item account-logout" type="button" aria-label={`Sair da conta ${userEmail}`} title={expanded ? undefined : 'Sair'} onClick={onLogout}>
          <LogOut size={19} strokeWidth={1.8} /><span>Sair · {userEmail}</span>
        </button>
        <button className="nav-item theme-toggle" type="button" aria-label={isDarkMode ? 'Ativar tema claro' : 'Ativar tema escuro'} aria-pressed={isDarkMode} title={isDarkMode ? 'Tema claro' : 'Tema escuro'} onClick={onToggleTheme}>
          {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}<span>{isDarkMode ? 'Tema claro' : 'Tema escuro'}</span>
        </button>
      </nav>
  );
}
