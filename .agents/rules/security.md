---
trigger: model_decision
description: Leia esta regra ao lidar com validação de inputs do usuário, dados externos ou variáveis de ambiente.
---

# Regras de Segurança & Isolamento

## Isolamento de Credenciais
- NUNCA versione chaves de API privadas, tokens de acesso ou senhas no repositório.
- Certifique-se de que arquivos `.env` locais estejam devidamente listados no `.gitignore`.
- Mantenha um arquivo `.env.example` com placeholders atualizado sempre que novas variáveis públicas forem introduzidas.

## Validação Estrutural e Sanitização
- Todo dado vindo de fontes externas (como bancos de dados JSON em `questions/`) DEVE ser validado estruturalmente com esquemas Zod antes de ser consumido pelo estado da aplicação.
- Previna vulnerabilidades de XSS (Cross-Site Scripting): evite o uso de `dangerouslySetInnerHTML`. Prefira sempre geração de elementos JSX seguros e formatadores puros.
- Certifique-se de que links externos utilizem os atributos de segurança `rel="noopener noreferrer"`.
