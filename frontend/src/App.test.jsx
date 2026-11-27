import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as api from './services/api';

vi.mock('./services/api', () => ({
  clearChatHistory: vi.fn(),
  fetchChatHistory: vi.fn(),
  getCurrentSession: vi.fn(),
  registerAccount: vi.fn(),
  verifyEmail: vi.fn(),
  loginAccount: vi.fn(),
  logoutAccount: vi.fn(),
  resendVerificationEmail: vi.fn(),
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
  submitCheckin: vi.fn(),
  logBreak: vi.fn(),
  sendChatMessage: vi.fn(),
  fetchWeeklyHistory: vi.fn(),
  fetchWellnessData: vi.fn(),
  createWellnessRecord: vi.fn(),
  updateHydrationGoal: vi.fn(),
  updateJournalEntry: vi.fn(),
  setHabitCompletion: vi.fn(),
  deleteWellnessRecord: vi.fn(),
  importLocalData: vi.fn()
}));

beforeEach(() => {
  api.getCurrentSession.mockResolvedValue({
    user: { id: 'user-1', email: 'student@example.test' },
    csrfToken: 'csrf-token'
  });
  api.fetchWeeklyHistory.mockResolvedValue({ checkins: [], pauses: [] });
  api.fetchChatHistory.mockResolvedValue([]);
  api.clearChatHistory.mockResolvedValue({ messages: [] });
  api.fetchWellnessData.mockResolvedValue({
    hydrationGoalMl: 2000,
    localImportAvailable: false,
    hydration: [],
    journal: [],
    habits: [],
    sleep: [],
    study: [],
    habitCompletions: []
  });
  api.resendVerificationEmail.mockResolvedValue({ message: 'Link enviado.' });
});

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('App', () => {
  it('navigates between the main views', async () => {
    const user = userEvent.setup();
    render(<App />);
    const nav = await screen.findByRole('navigation', { name: 'Navegação principal' });

    await user.click(within(nav).getByRole('button', { name: 'Pausas' }));
    expect(screen.getByRole('heading', { name: 'Pausas de hoje' })).toBeInTheDocument();

    await user.click(within(nav).getByRole('button', { name: 'Semana' }));
    expect(screen.getByRole('heading', { name: 'Sua semana' })).toBeInTheDocument();

    await user.click(within(nav).getByRole('button', { name: 'Apoio' }));
    expect(screen.getByRole('heading', { name: 'Apoio e cuidado real' })).toBeInTheDocument();
  });

  it('saves a check-in and shows the success state', async () => {
    const user = userEvent.setup();
    api.submitCheckin.mockResolvedValue({
      checkin: { mood: 4, energy: 3, note: 'Dia tranquilo' },
    });
    render(<App />);

    await user.type(await screen.findByLabelText(/Anotação do check-in/i), 'Dia tranquilo');
    await user.click(screen.getByRole('button', { name: 'Salvar check-in de hoje' }));

    await waitFor(() => {
      expect(api.submitCheckin).toHaveBeenCalledWith({
        mood: 4,
        energy: 3,
        note: 'Dia tranquilo',
      });
    });
    expect(
      screen.getByRole('button', { name: 'Check-in guardado com carinho ✓' }),
    ).toBeInTheDocument();
  });

  it('opens support automatically for a low-mood check-in', async () => {
    const user = userEvent.setup();
    api.submitCheckin.mockResolvedValue({
      checkin: { mood: 1, energy: 2 },
      showSupportAlert: true,
    });
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Pesado' }));
    await user.click(screen.getByRole('button', { name: 'Salvar check-in de hoje' }));

    expect(
      await screen.findByRole('heading', { name: 'Apoio e cuidado real' }),
    ).toBeInTheDocument();
  });

  it('registers a break and makes it appear in the Pausas view', async () => {
    const user = userEvent.setup();
    api.logBreak.mockResolvedValue({
      id: 42,
      type: 'water',
      created_at: new Date().toISOString()
    });
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Bebi água' }));
    await user.click(screen.getByRole('button', { name: 'Pausas' }));

    expect(api.logBreak).toHaveBeenCalledWith('water');
    expect(
      screen.getByRole('heading', { name: 'Registradas hoje (1)' }),
    ).toBeInTheDocument();
  });

  it('shows chat errors in the conversation', async () => {
    const user = userEvent.setup();
    api.sendChatMessage.mockRejectedValue(new Error('Serviço indisponível'));
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Conversa' }));
    await user.type(screen.getByLabelText('Sua mensagem'), 'Como posso fazer uma pausa?');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(
      await screen.findByText('Serviço indisponível'),
    ).toBeInTheDocument();
  });

  it('requests consent before importing local wellness data', async () => {
    const user = userEvent.setup();
    localStorage.setItem('entrepausas-hydration', JSON.stringify([{ amount: 300, time: '10:30' }]));
    api.fetchWellnessData
      .mockResolvedValueOnce({
        hydrationGoalMl: 2000,
        localImportAvailable: true,
        hydration: [],
        journal: [],
        habits: [],
        sleep: [],
        study: [],
        habitCompletions: []
      })
      .mockResolvedValueOnce({
        hydrationGoalMl: 2000,
        localImportAvailable: false,
        hydration: [{ id: '1', amount: 300, date: new Date().toISOString().slice(0, 10) }],
        journal: [],
        habits: [],
        sleep: [],
        study: [],
        habitCompletions: []
      });
    api.importLocalData.mockResolvedValue({ imported: { hydration: 1 } });
    render(<App />);

    expect(await screen.findByRole('dialog', { name: 'Importar seus dados deste navegador?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Importar para minha conta' }));

    await waitFor(() => {
      expect(api.importLocalData).toHaveBeenCalledWith(expect.objectContaining({
        hydration: [{ amount: 300, time: '10:30' }]
      }), false);
    });
    expect(localStorage.getItem('entrepausas-hydration')).toBeNull();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('imports records from the previous consolidated local-storage format', async () => {
    const user = userEvent.setup();
    const date = new Date();
    const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const hydrationDate = new Date(`${today}T10:00:00.000Z`);
    const importedHydrationDate = `${hydrationDate.getFullYear()}-${String(hydrationDate.getMonth() + 1).padStart(2, '0')}-${String(hydrationDate.getDate()).padStart(2, '0')}`;
    localStorage.setItem('entrepausas_wellness_data_v1', JSON.stringify({
      hydrationGoalMl: 2250,
      hydration: [{ id: 'water-1', amountMl: 300, createdAt: `${today}T10:00:00.000Z` }],
      diary: [{ id: 'entry-1', text: 'Um dia de cada vez', createdAt: `${today}T11:00:00.000Z` }],
      habits: [{ id: 'habit-1', title: 'Beber água', completedDates: [today] }],
      sleep: [{ id: 'sleep-1', bedtime: '23:00', wakeTime: '07:00', quality: 4, createdAt: `${today}T07:00:00.000Z` }],
      studySessions: [{ id: 'focus-1', minutes: 25, createdAt: `${today}T12:00:00.000Z` }]
    }));
    api.fetchWellnessData
      .mockResolvedValueOnce({
        hydrationGoalMl: 2000,
        localImportAvailable: true,
        hydration: [],
        journal: [],
        habits: [],
        sleep: [],
        study: [],
        focusSessions: [],
        habitCompletions: []
      })
      .mockResolvedValueOnce({
        hydrationGoalMl: 2250,
        localImportAvailable: false,
        hydration: [],
        journal: [],
        habits: [],
        sleep: [],
        study: [],
        focusSessions: [],
        habitCompletions: []
      });
    api.importLocalData.mockResolvedValue({ imported: { hydration: 1 } });
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Importar para minha conta' }));

    await waitFor(() => {
      expect(api.importLocalData).toHaveBeenCalledWith(expect.objectContaining({
        hydrationGoalMl: 2250,
        hydration: [expect.objectContaining({ amount: 300, date: importedHydrationDate })],
        journal: [expect.objectContaining({ body: 'Um dia de cada vez' })],
        habits: [expect.objectContaining({ label: 'Beber água', done: true, completedDates: [today] })],
        sleep: [expect.objectContaining({ bed: '23:00', wake: '07:00' })],
        study: [],
        focusSessions: [{ id: 'focus-1', minutes: 25, createdAt: `${today}T12:00:00.000Z` }]
      }), false);
    });
    expect(localStorage.getItem('entrepausas_wellness_data_v1')).toBeNull();
  });

  it('shows sign-in first and opens the private app after authentication', async () => {
    const user = userEvent.setup();
    api.getCurrentSession.mockResolvedValue({ user: null, csrfToken: null });
    api.loginAccount.mockResolvedValue({
      user: { id: 'user-2', email: 'new@example.test' },
      csrfToken: 'new-csrf-token'
    });
    render(<App />);

    await user.type(await screen.findByLabelText('E-mail'), 'new@example.test');
    await user.type(screen.getByLabelText('Senha'), 'a-long-test-password-2026');
    await user.click(screen.getByRole('button', { name: 'Entre na sua conta' }));

    expect(await screen.findByRole('heading', { name: 'Como está o seu céu hoje?' })).toBeInTheDocument();
    expect(api.loginAccount).toHaveBeenCalledWith('new@example.test', 'a-long-test-password-2026');
  });

  it('clears private account data when the session expires', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Como está o seu céu hoje?' })).toBeInTheDocument();

    act(() => window.dispatchEvent(new Event('entrepausas:session-expired')));

    expect(await screen.findByRole('heading', { name: 'Entre na sua conta' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Como está o seu céu hoje?' })).not.toBeInTheDocument();
  });

  it('creates an account by email and offers to resend the verification link', async () => {
    const user = userEvent.setup();
    api.getCurrentSession.mockResolvedValue({ user: null, csrfToken: null });
    api.registerAccount.mockResolvedValue({ message: 'Confira seu e-mail.' });
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Criar cadastro' }));
    await user.type(screen.getByLabelText('E-mail'), 'new@example.test');
    await user.click(screen.getByRole('button', { name: 'Crie sua conta' }));

    expect(api.registerAccount).toHaveBeenCalledWith('new@example.test');
    expect(await screen.findByText('Confira seu e-mail.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reenviar link de confirmação' }));
    expect(api.resendVerificationEmail).toHaveBeenCalledWith('new@example.test');
  });

  it('requires the user to set a password after opening the verification link', async () => {
    const user = userEvent.setup();
    api.getCurrentSession.mockResolvedValue({ user: null, csrfToken: null });
    api.verifyEmail.mockResolvedValue({ message: 'E-mail confirmado.' });
    window.history.replaceState({}, '', '/#verify=verification-token-that-is-long-enough');
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Confirme seu e-mail' })).toBeInTheDocument();
    await user.type(screen.getByLabelText(/^Senha/), 'chosen-by-account-owner-2026');
    await user.type(screen.getByLabelText('Confirme a senha'), 'chosen-by-account-owner-2026');
    await user.click(screen.getByRole('button', { name: 'Confirme seu e-mail' }));

    expect(api.verifyEmail).toHaveBeenCalledWith(
      'verification-token-that-is-long-enough',
      'chosen-by-account-owner-2026'
    );
    expect(await screen.findByText('E-mail confirmado.')).toBeInTheDocument();
  });

  it('keeps new wellness records visible after navigating away and back', async () => {
    const user = userEvent.setup();
    const date = new Date();
    const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    api.createWellnessRecord.mockResolvedValue({ id: 8, amount: 250, date: today });
    render(<App />);

    const nav = await screen.findByRole('navigation', { name: 'Navegação principal' });
    await user.click(within(nav).getByRole('button', { name: 'Água' }));
    await user.click(screen.getByRole('button', { name: 'Registrar água' }));
    await user.click(within(nav).getByRole('button', { name: 'Semana' }));
    await user.click(within(nav).getByRole('button', { name: 'Água' }));

    expect(screen.getByRole('heading', { name: '250 ml' })).toBeInTheDocument();
  });
});
