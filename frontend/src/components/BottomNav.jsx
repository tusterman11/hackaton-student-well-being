import { Home, Sprout, CalendarDays, Heart } from 'lucide-react';

export function BottomNav({ activeTab, onChangeTab }) {
  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'breaks', label: 'Pausas', icon: Sprout },
    { id: 'garden', label: 'Semana', icon: CalendarDays },
    { id: 'support', label: 'Apoio', icon: Heart }
  ];

  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChangeTab(item.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: isActive ? 'var(--bg-sage-dark)' : 'var(--text-muted)',
              fontWeight: isActive ? '700' : '500',
              fontSize: '0.75rem'
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
