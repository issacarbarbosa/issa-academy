import { z } from 'zod';

export const QuestionOptionSchema = z.object({
  texto: z.string(),
  correta: z.boolean(),
  feedback: z.string().nullable().optional(),
});

export const QuestionReferenceSchema = z.object({
  livro: z.string().optional(),
  periodo: z.number().optional(),
  fase: z.number().optional(),
  item: z.union([z.string(), z.number()]).optional(),
  pagina: z.number().optional(),
});

export const SimuladoQuestionSchema = z.object({
  id: z.string(),
  ativo: z.boolean().optional().default(true),
  dificuldade: z.string().optional(),
  pontos: z.number().optional(),
  tipo: z.string().optional(),
  pergunta: z.string(),
  imagemUrl: z.string().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
  referencia: QuestionReferenceSchema.optional(),
  opcoes: z.array(QuestionOptionSchema).min(1),
});

export const SimuladoBankSchema = z.array(SimuladoQuestionSchema);

export type SimuladoQuestionOption = z.infer<typeof QuestionOptionSchema>;
export type SimuladoQuestionReference = z.infer<typeof QuestionReferenceSchema>;
export type SimuladoQuestion = z.infer<typeof SimuladoQuestionSchema>;

export interface WrongAnswerRecord {
  question: string;
  correctAnswer: string;
  reference?: SimuladoQuestionReference;
}

/**
 * Valida um array de questões vindo do JSON do simulado.
 * Se o JSON estiver corrompido ou contiver itens malformados, realiza a checagem estrita via Zod
 * e retorna os dados validados com blindagem de tipos.
 */
export function validateQuestionBank(rawBank: unknown): SimuladoQuestion[] {
  const parseResult = SimuladoBankSchema.safeParse(rawBank);
  if (!parseResult.success) {
    console.error("Erro na validação do banco de questões via Zod:", parseResult.error.format());
    // Tenta recuperar validando item por item caso algum objeto específico esteja corrompido
    if (Array.isArray(rawBank)) {
      return rawBank
        .map(item => SimuladoQuestionSchema.safeParse(item))
        .filter((res): res is { success: true; data: SimuladoQuestion } => res.success)
        .map(res => res.data);
    }
    throw new Error("Banco de questões possui formato inválido e não pôde ser carregado.");
  }
  return parseResult.data;
}
