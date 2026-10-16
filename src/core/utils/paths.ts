/**
 * Retorna a URL correta para assets públicos, considerando o BASE_URL da aplicação (ex: /issa-academy/).
 * No localhost dev: /assets/...
 * No GitHub Pages: /issa-academy/assets/...
 */
export function getAssetUrl(assetPath: string): string {
  if (!assetPath) return '';
  // Se for URL externa ou data URI, retorna inalterada
  if (/^(https?:|data:|\/\/)/i.test(assetPath)) {
    return assetPath;
  }

  // Remove barras ou pontos iniciais (ex: '/assets/fufu.png' -> 'assets/fufu.png')
  const cleanPath = assetPath.replace(/^(\.|\/)+/, '');
  const base = import.meta.env.BASE_URL || '/';

  return base.endsWith('/') ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
}
