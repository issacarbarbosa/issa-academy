import { describe, it, expect } from 'vitest';
import { getAssetUrl } from './paths';

describe('getAssetUrl helper', () => {
  it('should return empty string if path is empty', () => {
    expect(getAssetUrl('')).toBe('');
  });

  it('should keep external URLs intact', () => {
    expect(getAssetUrl('https://example.com/image.png')).toBe('https://example.com/image.png');
    expect(getAssetUrl('http://example.com/image.png')).toBe('http://example.com/image.png');
    expect(getAssetUrl('data:image/png;base64,123')).toBe('data:image/png;base64,123');
  });

  it('should clean leading slashes and dots and prepend BASE_URL', () => {
    const url1 = getAssetUrl('/assets/fufu.png');
    const url2 = getAssetUrl('assets/fufu.png');
    const url3 = getAssetUrl('./assets/fufu.png');

    expect(url1).toContain('assets/fufu.png');
    expect(url2).toContain('assets/fufu.png');
    expect(url3).toContain('assets/fufu.png');
    expect(url1).toBe(url2);
    expect(url2).toBe(url3);
  });
});
