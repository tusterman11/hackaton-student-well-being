import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Pause, Send, Sparkles } from 'lucide-react';

const QUICK_PROMPTS = [
  'Como posso fazer uma pausa agora?',
  'Me ajude a organizar meus estudos.',
  'Quero falar sobre como foi meu dia.'
];

export function ChatView({ messages, isSending, onSendMessage, onNavigate }) {
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  async function handleSubmit(event) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || isSending) return;
    setDraft('');
    await onSendMessage(message);
  }

  return (
    <div className="page-content chat-page">
      <header className="chat-header">
        <div className="chat-title-row">
          <span className="chat-avatar" aria-hidden="true"><MessageCircle size={21} /></span>
          <div>
            <h1>Conversa com a EntrePausas</h1>
            <p>Um espaço para falar do seu dia e pensar em pequenas pausas.</p>
          </div>
        </div>
        <p className="chat-privacy-note">
          Suas mensagens são enviadas ao servidor para gerar respostas com apoio de IA. Evite incluir nome completo, endereço ou outros dados pessoais.
        </p>
      </header>

      <section className="chat-messages" role="log" aria-label="Conversa" aria-live="polite">
        {messages.map((message) => (
          <article key={message.id} className={`chat-message chat-message-${message.role}`}>
            <p>{message.content}</p>
            {message.supportLevel === 'urgent' && (
              <div className="chat-support-links">
                <a href="tel:188">Ligar para o CVV — 188</a>
                <a href="tel:192">Emergência — SAMU 192</a>
              </div>
            )}
            {message.supportLevel === 'suggested' && (
              <div className="chat-support-links">
                <a href="tel:188">Conversar com o CVV — 188</a>
                <button type="button" onClick={() => onNavigate('support')}>
                  Ver outros contatos de apoio
                </button>
              </div>
            )}
          </article>
        ))}
        {isSending && <p className="chat-typing" role="status">A EntrePausas está respondendo…</p>}
        <div ref={messagesEndRef} />
      </section>

      <div className="chat-shortcuts">
        <div className="quick-prompts">
          <span className="field-hint"><Sparkles size={15} /> Perguntas para começar</span>
          {QUICK_PROMPTS.map((prompt) => (
            <button type="button" className="prompt-chip" key={prompt} onClick={() => onSendMessage(prompt)} disabled={isSending}>
              {prompt}
            </button>
          ))}
        </div>
        <button type="button" className="button button-secondary" onClick={() => onNavigate('breaks')}>
          <Pause size={17} /> Abrir opções de pausa
        </button>
      </div>

      <form className="chat-composer" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="chat-message">Sua mensagem</label>
        <textarea
          id="chat-message"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Conte como foi seu dia ou pergunte algo…"
          disabled={isSending}
        />
        <div className="chat-composer-footer">
          <span>{draft.length}/1000</span>
          <button type="submit" className="btn-primary" disabled={!draft.trim() || isSending}>
            <Send size={17} />
            {isSending ? 'Enviando…' : 'Enviar'}
          </button>
        </div>
      </form>

      <p className="chat-disclaimer">
        A EntrePausas não é profissional de saúde e não substitui atendimento médico ou psicológico. Em risco imediato, procure uma pessoa de confiança e um serviço de emergência.
      </p>
    </div>
  );
}
