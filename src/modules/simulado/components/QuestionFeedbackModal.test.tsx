import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QuestionFeedbackModal } from './QuestionFeedbackModal';
import type { SimuladoQuestion } from '../questions/schema';

describe('QuestionFeedbackModal Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('OK')));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
  const sampleQuestion: SimuladoQuestion = {
    id: 'f14_q001',
    ativo: true,
    pergunta: 'O que caracteriza a escala diatônica menor?',
    referencia: {
      fase: 14,
      periodo: 4,
      pagina: 102,
      item: '14.1',
    },
    opcoes: [
      { texto: 'Estrutura T-S-T-T-S-T-T', correta: true },
      { texto: 'Estrutura T-T-S-T-T-T-S', correta: false },
    ],
  };

  const baseProps = {
    isOpen: true,
    question: sampleQuestion,
    onClose: vi.fn(),
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<QuestionFeedbackModal {...baseProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with question ID, MSA reference, and reason options', () => {
    render(<QuestionFeedbackModal {...baseProps} />);

    expect(screen.getByText(/Reportar Questão/i)).toBeInTheDocument();
    expect(screen.getByText(/ID: f14_q001/i)).toBeInTheDocument();
    expect(screen.getByText(/Fase 14/i)).toBeInTheDocument();
    expect(screen.getByText(/• Pág\. 102/i)).toBeInTheDocument();
    expect(screen.getByText(/Gabarito ou resposta correta duvidosa/i)).toBeInTheDocument();
    expect(screen.getByText(/Página ou tópico do MSA divergente/i)).toBeInTheDocument();
  });

  it('submits feedback successfully and transitions to success view', async () => {
    render(<QuestionFeedbackModal {...baseProps} />);

    // Select reason
    const reasonRadio = screen.getByLabelText(/Página ou tópico do MSA divergente/i);
    fireEvent.click(reasonRadio);

    // Enter comment
    const textarea = screen.getByPlaceholderText(/Explique o que você observou de incorreto/i);
    fireEvent.change(textarea, { target: { value: 'Acho que a página correta é 104' } });

    // Submit
    const submitBtn = screen.getByText(/Enviar Feedback/i);
    fireEvent.click(submitBtn);

    // Check success view
    await waitFor(() => {
      expect(screen.getByText(/Feedback Registrado!/i)).toBeInTheDocument();
    }, { timeout: 4000 });
    expect(screen.getByText(/Copiar Relatório/i)).toBeInTheDocument();
    expect(screen.getByText(/Abrir Issue no GitHub/i)).toBeInTheDocument();
  });
});
