import {
  BookOpen,
  CalendarDays,
  Heart,
  Home,
  Menu,
  MessageCircle,
  Sprout,
  X
} from 'lucide-react';

export function BottomNav({ activeTab, onChangeTab, isExpanded, onExpandedChange }) {
  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'breaks', label: 'Pausas', icon: Sprout },
    { id: 'garden', label: 'Semana', icon: CalendarDays },
    { id: 'study', label: 'Estudos', icon: BookOpen },
    { id: 'chat', label: 'Conversa', icon: MessageCircle },
    { id: 'support', label: 'Apoio', icon: Heart }
  ];

  function renderNavItems() {
    return navItems.map((item) => {
      const Icon = item.icon;
      const isActive = activeTab === item.id;
      return (
        <button
          key={item.id}
          type="button"
          className={`app-navigation-item${isActive ? ' is-active' : ''}`}
          onClick={() => {
            onChangeTab(item.id);
            if (window.matchMedia('(max-width: 899px)').matches) {
              onExpandedChange(false);
            }
          }}
          aria-current={isActive ? 'page' : undefined}
        >
          <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
          <span>{item.label}</span>
        </button>
      );
    });
  }

  return (
    <nav
      className={`app-navigation${isExpanded ? ' is-expanded' : ''}`}
      aria-label="Menu de navegação"
    >
      <button
        type="button"
        className="app-navigation-toggle"
        onClick={() => onExpandedChange(!isExpanded)}
        aria-label={isExpanded ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={isExpanded}
        aria-controls="app-navigation-menu"
      >
        {isExpanded ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className="app-navigation-menu" id="app-navigation-menu">
        {renderNavItems()}
      </div>
    </nav>
  );
}
