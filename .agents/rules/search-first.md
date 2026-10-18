---
trigger: always_on
---

# Regras de Reúso de Código & Pesquisa Prévia (Search-First)

## Diretrizes de Pesquisa
- Antes de criar qualquer nova função utilitária, helper, componente de UI ou instalar uma nova dependência, busque no projeto se já existe algo semelhante implementado em `src/core/` ou declarado no `package.json`.
- Evite escrever lógica utilitária do zero se houver uma solução nativa moderna no ecossistema (ex.: métodos modernos de Array/Set, APIs Web nativas).
- Se uma biblioteca externa for instalada, encapsule-a em um utilitário dentro de `src/core/utils/` para evitar acoplamento direto com as regras de negócio dos módulos.

## Regra de Promoção de Código
- Lógica de negócio ou componentes específicos devem viver encapsulados em seu respectivo módulo em `src/modules/[modulo]/`.
- Se um componente, hook ou utilitário passar a ser utilizado por **2 ou mais módulos diferentes**, ele deve ser **promovido** para a pasta correspondente em `src/core/`.

## Passe de Limpeza (De-sloppify)
- Toda vez que terminar de escrever uma funcionalidade e antes de concluir a tarefa:
  - Remova logs de depuração temporários (ex.: `console.log`, `debugger`).
  - Remova comentários óbvios que apenas repetem o que a linha de código faz.
  - Remova checagens redundantes ou código morto não utilizado.
