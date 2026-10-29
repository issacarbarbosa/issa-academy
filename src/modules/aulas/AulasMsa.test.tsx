import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { AulasMsa } from './AulasMsa';
import { AdminProvider } from '../../core/contexts/AdminContext';

describe('AulasMsa Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderComponent = () =>
    render(
      <HashRouter>
        <AdminProvider>
          <AulasMsa />
        </AdminProvider>
      </HashRouter>,
    );

  it('deve renderizar o título principal do módulo de Aulas', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Aulas & Lições Teóricas')).toBeInTheDocument();
    });
  });

  it('deve exibir o botão de atalho para treinar no Simulado', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Treinar Fase 1 no Simulado/i)).toBeInTheDocument();
    });
  });

  it('deve carregar as lições da Fase 1 e permitir selecionar uma lição', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Música e Som/i)).toBeInTheDocument();
    });

    const lessonItem = screen.getByText('1.2');
    fireEvent.click(lessonItem);

    await waitFor(() => {
      expect(screen.getAllByText(/Elementos da Música/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('deve permitir marcar uma lição como concluída', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Marcar como Concluída')).toBeInTheDocument();
    });

    const completeBtn = screen.getByText('Marcar como Concluída');
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(screen.getByText('Concluída ✓')).toBeInTheDocument();
    });
  });
});
