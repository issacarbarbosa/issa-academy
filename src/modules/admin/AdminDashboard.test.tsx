import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { AdminDashboard } from './AdminDashboard';
import { AdminProvider } from '../../core/contexts/AdminContext';

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderComponent = () =>
    render(
      <HashRouter>
        <AdminProvider>
          <AdminDashboard />
        </AdminProvider>
      </HashRouter>,
    );

  it('deve renderizar a tela de login quando não autenticado', () => {
    renderComponent();

    expect(screen.getByText('Acesso de Administrador')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu-email@gmail.com')).toBeInTheDocument();
  });

  it('deve permitir entrar no modo preview local e exibir o painel', async () => {
    renderComponent();

    const previewBtn = screen.getByText(/Entrar em Modo Preview Local/i);
    fireEvent.click(previewBtn);

    await waitFor(() => {
      expect(screen.getByText(/Central de Administração Issa Academy/i)).toBeInTheDocument();
      expect(screen.getByText(/Visão Geral & Cloud/i)).toBeInTheDocument();
    });
  });

  it('deve permitir navegar entre as abas do painel', async () => {
    renderComponent();

    const previewBtn = screen.getByText(/Entrar em Modo Preview Local/i);
    fireEvent.click(previewBtn);

    await waitFor(() => {
      expect(screen.getByText(/Central de Administração/i)).toBeInTheDocument();
    });

    // Clica na aba de Mestre da Clave
    const gameTab = screen.getByText(/Mestre da Clave/i);
    fireEvent.click(gameTab);

    await waitFor(() => {
      expect(screen.getByText(/Parâmetros do Mestre da Clave/i)).toBeInTheDocument();
    });

    // Clica na aba de Textos & Banners
    const siteTab = screen.getByText(/Textos & Banners do Site/i);
    fireEvent.click(siteTab);

    await waitFor(() => {
      expect(screen.getByText(/Título Principal da Home/i)).toBeInTheDocument();
    });
  });
});
