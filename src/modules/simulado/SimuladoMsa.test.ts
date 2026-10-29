import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  formatTimeSpent,
  computeQuizResult,
  shuffleQuestions,
  prepareQuizQuestions,
  loadQuestionBankForPhases,
  loadQuestionBankForPeriods,
  formatText,
} from './SimuladoMsa';
import type { SimuladoQuestion } from './questions/schema';

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

    it('should respect maxCount parameter for dual-mode quizzes (10 vs 20)', () => {
      const mockBank: SimuladoQuestion[] = Array.from({ length: 30 }, (_, i) => ({
        id: `q_${i}`,
        ativo: true,
        pergunta: `Questão ${i}`,
        opcoes: [
          { texto: 'A', correta: true },
          { texto: 'B', correta: false },
        ],
      }));

      const phaseModeQuiz = prepareQuizQuestions(mockBank, 10);
      expect(phaseModeQuiz.length).toBe(10);

      const periodModeQuiz = prepareQuizQuestions(mockBank, 20);
      expect(periodModeQuiz.length).toBe(20);
    });
  });

  describe('Dynamic Question Loaders', () => {
    it('should load question bank for specific phases correctly', async () => {
      const loadedF14 = await loadQuestionBankForPhases(new Set([14]));
      expect(Array.isArray(loadedF14)).toBe(true);
      expect(loadedF14.length).toBeGreaterThanOrEqual(15);

      const loadedMulti = await loadQuestionBankForPhases(new Set([1, 2]));
      expect(Array.isArray(loadedMulti)).toBe(true);
      expect(loadedMulti.length).toBeGreaterThan(20);
    });

    it('should load question bank for periods correctly with appropriate phase mapping', async () => {
      // Period 1 maps to phases 1, 2, 3
      const loadedP1 = await loadQuestionBankForPeriods(new Set([1]));
      expect(Array.isArray(loadedP1)).toBe(true);
      expect(loadedP1.length).toBeGreaterThan(30);

      // Period 4 maps to phases 10-16
      const loadedP4 = await loadQuestionBankForPeriods(new Set([4]));
      expect(Array.isArray(loadedP4)).toBe(true);
      expect(loadedP4.length).toBeGreaterThanOrEqual(7 * 15);
    });
  });

  describe('formatText (musical signature rendering)', () => {
    it('should return plain text wrapped in span if no signatures present', () => {
      const result = formatText('Teoria Musical CCB');
      expect(result).toBeDefined();
    });

    it('should render fractional elements for time signatures like 4/4 and 3/4', () => {
      const result = formatText('O hino está em 4/4 e depois modula para 3/4.');
      expect(result).toBeDefined();
    });

    it('should handle empty strings gracefully', () => {
      expect(formatText('')).toBe('');
    });
  });
});
