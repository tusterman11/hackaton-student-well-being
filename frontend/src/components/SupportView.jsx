import { Building2, PhoneCall, ShieldAlert } from 'lucide-react';

export function SupportView() {
  return (
    <div className="view-stack">
      <header className="view-header">
        <p className="eyebrow">Apoio e cuidado real</p>
        <h1>Você não precisa passar por isso sozinho</h1>
        <p>EntrePausas não substitui atendimento profissional. Estes contatos oferecem apoio humano.</p>
      </header>

      <aside className="notice notice-privacy support-disclaimer">
        <ShieldAlert size={20} />
        <p>
          <strong>Privacidade:</strong> não há autenticação por conta. O identificador do navegador não garante isolamento seguro entre usuários e o localStorage não é criptografado. Para uso seguro com contas, são necessárias autenticação e autorização no backend. Evite usar em dispositivo compartilhado.
        </p>
      </aside>

      <section className="support-grid">
        <article className="card support-card">
          <div className="section-heading">
            <div><p className="eyebrow">Apoio emocional</p><h2>CVV — Centro de Valorização da Vida</h2></div>
            <span className="section-icon"><PhoneCall size={19} /></span>
          </div>
          <p>Converse com alguém pelo telefone 188. O atendimento é gratuito e funciona 24 horas.</p>
          <a href="tel:188" className="button button-primary"><PhoneCall size={17} /> Ligar 188</a>
        </article>

        <article className="card support-card">
          <div className="section-heading">
            <div><p className="eyebrow">Emergência</p><h2>SAMU — urgência e emergência</h2></div>
            <span className="section-icon"><PhoneCall size={19} /></span>
          </div>
          <p>Em perigo imediato ou emergência de saúde, ligue 192 ou procure um pronto atendimento.</p>
          <a href="tel:192" className="button button-primary"><PhoneCall size={17} /> Ligar 192</a>
        </article>

        <article className="card support-card">
          <div className="section-heading">
            <div><p className="eyebrow">Rede de cuidado</p><h2>Apoio no campus e SUS</h2></div>
            <span className="section-icon"><Building2 size={19} /></span>
          </div>
          <p>Procure a orientação educacional ou o acolhimento estudantil da sua unidade, ou uma UBS/CAPS da sua região.</p>
        </article>
      </section>
    </div>
  );
}
