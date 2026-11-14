import { z } from 'zod';
export const statusSchema=z.strictObject({phase:z.enum(['pilot','main']),paused:z.boolean(),completed:z.number().int().nonnegative(),pilotLimit:z.literal(50),pilotQuestions:z.boolean(),reason:z.enum(['manual','pilot_limit']).nullable()});
export type SurveyStatus=z.infer<typeof statusSchema>;
export const emailStatusSchema=z.strictObject({state:z.enum(['available','answered_verified','answered_pending']),simulated:z.boolean()});
export type EmailStatus=z.infer<typeof emailStatusSchema>;
export const receiptSchema=z.strictObject({accepted:z.literal(true),submissionId:z.uuid(),emailVerified:z.boolean(),verificationEmail:z.enum(['simulated','queued']),status:statusSchema});
export type Receipt=z.infer<typeof receiptSchema>;
export const apiErrorSchema=z.object({code:z.string(),message:z.string()});
