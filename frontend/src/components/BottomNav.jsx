import { useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  Heart,
  Home,
  Menu,
  MessageCircle,
  Moon,
  Pause,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Timer,
  Droplets,
  Sprout,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'study', label: 'Rotina de estudos', icon: Timer },
  { id: 'garden', label: 'Semana', icon: CalendarDays },
  { id: 'hydration', label: 'Hidratação', icon: Droplets },
  { id: 'breaks', label: 'Pausas', icon: Pause },
  { id: 'journal', label: 'Diário', icon: BookOpen },
  { id: 'habits', label: 'Metas e hábitos', icon: Sprout },
  { id: 'sleep', label: 'Sono', icon: Moon },
  { id: 'chat', label: 'Conversa', icon: MessageCircle },
  { id: 'support', label: 'Apoio', icon: Heart }
];

function NavigationItems({ activeTab, onChangeTab, closeMenu }) {
  return NAV_ITEMS.map((item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        className={`nav-item${isActive ? ' is-active' : ''}`}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => {
          onChangeTab(item.id);
          closeMenu();
        }}
        title={item.label}
      >
        <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
        <span className="nav-label">{item.label}</span>
      </button>
    );
  });
}

export function BottomNav({ activeTab, onChangeTab, theme, onToggleTheme }) {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMenu = () => setMobileOpen(false);
  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <>
      <aside className={`sidebar${expanded ? ' is-expanded' : ''}`} aria-label="Menu do aplicativo">
        <div className="sidebar-brand">
          <span className="brand-mark" aria-hidden="true">e</span>
          <span className="sidebar-brand-name">EntrePausas</span>
          <button
            type="button"
            className="sidebar-expand"
            onClick={() => setExpanded((value) => !value)}
            aria-label={expanded ? 'Recolher menu' : 'Expandir menu'}
            title={expanded ? 'Recolher menu' : 'Expandir menu'}
          >
            {expanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>
        <nav className="sidebar-nav" aria-label="Navegação principal">
          <NavigationItems
            activeTab={activeTab}
            onChangeTab={onChangeTab}
            closeMenu={closeMenu}
          />
        </nav>
        <button type="button" className="theme-toggle" onClick={onToggleTheme}>
          <ThemeIcon size={19} aria-hidden="true" />
          <span className="nav-label">{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</span>
        </button>
      </aside>

      <button
        type="button"
        className="mobile-menu-trigger"
        aria-label={mobileOpen ? 'Fechar menu de funções' : 'Abrir menu de funções'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((value) => !value)}
      >
        {mobileOpen ? <X size={23} /> : <Menu size={23} />}
      </button>

      {mobileOpen && (
        <div className="mobile-menu-backdrop" onClick={closeMenu}>
          <nav
            className="mobile-menu"
            aria-label="Navegação principal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mobile-menu-header">
              <span>EntrePausas</span>
              <button type="button" aria-label="Fechar menu" onClick={closeMenu}>
                <X size={20} />
              </button>
            </div>
            <NavigationItems
              activeTab={activeTab}
              onChangeTab={onChangeTab}
              closeMenu={closeMenu}
            />
            <button type="button" className="theme-toggle" onClick={onToggleTheme}>
              <ThemeIcon size={19} aria-hidden="true" />
              <span>{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</span>
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
