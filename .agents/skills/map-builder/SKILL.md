---
name: map-builder
description: Use esta skill para gerar e sincronizar os dois mapas arquiteturais do projeto (MAPA_RAIZ.md para estrutura física e FLUXO_USUARIO.md para navegação UX) sempre que for solicitado atualizar, gerar ou sincronizar mapas.
---

# Gerador e Sincronizador de Mapas (Físico & UX)

Esta skill é responsável por manter a documentação estrutural e de navegação do projeto 100% sincronizadas. Sempre que o usuário ativar o comando `/map-builder` ou solicitar para "atualizar mapa", "gerar mapa", "sincronizar mapas" ou similar, execute rigorosamente os **3 passos abaixo**:

### Passo 1: Atualizar o Mapa Físico de Diretórios (`MAPA_RAIZ.md`)
Execute o comando terminal abaixo para rodar o script de varredura física do sistema de arquivos:
`npm run map`

### Passo 2: Sincronizar o Mapa Lógico de Experiência do Usuário (`FLUXO_USUARIO.md`)
O script do Passo 1 já se certifica de que o arquivo [FLUXO_USUARIO.md](file:///d:/Projetos/issa-academy/FLUXO_USUARIO.md) existe. Como agente de IA, você deve **verificar se houve mudanças recentes na navegação** (em arquivos como `App.tsx`, rotas do React Router, modais ou abas de componentes de `src/modules/`) e, se necessário, atualizar o diagrama em `Mermaid.js` dentro do arquivo [FLUXO_USUARIO.md](file:///d:/Projetos/issa-academy/FLUXO_USUARIO.md) usando ferramentas de edição de código.
- O diagrama deve refletir fielmente: Rotas (`/`, `/mestre-da-clave`, `/simulado`), Telas de Estado e Guardas de Orientação (`OrientationGuard`).

### Passo 3: Notificar o Usuário
Informe ao usuário de forma clara e resumida que **ambos os mapas foram atualizados com sucesso**, fornecendo os links clicáveis para:
- 📁 **Mapa Físico:** [MAPA_RAIZ.md](file:///d:/Projetos/issa-academy/MAPA_RAIZ.md) (Estrutura de pastas e arquivos)
- 🧭 **Mapa de UX & Fluxo:** [FLUXO_USUARIO.md](file:///d:/Projetos/issa-academy/FLUXO_USUARIO.md) (Jornada de navegação, abas e guardas de UX em Mermaid)
