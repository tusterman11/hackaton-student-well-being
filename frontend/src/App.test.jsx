import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as api from './services/api';

vi.mock('./services/api', () => ({
  submitCheckin: vi.fn(),
  logBreak: vi.fn(),
  sendChatMessage: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('App', () => {
  it('navigates between the main views', async () => {
    const user = userEvent.setup();
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });

    await user.click(within(nav).getByRole('button', { name: 'Pausas' }));
    expect(screen.getByRole('heading', { name: 'Pausas de hoje' })).toBeInTheDocument();

    await user.click(within(nav).getByRole('button', { name: 'Semana' }));
    expect(screen.getByRole('heading', { name: 'Seu jardim da semana' })).toBeInTheDocument();

    await user.click(within(nav).getByRole('button', { name: 'Apoio' }));
    expect(screen.getByRole('heading', { name: 'Apoio e cuidado real' })).toBeInTheDocument();
  });

  it('saves a check-in and shows the success state', async () => {
    const user = userEvent.setup();
    api.submitCheckin.mockResolvedValue({
      checkin: { mood: 4, energy: 3, note: 'Dia tranquilo' },
    });
    render(<App />);

    await user.type(screen.getByLabelText(/Anotação do check-in/i), 'Dia tranquilo');
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

    await user.click(screen.getByRole('button', { name: 'Pesado' }));
    await user.click(screen.getByRole('button', { name: 'Salvar check-in de hoje' }));

    expect(
      await screen.findByRole('heading', { name: 'Apoio e cuidado real' }),
    ).toBeInTheDocument();
  });

  it('registers a break and makes it appear in the Pausas view', async () => {
    const user = userEvent.setup();
    api.logBreak.mockResolvedValue({ id: 42 });
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Bebi água' }));
    await user.click(screen.getByRole('button', { name: 'Pausas' }));

    expect(api.logBreak).toHaveBeenCalledWith('water');
    expect(
      screen.getByRole('heading', { name: 'Registradas hoje (2)' }),
    ).toBeInTheDocument();
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
});
