export const demoElectricityBill = {
  currentMonthUsageKwh: 347,
  previousMonthAmount: 77000,
  items: [
    { label: '전력량요금', amount: 52700 },
    { label: '기본요금', amount: 1600 },
    { label: '기후환경요금', amount: 2800 },
    { label: '연료비 조정액', amount: 0 },
    { label: '부가가치세', amount: 5710 },
    { label: '전력산업기반기금', amount: 2190 },
  ],
} as const;

export const estimatedElectricityBill = demoElectricityBill.items.reduce(
  (sum, item) => sum + item.amount,
  0,
);

export const electricitySavings =
  demoElectricityBill.previousMonthAmount - estimatedElectricityBill;

export const electricitySavingsPercent = (
  (electricitySavings / demoElectricityBill.previousMonthAmount) *
  100
).toFixed(1);

export function formatBillAmount(amount: number) {
  return amount.toLocaleString('ko-KR');
}
