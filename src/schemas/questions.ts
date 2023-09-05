import { z } from "zod";

export const checkAnswerSchema = z.object({
  userInput: z.string(),
  questionId: z.string(),
});
