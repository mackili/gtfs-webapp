import { z } from "zod/v4";

export const surveyTemplateSchema = z.object({
    id: z.union([z.int(), z.string()]),
    title: z.string().max(80),
    displayTitle: z.string().max(80).nullish(),
    description: z.string().nullish(),
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
    .refine(
        (data) => (data.firstName && data.lastName) || data.institutionName,
        {
            message:
                "Either firstName and lastName or institutionName must be provided.",
        }
    );

export type Author = z.infer<typeof authorSchema>;

export const surveyTemplateAuthorSchema = z.object({
    authorId: z.union([z.int(), z.string()]),
    surveyTemplateId: z.union([z.int(), z.string()]),
    displayOrder: z.int().nullish(),
});

export type SurveyTemplateAuthor = z.infer<typeof surveyTemplateAuthorSchema>;

export const templateSectionSchema = z.object({
    id: z.union([z.int(), z.string()]),
    surveyTemplateId: z.union([z.int(), z.string()]),
    displayOrder: z.int(),
    title: z.string().nullish(),
    description: z.string().nullish(),
    displayNextPage: z.boolean().default(false),
    externalId: z.union([z.int(), z.string()]).nullish(),
});

export type TemplateSection = z.infer<typeof templateSectionSchema>;

export const htmlInputTypes = [
    "checkbox",
    "date",
    "datetime-local",
    "email",
    "hidden",
    "month",
    "number",
    "radio",
    "range",
    "tel",
    "text",
    "time",
    "url",
    "week",
    "select",
] as const;

export const templateQuestionSchema = z.object({
    id: z.union([z.int(), z.string()]),
    surveyTemplateId: z.union([z.int(), z.string()]),
    text: z.string(),
    description: z.string().nullish(),
    displayOrder: z.int(),
    templateSectionId: z.union([z.int(), z.string()]).nullish(),
    answerFormat: z.enum(htmlInputTypes),
    selectValues: z.array(z.string()).nullish(),
    isRequired: z.boolean().default(false),
    externalSectionId: z.union([z.int(), z.string()]).nullish(),
});

export type TemplateQuestion = z.infer<typeof templateQuestionSchema>;

export const serviceAspectSchema = z.object({
    id: z.number().int().optional(),
    title: z.string().max(80),
});

export type ServiceAspect = z.infer<typeof serviceAspectSchema>;

export const serviceAspectFormula = z.object({
    id: z.number().int().optional(),
    surveyTemplateId: z.number().int(),
    serviceAspectId: z.number().int(),
    weight: z.number(),
    formula: z.string(),
});

export type ServiceAspectFormula = z.infer<typeof serviceAspectFormula>;

export const measuresAspectSchema = z.object({
    templateQuestionId: z.number().int(),
    aspectId: z.number().int(),
});

export type MeasuresAspect = z.infer<typeof measuresAspectSchema>;

export const surveySubmissionSchema = z.object({
    id: z.number().int(),
    surveyId: z.number().int(),
    tripId: z.string().nullish(),
    ticketHash: z.string().nullish(),
    timestamp: z.date(),
});

export const surveySchema = z.object({
    id: z.number().int().optional(),
    surveyTemplateId: z.number().int(),
    isActive: z.boolean().default(false),
    timestamp: z.iso.datetime().optional(),
    surveySubmission: z
        .array(
            z.object({
                count: z.number().nonnegative().int(),
            })
        )
        .optional(),
    surveySubmissions: z.array(surveySubmissionSchema).optional(),
});

export type Survey = z.infer<typeof surveySchema>;

export type SurveySubmission = z.infer<typeof surveySubmissionSchema>;

export const submittedAnswerSchema = z.object({
    id: z.number().int(),
    submissionId: z.number().int(),
    templateQuestionId: z.number().int(),
    value: z.string(),
});

export type SubmittedAnswer = z.infer<typeof submittedAnswerSchema>;

export type ServiceAspectFormulaWithAspect = ServiceAspectFormula & {
    serviceAspect: ServiceAspect;
};

export interface TemplateSummary extends SurveyTemplate {
    surveyTemplateAuthors?: Author[];
    templateSections?: SummarySection[] | TemplateSection[];
    templateQuestions?: TemplateQuestion[];
    serviceAspectFormulas?: ServiceAspectFormulaWithAspect[];
}
export interface SummarySection extends TemplateSection {
    hasRepeater: boolean;
}
