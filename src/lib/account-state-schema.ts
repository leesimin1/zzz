import { z } from 'zod';
import { configSchema } from './demo-appliances';

export const stateKindSchema = z.enum(['bear', 'appliances']);
export type StateKind = z.infer<typeof stateKindSchema>;
const key = z.string().regex(/^[a-zA-Z0-9_-]{1,160}$/);
const counter = z.number().finite().min(0).max(1_000_000_000);
const time = z.number().int().min(0).max(8_640_000_000_000_000);
const round = z.object({
  id: z.string().regex(/^[a-zA-Z0-9-]{1,64}$/),
  queue: z.array(z.string().max(80)).min(1).max(5),
  availableAt: time,
});
export const bearStateSchema = z.object({
  done: z.record(key, z.boolean()).refine((v) => Object.keys(v).length <= 5000),
  points: counter.int(),
  food: counter.int(),
  xp: counter.int(),
  carbon: counter,
  randomMissionRows: z.array(round).max(5).optional(),
  randomMissionCycle: round.optional(),
  bearCare: z
    .object({ startedAt: time, lastFedAt: time.nullable() })
    .optional(),
  missionActivity: z
    .record(
      key,
      z.object({
        title: z.string().max(200),
        category: z.string().max(50),
        completedAt: time,
      }),
    )
    .refine((v) => Object.keys(v).length <= 5000)
    .optional(),
});
export function parseAccountState(kind: StateKind, value: unknown) {
  const parsed =
    kind === 'bear'
      ? bearStateSchema.safeParse(value)
      : configSchema.safeParse(value);
  if (!parsed.success) throw new Error('STATE_INPUT');
  if (new TextEncoder().encode(JSON.stringify(parsed.data)).length > 100_000)
    throw new Error('STATE_INPUT');
  return parsed.data;
}
export const stateRowSchema = z.object({
  kind: stateKindSchema,
  data: z.record(z.string(), z.unknown()),
  version: z.number().int().positive(),
  updated_at: z.string(),
});
export type StateRow = z.infer<typeof stateRowSchema>;
export const stateWriteSchema = z
  .object({
    accountId: z.uuid(),
    kind: stateKindSchema,
    expectedVersion: z.number().int().min(0).max(2_147_483_646),
    data: z.unknown(),
  })
  .strict();
