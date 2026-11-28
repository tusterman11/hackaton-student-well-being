import { useEffect, useState } from 'react';
import { Eye, EyeOff, Leaf, Moon, Sun } from 'lucide-react';
import {
  confirmPasswordReset,
  loginAccount,
  registerAccount,
  resendVerificationEmail,
  requestPasswordReset,
  verifyEmail
} from '../services/api';

export function AuthView({ onAuthenticated, isDarkMode, onToggleTheme, startupError }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState(startupError || '');
  const [errorCode, setErrorCode] = useState('');
  const [canResendVerification, setCanResendVerification] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(url.hash.slice(1));
    const verificationToken = hashParams.get('verify');
    const resetToken = hashParams.get('reset');
    if (resetToken) {
      setMode('reset');
      setResetToken(resetToken);
      window.history.replaceState({}, '', `${url.pathname}${url.search}`);
      return;
    }
    if (!verificationToken) return undefined;

    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
    setMode('verify');
    setVerificationToken(verificationToken);
    return undefined;
  }, []);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setErrorCode('');
    setNotice('');
    try {
      if (mode === 'register') {
        const result = await registerAccount(email);
        setNotice(result.message);
        setCanResendVerification(true);
        setMode('login');
      } else if (mode === 'login') {
        const result = await loginAccount(email, password);
        setCanResendVerification(false);
        onAuthenticated(result);
      } else if (mode === 'verify') {
        if (password !== confirmation) throw new Error('As senhas não coincidem.');
        if (!verificationToken) throw new Error('O link de confirmação é inválido ou expirou.');
        const result = await verifyEmail(verificationToken, password);
        setNotice(result.message);
        setMode('login');
        setPassword('');
        setConfirmation('');
      } else if (mode === 'forgot') {
        const result = await requestPasswordReset(email);
        setNotice(result.message);
      } else if (mode === 'reset') {
        if (password !== confirmation) throw new Error('As senhas não coincidem.');
        if (!resetToken) throw new Error('O link de redefinição é inválido ou expirou.');
        const result = await confirmPasswordReset(resetToken, password);
        setNotice(result.message);
        setMode('login');
        setPassword('');
        setConfirmation('');
      }
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível concluir a solicitação.');
      setErrorCode(requestError.code || '');
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification() {
    setBusy(true);
    setError('');
    setErrorCode('');
    setNotice('');
    try {
      const result = await resendVerificationEmail(email);
      setNotice(result.message);
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível reenviar o link.');
      setErrorCode(requestError.code || '');
    } finally {
      setBusy(false);
    }
  }

  const titles = {
    login: 'Entre na sua conta',
    register: 'Crie sua conta',
    verify: 'Confirme seu e-mail',
    forgot: 'Recuperar senha',
    reset: 'Defina uma nova senha'
  };
  const descriptions = {
    login: 'Acesse seus registros pessoais de bem-estar.',
    register: 'Vamos enviar um link para você confirmar seu e-mail e criar sua senha.',
    verify: 'Seu e-mail será confirmado quando você definir uma senha para a conta.',
    forgot: 'Enviaremos um link para o e-mail, se houver uma conta.',
    reset: 'Escolha uma senha longa que você não use em outros serviços.'
  };

  return (
    <div className="auth-shell" data-theme={isDarkMode ? 'dark' : 'light'}>
      <aside className="auth-visual">
        <div className="auth-visual-hill auth-visual-hill-back" aria-hidden="true" />
        <div className="auth-visual-hill auth-visual-hill-front" aria-hidden="true" />
        <div className="auth-visual-copy">
          <p>Cuide do seu ritmo. Um passo de cada vez.</p>
          <span>Um lembrete gentil do EntrePausas</span>
        </div>
      </aside>
      <section className="auth-panel">
        <main className="auth-card">
          <div className="auth-topline">
            <div className="auth-brand"><span><Leaf size={18} /></span> EntrePausas</div>
            <button type="button" className="auth-theme-toggle" onClick={onToggleTheme} aria-label={isDarkMode ? 'Ativar tema claro' : 'Ativar tema escuro'}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <p className="eyebrow">Bem-estar no campus</p>
          <h1>{titles[mode]}</h1>
          <p className="muted">{descriptions[mode]}</p>

          {notice && <p className="auth-notice" role="status">{notice}</p>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {(errorCode === 'EMAIL_NOT_VERIFIED' || canResendVerification) && mode === 'login' && (
            <button type="button" className="auth-resend" onClick={resendVerification} disabled={busy}>
              Reenviar link de confirmação
            </button>
          )}

          <form className="form-stack auth-form" onSubmit={submit}>
            {mode !== 'reset' && mode !== 'verify' && (
              <label htmlFor="account-email">
                E-mail
                <input
                  id="account-email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
            )}
            {mode !== 'forgot' && mode !== 'register' && (
              <div className="auth-password-group">
                <label htmlFor="account-password">{mode === 'reset' ? 'Nova senha' : 'Senha'}</label>
                <div className="auth-password-input">
                  <input
                    id="account-password"
                    type={mode === 'login' && isPasswordVisible ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    minLength={mode === 'login' ? undefined : 12}
                    maxLength={128}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  {mode === 'login' && (
                    <button
                      type="button"
                      className="auth-password-toggle"
                      aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                      aria-pressed={isPasswordVisible}
                      onClick={() => setIsPasswordVisible((visible) => !visible)}
                    >
                      {isPasswordVisible ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  )}
                </div>
                {mode !== 'login' && <small className="muted">Use de 12 a 128 caracteres.</small>}
              </div>
            )}
            {(mode === 'reset' || mode === 'verify') && (
              <label htmlFor="account-password-confirm">
                Confirme a senha
                <input
                  id="account-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={128}
                  required
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                />
              </label>
            )}
            <button className="btn-primary" type="submit" disabled={busy}>
              {busy ? 'Aguarde…' : titles[mode]}
            </button>
          </form>

          <div className="auth-links">
            {mode === 'login' && (
              <>
                <button type="button" onClick={() => { setError(''); setErrorCode(''); setNotice(''); setMode('forgot'); }}>Esqueci minha senha</button>
                <p>Não tem conta? <button type="button" onClick={() => { setError(''); setErrorCode(''); setNotice(''); setMode('register'); }}>Criar cadastro</button></p>
              </>
            )}
            {mode !== 'login' && mode !== 'reset' && (
              <p>Já tem conta? <button type="button" onClick={() => { setError(''); setErrorCode(''); setNotice(''); setMode('login'); }}>Entrar</button></p>
            )}
            {mode === 'reset' && (
              <p><button type="button" onClick={() => { setError(''); setErrorCode(''); setMode('login'); }}>Voltar para entrar</button></p>
            )}
          </div>

          <p className="auth-privacy">
            Não informe dados que identifiquem outras pessoas. As informações de bem-estar são privadas e só devem ser acessadas pela conta autenticada. O app não substitui atendimento profissional.
          </p>
        </main>
      </section>
    </div>
  );
}
