import { describe, it, expect, vi } from 'vitest';
import { validateQuestionBank } from './schema';
import qF01 from './q_f01.json';
import qF02 from './q_f02.json';
import qF03 from './q_f03.json';
import qF04 from './q_f04.json';
import qF05 from './q_f05.json';
import qF06 from './q_f06.json';
import qF07 from './q_f07.json';
import qF08 from './q_f08.json';
import qF09 from './q_f09.json';
import qF10 from './q_f10.json';
import qF11 from './q_f11.json';
import qF12 from './q_f12.json';
import qF13 from './q_f13.json';
import qF14 from './q_f14.json';
import qF15 from './q_f15.json';
import qF16 from './q_f16.json';

describe('Zod Schema Validation & Data Blindage (schema.ts)', () => {
  it('should successfully validate and parse all 16 actual JSON question banks without errors', () => {
    const banks = [
      { name: 'q_f01', data: qF01 },
      { name: 'q_f02', data: qF02 },
      { name: 'q_f03', data: qF03 },
      { name: 'q_f04', data: qF04 },
      { name: 'q_f05', data: qF05 },
      { name: 'q_f06', data: qF06 },
      { name: 'q_f07', data: qF07 },
      { name: 'q_f08', data: qF08 },
      { name: 'q_f09', data: qF09 },
      { name: 'q_f10', data: qF10 },
      { name: 'q_f11', data: qF11 },
      { name: 'q_f12', data: qF12 },
      { name: 'q_f13', data: qF13 },
      { name: 'q_f14', data: qF14 },
      { name: 'q_f15', data: qF15 },
      { name: 'q_f16', data: qF16 },
    ];

    banks.forEach(({ name, data }) => {
      const validated = validateQuestionBank(data);
      expect(Array.isArray(validated), `Bank ${name} should be an array`).toBe(true);
      expect(validated.length, `Bank ${name} should not be empty`).toBeGreaterThan(0);
      expect(
        validated.length,
        `Bank ${name} should have no dropped malformed questions`,
      ).toBe((data as unknown[]).length);

      validated.forEach((q) => {
        expect(typeof q.id).toBe('string');
        expect(typeof q.pergunta).toBe('string');
        expect(Array.isArray(q.opcoes)).toBe(true);
        expect(q.opcoes.length).toBe(4);
        const correctCount = q.opcoes.filter((o) => o.correta === true).length;
        expect(correctCount, `Question ${q.id} in ${name} must have exactly 1 correct option`).toBe(
          1,
        );
      });
    });
  });

  it('should validate custom mock questions correctly', () => {
    const mockData: unknown = [
      {
        id: 'test_1',
        ativo: true,
        pergunta: 'Teste de pergunta',
        opcoes: [
          { texto: 'Opção A', correta: true, feedback: 'Correto!' },
          { texto: 'Opção B', correta: false }
        ]
      }
    ];

    const result = validateQuestionBank(mockData);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('test_1');
    expect(result[0].opcoes[0].correta).toBe(true);
  });

  it('should filter out malformed questions if some items in the array are corrupted', () => {
    const corruptedData: unknown = [
      {
        id: 'valid_question',
        pergunta: 'Pergunta válida',
        opcoes: [{ texto: 'A', correta: true }]
      },
      {
        id: 'invalid_question_missing_opcoes',
        pergunta: 'Sem opções'
        // missing opcoes array
      },
      {
        // completely malformed object
        foo: 'bar'
      }
    ];

    // Spy on console.error to suppress expected Zod warning output during test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = validateQuestionBank(corruptedData);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('valid_question');

    consoleSpy.mockRestore();
  });

  it('should throw an error if the entire payload is not an array or completely invalid', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => validateQuestionBank(null)).toThrow();
    expect(() => validateQuestionBank("invalid json string")).toThrow();
    expect(() => validateQuestionBank({ notAnArray: true })).toThrow();

    consoleSpy.mockRestore();
  });
});
