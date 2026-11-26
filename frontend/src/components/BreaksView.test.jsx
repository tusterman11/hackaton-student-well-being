import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BreaksView } from './BreaksView';

afterEach(() => {
  vi.useRealTimers();
});

describe('BreaksView', () => {
  it('counts down a guided timer and registers the completed pause', async () => {
    vi.useFakeTimers();
    const onAddBreak = vi.fn().mockResolvedValue({ id: 8 });
    render(<BreaksView todayBreaks={[]} onAddBreak={onAddBreak} />);

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar (20 s)' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000);
    });

    expect(screen.getByText('Tempo concluído. Registre a pausa para adicioná-la ao histórico.')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Registrar pausa concluída' }));
      await Promise.resolve();
    });
    expect(onAddBreak).toHaveBeenCalledWith('walk', 'Descanso visual de 20 segundos');
  });
});
