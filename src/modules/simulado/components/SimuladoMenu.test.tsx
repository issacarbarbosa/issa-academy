import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SimuladoMenu } from './SimuladoMenu';

describe('SimuladoMenu Component', () => {
  const baseProps = {
    quizMode: 'period' as const,
    onSelectMode: vi.fn(),
    selectedPeriods: new Set([1]),
    onTogglePeriod: vi.fn(),
    onToggleSelectAllPeriods: vi.fn(),
    selectedPhases: new Set([1]),
    onTogglePhase: vi.fn(),
    onToggleSelectAllPhases: vi.fn(),
    errorMessage: null,
    onStartQuiz: vi.fn(),
    onBack: vi.fn(),
  };

  it('renders period selection mode by default with period cards', () => {
    render(<SimuladoMenu {...baseProps} />);

    expect(screen.getByText(/Por Período/i)).toBeInTheDocument();
    expect(screen.getByText(/Por Fase/i)).toBeInTheDocument();

    expect(screen.getByText('Período 1')).toBeInTheDocument();
    expect(screen.getByText('Período 4')).toBeInTheDocument();
    expect(screen.getByText(/Começar Simulado/i)).toBeInTheDocument();
  });

  it('calls onSelectMode when clicking tab buttons', () => {
    const onSelectMode = vi.fn();
    render(<SimuladoMenu {...baseProps} onSelectMode={onSelectMode} />);

    fireEvent.click(screen.getByText(/Por Fase/i));
    expect(onSelectMode).toHaveBeenCalledWith('phase');
  });

  it('renders phase selection mode with all 16 phases and fast selection buttons', () => {
    const onToggleSelectAllPhases = vi.fn();
    const onTogglePhase = vi.fn();

    render(
      <SimuladoMenu
        {...baseProps}
        quizMode="phase"
        selectedPhases={new Set([5, 14])}
        onTogglePhase={onTogglePhase}
        onToggleSelectAllPhases={onToggleSelectAllPhases}
      />,
    );

    expect(screen.getByText(/Fase 1:/i)).toBeInTheDocument();
    expect(screen.getByText(/Fase 14:/i)).toBeInTheDocument();
    expect(screen.getByText(/Fase 16:/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Selecionar Todas/i));
    expect(onToggleSelectAllPhases).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(/Fase 5:/i));
    expect(onTogglePhase).toHaveBeenCalledWith(5);
  });

  it('calls onStartQuiz when clicking Começar Simulado button', () => {
    const onStartQuiz = vi.fn();
    render(<SimuladoMenu {...baseProps} onStartQuiz={onStartQuiz} />);

    fireEvent.click(screen.getByText(/Começar Simulado/i));
    expect(onStartQuiz).toHaveBeenCalledTimes(1);
  });
});
