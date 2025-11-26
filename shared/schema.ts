import { z } from "zod";

// UK Government Petition Schema
export const petitionAttributesSchema = z.object({
  action: z.string(),
  background: z.string().nullable().optional(),
  additional_details: z.string().nullable().optional(),
  state: z.enum(["open", "closed", "rejected", "awaiting_response", "awaiting_moderation"]),
  signature_count: z.number(),
  opened_at: z.string().nullable().optional(),
  closed_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  rejected_at: z.string().nullable().optional(),
  rejection_code: z.string().nullable().optional(),
  rejection_details: z.string().nullable().optional(),
  government_response_at: z.string().nullable().optional(),
  debate_threshold_reached_at: z.string().nullable().optional(),
  scheduled_debate_date: z.string().nullable().optional(),
  debate_outcome_at: z.string().nullable().optional(),
  moderation_threshold_reached_at: z.string().nullable().optional(),
  response_threshold_reached_at: z.string().nullable().optional(),
});

export const governmentResponseSchema = z.object({
  responded_on: z.string(),
  summary: z.string(),
  details: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const debateOutcomeSchema = z.object({
  debated: z.boolean(),
  debated_on: z.string().nullable().optional(),
  overview: z.string().nullable().optional(),
  transcript_url: z.string().nullable().optional(),
  video_url: z.string().nullable().optional(),
  debate_pack_url: z.string().nullable().optional(),
});

export const petitionSchema = z.object({
  id: z.number(),
  type: z.string(),
  attributes: petitionAttributesSchema,
  government_response: governmentResponseSchema.nullable().optional(),
  debate_outcome: debateOutcomeSchema.nullable().optional(),
});

export const petitionsResponseSchema = z.object({
  data: z.array(petitionSchema),
  links: z.object({
    self: z.string(),
    first: z.string(),
    last: z.string(),
    prev: z.string().nullable().optional(),
    next: z.string().nullable().optional(),
  }),
  meta: z.object({
    current_page: z.number().optional(),
    next_page: z.number().nullable().optional(),
    prev_page: z.number().nullable().optional(),
    total_pages: z.number().optional(),
  }).optional(),
});

export type Petition = z.infer<typeof petitionSchema>;
export type PetitionAttributes = z.infer<typeof petitionAttributesSchema>;
export type GovernmentResponse = z.infer<typeof governmentResponseSchema>;
export type DebateOutcome = z.infer<typeof debateOutcomeSchema>;
export type PetitionsResponse = z.infer<typeof petitionsResponseSchema>;

// Filter and sort options
export const petitionStatusSchema = z.enum(["all", "open", "closed", "rejected", "awaiting_response"]);
export const petitionSortSchema = z.enum(["signature_count", "created_at", "closing_soon"]);

export type PetitionStatus = z.infer<typeof petitionStatusSchema>;
export type PetitionSort = z.infer<typeof petitionSortSchema>;
