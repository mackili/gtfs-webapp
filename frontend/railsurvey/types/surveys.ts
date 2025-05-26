import { z } from "zod/v4";

export const surveyTemplateSchema = z.object({
  id: z.int(),
  title: z.string().max(80),
  displayTitle: z.string().max(80).nullable(),
  description: z.string().nullable(),
  type: z.string().check(z.maxLength(80)),
});

export type SurveyTemplate = z.infer<typeof surveyTemplateSchema>;

export const authorSchema = z
  .object({
    id: z.int(),
    firstName: z.string().max(255).nullable(),
    lastName: z.string().max(255).nullable(),
    institutionName: z.string().max(255).nullable(),
  })
  .refine((data) => (data.firstName && data.lastName) || data.institutionName, {
    message:
      "Either firstName and lastName or institutionName must be provided.",
  });

export type Author = z.infer<typeof authorSchema>;

export const surveyTemplateAuthorSchema = z.object({
  authorId: z.int(),
  surveyTemplateId: z.int(),
  displayOrder: z.int().nullish(),
});

export type SurveyTemplateAuthor = z.infer<typeof surveyTemplateAuthorSchema>;

export const templateSectionSchema = z.object({
  id: z.int(),
  surveyTemplateId: z.int(),
  displayOrder: z.int(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  displayNextPage: z.boolean().default(false),
});

export type TemplateSection = z.infer<typeof templateSectionSchema>;

export const templateQuestionSchema = z.object({
  id: z.int(),
  surveyTemplateId: z.int(),
  text: z.string(),
  description: z.string().nullish(),
  displayOrder: z.int(),
  templateSectionId: z.int().nullish(),
  answerFormat: z.instanceof(z.ZodType),
});

export type TemplateQuestion = z.infer<typeof templateQuestionSchema>;

export const serviceAspectSchema = z.object({
  id: z.number().int(),
  title: z.string().max(80),
  weight: z.number(),
  formula: z.string().nullable(),
});

export type ServiceAspect = z.infer<typeof serviceAspectSchema>;

export const measuresAspectSchema = z.object({
  templateQuestionId: z.number().int(),
  aspectId: z.number().int(),
});

export type MeasuresAspect = z.infer<typeof measuresAspectSchema>;

export const surveySchema = z.object({
  id: z.number().int(),
  surveyTemplateId: z.number().int(),
});

export type Survey = z.infer<typeof surveySchema>;

export const surveySubmissionSchema = z.object({
  id: z.number().int(),
  surveyId: z.number().int(),
  tripId: z.string().nullable(),
  ticketHash: z.string().nullish(),
  timestamp: z.date(),
});

export type SurveySubmission = z.infer<typeof surveySubmissionSchema>;

export const submittedAnswerSchema = z.object({
  id: z.number().int(),
  submissionId: z.number().int(),
  templateQuestionId: z.number().int(),
  value: z.string(),
});

export type SubmittedAnswer = z.infer<typeof submittedAnswerSchema>;
