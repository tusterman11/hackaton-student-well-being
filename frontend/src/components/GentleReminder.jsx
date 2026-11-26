import { Coffee, X } from 'lucide-react';

export function GentleReminder({ onAccept, onDismiss }) {
  return (
    <div className="reminder-backdrop" onClick={onDismiss}>
      <section
        className="card reminder-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reminder-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="icon-button reminder-close" onClick={onDismiss} aria-label="Fechar lembrete">
          <X size={20} />
        </button>
        <span className="section-icon"><Coffee size={21} /></span>
        <p className="eyebrow">Lembrete gentil</p>
        <h2 id="reminder-title">Que tal uma pausa rápida?</h2>
        <p>Se fizer sentido agora, respire um pouco, beba água ou alongue os ombros por um instante.</p>
        <div className="form-actions">
          <button type="button" className="button button-primary" onClick={onAccept}>Ver opções de pausa</button>
          <button type="button" className="button button-quiet" onClick={onDismiss}>Agora não</button>
        </div>
      </section>
    </div>
  );
}
