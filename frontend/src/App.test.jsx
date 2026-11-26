import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as api from './services/api';

vi.mock('./services/api', () => ({
  submitCheckin: vi.fn(),
  logBreak: vi.fn(),
  sendChatMessage: vi.fn(),
  fetchCheckins: vi.fn(),
  fetchPauses: vi.fn(),
}));

beforeEach(() => {
  api.fetchCheckins.mockResolvedValue([]);
  api.fetchPauses.mockResolvedValue([]);
});

afterEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe('App', () => {
  it('navigates between the main views', async () => {
    const user = userEvent.setup();
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });

    await user.click(within(nav).getByRole('button', { name: 'Pausas' }));
    expect(screen.getByRole('heading', { name: 'Escolha uma pausa' })).toBeInTheDocument();

    await user.click(within(nav).getByRole('button', { name: 'Semana' }));
    expect(within(screen.getByRole('main')).getByRole('heading', { name: 'Sua semana' })).toBeInTheDocument();

    await user.click(within(nav).getByRole('button', { name: 'Apoio' }));
    expect(screen.getByRole('heading', { name: 'Você não precisa passar por isso sozinho' })).toBeInTheDocument();
  });

  it('saves a check-in and shows the success state', async () => {
    const user = userEvent.setup();
    api.submitCheckin.mockResolvedValue({
      checkin: { id: 1, mood: 4, energy: 3, note: 'Dia tranquilo', created_at: new Date().toISOString() },
    });
    render(<App />);

    await user.type(screen.getByLabelText(/Anotação/), 'Dia tranquilo');
    await user.click(screen.getByRole('button', { name: 'Salvar check-in' }));

    await waitFor(() => {
      expect(api.submitCheckin).toHaveBeenCalledWith({
        mood: 4,
        energy: 3,
        note: 'Dia tranquilo',
      });
    });
    expect(screen.getByRole('button', { name: 'Check-in salvo' })).toBeInTheDocument();
  });

  it('opens support automatically for a low-mood check-in', async () => {
    const user = userEvent.setup();
    api.submitCheckin.mockResolvedValue({
      checkin: { id: 2, mood: 1, energy: 2, created_at: new Date().toISOString() },
      showSupportAlert: true,
    });
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Pesado' }));
    await user.click(screen.getByRole('button', { name: 'Salvar check-in' }));

    expect(
      await within(screen.getByRole('main')).findByRole('heading', { name: 'Você não precisa passar por isso sozinho' }),
    ).toBeInTheDocument();
  });

  it('registers water locally without counting it as a timed break', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Registrar um copo de água (250 ml)' }));
    expect(api.logBreak).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Pausas' }));

    expect(screen.getByRole('heading', { name: 'Pausas de hoje (0)' })).toBeInTheDocument();
  });

  it('shows chat errors in the conversation', async () => {
    const user = userEvent.setup();
    api.sendChatMessage.mockRejectedValue(new Error('Serviço indisponível'));
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Conversa' }));
    await user.type(screen.getByLabelText('Sua mensagem'), 'Como posso fazer uma pausa?');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(
      await screen.findByText('Serviço indisponível'),
    ).toBeInTheDocument();
  });

  it('persists hydration data when the app is reloaded', async () => {
    const user = userEvent.setup();
    api.logBreak.mockResolvedValue({ id: 51, type: 'water', createdAt: new Date().toISOString() });
    const firstRender = render(<App />);

    await user.click(screen.getByRole('button', { name: 'Registrar um copo de água (250 ml)' }));
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem('entrepausas_wellness_data_v1')).hydration).toHaveLength(1);
    });

    firstRender.unmount();
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    await user.click(within(nav).getByRole('button', { name: 'Hidratação' }));
    expect(await screen.findByText('250 ml registrados')).toBeInTheDocument();
  });

  it('creates, edits, and deletes a journal entry', async () => {
    const user = userEvent.setup();
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    await user.click(within(nav).getByRole('button', { name: 'Diário' }));
    await user.type(screen.getByLabelText('Anotação'), 'Hoje escolhi fazer uma pausa.');
    await user.click(screen.getByRole('button', { name: 'Salvar registro' }));

    expect(screen.getByText('Hoje escolhi fazer uma pausa.')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('entrepausas_wellness_data_v1')).diary).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Editar anotação' }));
    const journalInput = screen.getByLabelText('Anotação');
    await user.clear(journalInput);
    await user.type(journalInput, 'Atualizei esta anotação.');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(screen.getByText('Atualizei esta anotação.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Excluir anotação' }));
    expect(screen.getByText('Ainda não há anotações. Seu primeiro registro aparecerá aqui.')).toBeInTheDocument();
  });

  it('creates a habit and a sleep record in local storage', async () => {
    const user = userEvent.setup();
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });

    await user.click(within(nav).getByRole('button', { name: 'Metas e hábitos' }));
    await user.type(screen.getByLabelText('Nome do hábito'), 'Alongar');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    await user.click(screen.getByRole('button', { name: 'Marcar hoje' }));
    expect(screen.getByRole('button', { name: 'Concluído hoje' })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('entrepausas_wellness_data_v1')).habits[0].completedDates).toHaveLength(1);

    await user.click(within(nav).getByRole('button', { name: 'Sono' }));
    await user.click(screen.getByRole('button', { name: '5 Muito boa' }));
    await user.click(screen.getByRole('button', { name: 'Salvar registro de sono' }));
    expect(within(screen.getByRole('list')).getByText('Muito boa')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('entrepausas_wellness_data_v1')).sleep).toHaveLength(1);
  });
});
