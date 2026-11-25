import { PhoneCall, Building2, ShieldAlert } from 'lucide-react';

export function SupportView() {
  return (
    <main className="page-content">
      <h1 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>Apoio e cuidado real</h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Se o dia estiver pesado demais, você não precisa carregar tudo sozinho.
      </p>

      {/* Aviso explícito de limites */}
      <div
        className="card"
        style={{
          backgroundColor: 'var(--bg-amber-soft)',
          borderColor: '#f5d0a9',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start'
        }}
      >
        <ShieldAlert size={22} color="var(--accent-orange-hover)" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
          <strong>Importante:</strong> EntrePausas apoia pausas e hábitos diários. Ela{' '}
          <strong>não</strong> realiza diagnóstico, terapia, aconselhamento médico ou atendimento de
          emergência.
        </p>
      </div>

      {/* Contatos Reais */}
      <section className="card">
        <h2 style={{ fontSize: '1rem', marginBottom: '4px' }}>CVV — Centro de Valorização da Vida</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Apoio emocional e prevenção do suicídio. Atendimento voluntário, gratuito e sigiloso 24h
          por telefone ou chat.
        </p>
        <a
          href="tel:188"
          className="btn-warm"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            textDecoration: 'none'
          }}
        >
          <PhoneCall size={18} /> Ligar 188 (Gratuito 24h)
        </a>
      </section>

      <section className="card">
        <h2 style={{ fontSize: '1rem', marginBottom: '4px' }}>SAMU — Urgência e Emergência</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Em situações de crise aguda ou risco imediato à saúde física ou mental.
        </p>
        <a
          href="tel:192"
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            textDecoration: 'none'
          }}
        >
          <PhoneCall size={18} /> Ligar 192
        </a>
      </section>

      <section className="card">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <Building2 size={20} color="var(--bg-sage-dark)" style={{ flexShrink: 0 }} />
          <div>
            <h2 style={{ fontSize: '0.98rem', marginBottom: '4px' }}>
              Apoio no Campus e Rede Pública (SUS)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Procure a orientação educacional ou acolhimento estudantil da sua unidade Senac, ou a
              UBS / CAPS mais próximo da sua região para atendimento profissional gratuito.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
