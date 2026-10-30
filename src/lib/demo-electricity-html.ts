import 'server-only';

import {
  demoElectricityBill,
  electricitySavings,
  electricitySavingsPercent,
  estimatedElectricityBill,
  formatBillAmount,
} from './demo-electricity';

export function withDemoElectricityBill(html: string) {
  let result = html
    .replaceAll(
      '347<small> kWh',
      `${demoElectricityBill.currentMonthUsageKwh}<small> kWh`,
    )
    .replaceAll('65,000', formatBillAmount(estimatedElectricityBill))
    .replaceAll('12,000', formatBillAmount(electricitySavings))
    .replaceAll('15.6%', `${electricitySavingsPercent}%`)
    .replaceAll(
      "['10월 예상',65000,",
      `['10월 예상',${estimatedElectricityBill},`,
    )
    .replaceAll(
      "['9월',77000,",
      `['9월',${demoElectricityBill.previousMonthAmount},`,
    );

  for (const item of demoElectricityBill.items) {
    const pattern = new RegExp(
      `(<div class="breakdown-row"><span>${item.label}(?: <small>[^<]*</small>)?</span><strong>)[\\d,]+원(</strong>)`,
      'g',
    );
    result = result.replace(
      pattern,
      (_, prefix: string, suffix: string) =>
        `${prefix}${formatBillAmount(item.amount)}원${suffix}`,
    );
  }

  const weeklyAmounts = [12000, 14300, 16600].map((amount) =>
    Math.round((amount / 65000) * estimatedElectricityBill),
  );
  weeklyAmounts.push(
    estimatedElectricityBill -
      weeklyAmounts.reduce((sum, amount) => sum + amount, 0),
  );
  const weeklyRows = weeklyAmounts.map((amount, index) => [
    `${index + 1}주차`,
    amount,
    [64, 72, 91, 120][index],
  ]);
  return result.replace(
    "1:[['1주차',12000,64],['2주차',14300,72],['3주차',16600,91],['4주차',22100,120]]",
    `1:${JSON.stringify(weeklyRows)}`,
  );
}
