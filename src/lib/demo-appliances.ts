import { z } from 'zod';
import { demoUsageForAddress } from './demo-home';
import { demoAccountStorageKey } from './demo-account-storage';

const customSchema = z
  .object({
    id: z.string().regex(/^[a-zA-Z0-9-]{1,80}$/),
    name: z.string().trim().min(1).max(40),
    start: z.number().min(0).max(23.5).multipleOf(0.5),
    end: z.number().min(0.5).max(24).multipleOf(0.5),
    powerKw: z.number().positive().max(20),
  })
  .refine((item) => item.end > item.start);
const configSchema = z.object({
  removed: z.array(z.string()).max(6),
  enabled: z.record(z.string(), z.boolean()),
  custom: z.array(customSchema).max(18),
});
type Config = z.infer<typeof configSchema>;
export type DemoAppliance = z.infer<typeof customSchema> & {
  enabled: boolean;
  monthlyKwh: number;
};
const defaults = [
  { id: 'ac', name: '에어컨', start: 17, end: 23, weight: 118 },
  { id: 'fridge', name: '냉장고', start: 0, end: 24, weight: 78 },
  { id: 'heater', name: '온수·전기히터', start: 6, end: 9, weight: 49 },
  { id: 'washer', name: '세탁기·건조기', start: 19, end: 21, weight: 36 },
  { id: 'lights', name: '조명', start: 18, end: 24, weight: 24 },
  { id: 'tv', name: 'TV·기타 대기전력', start: 18, end: 24, weight: 42 },
];
const blank = (): Config => ({ removed: [], enabled: {}, custom: [] });
export const APPLIANCE_EVENT = 'polar-demo-appliances-change';
export function applianceSnapshot(email: string) {
  if (!email) return '';
  try {
    return (
      localStorage.getItem(
        demoAccountStorageKey('polar-appliances-v1', email),
      ) ?? ''
    );
  } catch {
    return '';
  }
}
function parseConfig(raw: string): Config {
  try {
    const parsed = configSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : blank();
  } catch {
    return blank();
  }
}
export function demoAppliances(address: string, raw = '') {
  const config = parseConfig(raw);
  const usage = demoUsageForAddress(address);
  let remaining = usage;
  const base = defaults
    .map((item, index) => {
      const monthlyKwh =
        index === defaults.length - 1
          ? remaining
          : Math.round((usage * item.weight) / 347);
      remaining -= monthlyKwh;
      return {
        id: item.id,
        name: item.name,
        start: item.start,
        end: item.end,
        powerKw: monthlyKwh / 30 / (item.end - item.start),
        monthlyKwh,
        enabled: config.enabled[item.id] ?? true,
      };
    })
    .filter((item) => !config.removed.includes(item.id));
  const custom = config.custom.map((item) => ({
    ...item,
    monthlyKwh:
      Math.round(item.powerKw * (item.end - item.start) * 30 * 100) / 100,
    enabled: config.enabled[item.id] ?? true,
  }));
  return [...base, ...custom];
}
export function applianceTotal(items: DemoAppliance[]) {
  return (
    Math.round(
      items.reduce(
        (sum, item) => sum + (item.enabled ? item.monthlyKwh : 0),
        0,
      ) * 100,
    ) / 100
  );
}
export function subscribeAppliances(callback: () => void) {
  window.addEventListener(APPLIANCE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(APPLIANCE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
export function changeAppliances(email: string, command: unknown) {
  if (!email) throw new Error('로그인 후 가전기기를 변경해 주세요.');
  const input = z
    .discriminatedUnion('type', [
      z.object({ type: z.literal('toggle'), id: z.string().max(80) }),
      z.object({ type: z.literal('remove'), id: z.string().max(80) }),
      z.object({ type: z.literal('restore') }),
      z.object({
        type: z.literal('add'),
        name: z.string(),
        start: z.number(),
        end: z.number(),
        powerKw: z.number(),
      }),
    ])
    .safeParse(command);
  if (!input.success) throw new Error('가전기기 입력을 확인해 주세요.');
  const config = parseConfig(applianceSnapshot(email));
  const action = input.data;
  if (action.type === 'add') {
    if (config.custom.length >= 18)
      throw new Error('추가 가전기기는 최대 18개까지 등록할 수 있어요.');
    const item = customSchema.safeParse({ ...action, id: crypto.randomUUID() });
    if (!item.success)
      throw new Error(
        '기기 이름, 사용 시간(30분 단위), 소비전력(0 초과~20kW)을 확인해 주세요.',
      );
    config.custom.push(item.data);
  } else if (action.type === 'restore') {
    config.removed = [];
    config.enabled = {};
  } else {
    const exists =
      defaults.some(
        (item) => item.id === action.id && !config.removed.includes(item.id),
      ) || config.custom.some((item) => item.id === action.id);
    if (!exists) throw new Error('현재 등록된 기기를 선택해 주세요.');
    if (action.type === 'toggle')
      config.enabled[action.id] = !(config.enabled[action.id] ?? true);
    else {
      if (defaults.some((item) => item.id === action.id))
        config.removed.push(action.id);
      config.custom = config.custom.filter((item) => item.id !== action.id);
      delete config.enabled[action.id];
    }
  }
  try {
    localStorage.setItem(
      demoAccountStorageKey('polar-appliances-v1', email),
      JSON.stringify(config),
    );
  } catch {
    throw new Error(
      '가전기기를 저장하지 못했습니다. 브라우저 저장 설정을 확인해 주세요.',
    );
  }
  window.dispatchEvent(new Event(APPLIANCE_EVENT));
}
