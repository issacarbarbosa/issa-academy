import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MestreOverlays } from './MestreOverlays';

describe('MestreOverlays Component', () => {
  const baseProps = {
    gameState: 'START' as const,
    selectedClef: 'sol' as const,
    onSelectClef: vi.fn(),
    score: 0,
    level: 1,
    highScore: 50,
    pausesLeft: 3,
    onStartGame: vi.fn(),
    onPauseToggle: vi.fn(),
    onResetToStart: vi.fn(),
    onBack: vi.fn(),
  };

  it('renders START overlay with 3 clef selectors and correct initial notes', () => {
    const { rerender, container } = render(<MestreOverlays {...baseProps} />);

    expect(screen.getByText('Mestre da Clave')).toBeInTheDocument();
    expect(container.querySelector('#clef-select-sol')).toBeInTheDocument();
    expect(container.querySelector('#clef-select-fa')).toBeInTheDocument();
    expect(container.querySelector('#clef-select-do')).toBeInTheDocument();

    // In Clave de Sol, notes are Dó e Ré
    expect(screen.getByText(/Dó e Ré/i)).toBeInTheDocument();

    // Rerender with Clave de Fá
    rerender(<MestreOverlays {...baseProps} selectedClef="fa" />);
    expect(screen.getByText(/Mi e Fá/i)).toBeInTheDocument();

    // Rerender with Clave de Dó
    rerender(<MestreOverlays {...baseProps} selectedClef="do" />);
    expect(screen.getByText(/Ré e Mi/i)).toBeInTheDocument();
  });

  it('triggers onSelectClef when clicking a clef button', () => {
    const onSelectClef = vi.fn();
    const { container } = render(
      <MestreOverlays {...baseProps} onSelectClef={onSelectClef} />,
    );

    const faBtn = container.querySelector('#clef-select-fa')!;
    fireEvent.click(faBtn);
    expect(onSelectClef).toHaveBeenCalledWith('fa');

    const doBtn = container.querySelector('#clef-select-do')!;
    fireEvent.click(doBtn);
    expect(onSelectClef).toHaveBeenCalledWith('do');
  });

  it('triggers onStartGame when clicking COMEÇAR button', () => {
    const onStartGame = vi.fn();
    render(<MestreOverlays {...baseProps} onStartGame={onStartGame} />);

    fireEvent.click(screen.getByText(/COMEÇAR/i));
    expect(onStartGame).toHaveBeenCalledTimes(1);
  });

  it('renders PAUSED overlay when gameState is PAUSED', () => {
    const onPauseToggle = vi.fn();
    const onResetToStart = vi.fn();
    const onBack = vi.fn();

    render(
      <MestreOverlays
        {...baseProps}
        gameState="PAUSED"
        pausesLeft={2}
        onPauseToggle={onPauseToggle}
        onResetToStart={onResetToStart}
        onBack={onBack}
      />,
    );

    expect(screen.getByText(/Jogo Pausado/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Continuar/i));
    expect(onPauseToggle).toHaveBeenCalledTimes(1);
  });

  it('renders GAMEOVER overlay when gameState is GAMEOVER', () => {
    const onStartGame = vi.fn();
    const onResetToStart = vi.fn();
    const onBack = vi.fn();

    render(
      <MestreOverlays
        {...baseProps}
        gameState="GAMEOVER"
        score={250}
        level={3}
        highScore={200}
        onStartGame={onStartGame}
        onResetToStart={onResetToStart}
        onBack={onBack}
      />,
    );

    expect(screen.getByText(/Fim de Jogo/i)).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Jogar Novamente/i));
    expect(onStartGame).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(/Trocar Clave/i));
    expect(onResetToStart).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(/Voltar ao Início/i));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
