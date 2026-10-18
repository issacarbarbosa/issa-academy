import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  formatTimeSpent,
  computeQuizResult,
  shuffleQuestions,
  prepareQuizQuestions,
} from './SimuladoMsa';

describe('SimuladoMsa Helper Logic', () => {
  describe('formatTimeSpent', () => {
    it('should format seconds into mm:ss strings correctly', () => {
      expect(formatTimeSpent(0)).toBe('00:00');
      expect(formatTimeSpent(9)).toBe('00:09');
      expect(formatTimeSpent(59)).toBe('00:59');
      expect(formatTimeSpent(60)).toBe('01:00');
      expect(formatTimeSpent(125)).toBe('02:05');
      expect(formatTimeSpent(3605)).toBe('60:05');
    });
  });

  describe('computeQuizResult', () => {
    it('should return 100% gabarito trophy tier when all questions are correct without accents in path', () => {
      const res = computeQuizResult(20, 20);
      expect(res.pct).toBe(100);
      expect(res.img).toBe('/assets/fufu-comemorando-trofeu-gabarito.png');
      expect(res.msg).toContain('Perfeito');
    });

    it('should return >=80% trophy G-clave tier when score is 80-99%', () => {
      const res = computeQuizResult(16, 20); // exactly 80%
      expect(res.pct).toBe(80);
      expect(res.img).toBe('/assets/fufu-comemorando-trofeu-G-clave.png');
      expect(res.msg).toContain('Muito bom');
    });

    it('should return >=50% mid tier when score is between 50% and 79%', () => {
      const res1 = computeQuizResult(10, 20, 0); // 50%
      expect(res1.pct).toBe(50);
      expect(res1.img).toBe('/assets/fufu-erro-presente.png');
      expect(res1.msg).toContain('Bom esforço');

      const res2 = computeQuizResult(15, 20, 0.99); // 75%
      expect(res2.pct).toBe(75);
      expect(res2.img).toBe('/assets/fufu-erro-encorajador.png');
    });

    it('should return <50% low tier when score is below 50% without accents in path', () => {
      const res1 = computeQuizResult(9, 20, 0); // 45%
      expect(res1.pct).toBe(45);
      expect(res1.img).toBe('/assets/fufu-erro-nao-desista.png');
      expect(res1.msg).toContain('Não desanime');

      const res2 = computeQuizResult(0, 20, 0.5); // 0%
      expect(res2.pct).toBe(0);
      expect(res2.img).toBe('/assets/fufu-erro-carinho.png');
    });

    it('should ensure all returned asset files physically exist in public/assets without 404', () => {
      const publicDir = path.resolve(__dirname, '../../../public');
      const testCases = [
        computeQuizResult(20, 20),
        computeQuizResult(18, 20),
        computeQuizResult(12, 20, 0),
        computeQuizResult(12, 20, 0.99),
        computeQuizResult(5, 20, 0),
        computeQuizResult(5, 20, 0.4),
        computeQuizResult(5, 20, 0.9),
      ];

      testCases.forEach((tc) => {
        const relativeAsset = tc.img.replace(/^\//, '');
        const fullPath = path.join(publicDir, relativeAsset);
        expect(fs.existsSync(fullPath), `Asset file should exist on disk: ${fullPath}`).toBe(true);
      });
    });
  });

  describe('shuffleQuestions & prepareQuizQuestions (Fisher-Yates)', () => {
    it('should maintain the same elements and length without mutating the original array', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const shuffled = shuffleQuestions(original);

      expect(shuffled.length).toBe(original.length);
      expect(shuffled).not.toBe(original);
      expect(shuffled.sort((a, b) => a - b)).toEqual(original);
    });

    it('should shuffle the options of each selected question across multiple runs', () => {
      const mockBank = [
        {
          id: 'q1',
          ativo: true,
          pergunta: 'Pergunta 1',
          opcoes: [
            { texto: 'A', correta: true },
            { texto: 'B', correta: false },
            { texto: 'C', correta: false },
            { texto: 'D', correta: false },
          ],
        },
      ];

      const positions = new Set<number>();
      for (let i = 0; i < 40; i++) {
        const prepared = prepareQuizQuestions(mockBank, 20);
        expect(prepared.length).toBe(1);
        expect(prepared[0].opcoes).not.toBe(mockBank[0].opcoes);
        expect(prepared[0].opcoes.length).toBe(4);
        const correctIdx = prepared[0].opcoes.findIndex((o) => o.correta);
        positions.add(correctIdx);
      }
      // Over 40 independent runs, the correct answer should appear in multiple positions
      expect(positions.size).toBeGreaterThan(1);
    });
  });
});
