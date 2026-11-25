import { Sprout } from 'lucide-react';

const MOCK_WEEK = [
  { day: 'Qui', pauses: 2, hasCheckin: true },
  { day: 'Sex', pauses: 1, hasCheckin: true },
  { day: 'Sáb', pauses: 0, hasCheckin: false },
  { day: 'Dom', pauses: 2, hasCheckin: true },
  { day: 'Seg', pauses: 3, hasCheckin: true },
  { day: 'Ter', pauses: 1, hasCheckin: true }
];

export function GardenView({ todayCheckin, todayBreaksCount }) {
  const days = [
    ...MOCK_WEEK,
    {
      day: 'Hoje',
      pauses: todayBreaksCount,
      hasCheckin: Boolean(todayCheckin)
    }
  ];

  const totalCheckins = days.filter((d) => d.hasCheckin).length;
  const totalPauses = days.reduce((acc, d) => acc + d.pauses, 0);

  return (
    <main className="page-content">
      <h1 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Seu jardim da semana</h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
        Cada pausa rega um pouco o seu dia. Visível apenas para você.
      </p>

      {/* Gráfico visual das plantinhas */}
      <section className="card">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px',
            alignItems: 'end',
            height: '150px',
            paddingTop: '16px'
          }}
        >
          {days.map((d) => {
            const barHeight = Math.min(100, 24 + d.pauses * 24);
            return (
              <div
                key={d.day}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sprout
                  size={d.pauses > 0 ? 22 : 16}
                  color={d.pauses > 0 ? 'var(--accent-green)' : 'var(--text-muted)'}
                />
                <div
                  style={{
                    width: '100%',
                    height: `${barHeight}px`,
                    backgroundColor: d.pauses > 0 ? 'var(--bg-sage-soft)' : 'var(--bg-app)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--bg-sage-dark)'
                  }}
                >
                  {d.pauses}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{d.day}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Resumo simples sem pressão */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <strong style={{ fontSize: '1.5rem', color: 'var(--bg-sage-dark)', display: 'block' }}>
            {totalCheckins}
          </strong>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            check-ins na semana
          </span>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <strong style={{ fontSize: '1.5rem', color: 'var(--accent-green)', display: 'block' }}>
            {totalPauses}
          </strong>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            pausas registradas
          </span>
        </div>
      </div>

      <p className="disclaimer-text">
        Seus registros ficam isolados apenas neste dispositivo para sua privacidade.
      </p>
    </main>
  );
}
