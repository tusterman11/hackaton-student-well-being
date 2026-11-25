import { Coffee, X } from 'lucide-react';

export function GentleReminder({ onAccept, onDismiss }) {
  return (
    <div
      role="dialog"
      aria-label="Lembrete gentil de pausa"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(31, 46, 40, 0.45)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '400px',
          marginBottom: '12px',
          position: 'relative'
        }}
      >
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar lembrete"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Coffee size={22} color="var(--accent-orange)" />
          <h2 style={{ fontSize: '1.05rem' }}>Que tal uma pausa rápida?</h2>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Você já está focado há algum tempo. Se fizer sentido agora, beba um pouco de água ou
          estique os ombros por 1 minuto.
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn-primary" onClick={onAccept}>
            Registrar pausa
          </button>
          <button
            type="button"
            onClick={onDismiss}
            style={{
              padding: '12px 16px',
              borderRadius: '999px',
              border: '1px solid var(--border-light)',
              backgroundColor: '#fff',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
