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

// Presentation-only amounts, scaled from the existing fixture (not a KEPCO tariff).
export function demoBillForUsage(usage: number) {
  const items = demoElectricityBill.items.map((item) => ({
    label: item.label,
    amount:
      item.label === '기본요금'
        ? item.amount
        : Math.round(
            (item.amount * usage) /
              demoElectricityBill.currentMonthUsageKwh /
              10,
          ) * 10,
  }));
  const amount = items.reduce((sum, item) => sum + item.amount, 0);
  const savings = demoElectricityBill.previousMonthAmount - amount;
  return {
    usage,
    amount,
    savings,
    items,
    savingsPercent: (
      (Math.abs(savings) / demoElectricityBill.previousMonthAmount) *
      100
    ).toFixed(1),
  };
}
