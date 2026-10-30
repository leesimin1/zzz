import { demoElectricityBill } from './demo-electricity';

// A repeatable presentation fixture, never an estimate of a real home's usage.
export function demoUsageForAddress(address: string) {
  const key = address.normalize('NFC').replace(/\s/g, '').toLowerCase();
  if (!key) return demoElectricityBill.currentMonthUsageKwh;
  let hash = 2166136261;
  for (const character of key) {
    hash = Math.imul(hash ^ (character.codePointAt(0) ?? 0), 16777619);
  }
  return 180 + ((hash >>> 0) % 241);
}
