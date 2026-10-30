import {
  demoElectricityBill,
  demoBillForUsage,
  formatBillAmount,
} from './demo-electricity';

export function withDemoElectricityBill(
  html: string,
  usage: number = demoElectricityBill.currentMonthUsageKwh,
) {
  const bill = demoBillForUsage(usage);
  const estimatedElectricityBill = bill.amount;
  const electricitySavings = Math.abs(bill.savings);
  const electricitySavingsPercent = bill.savingsPercent;
  let result = html
    .replaceAll('347 kWh', `${usage} kWh`)
    .replaceAll(
      '12,000원 적게',
      `${formatBillAmount(electricitySavings)}원 ${bill.savings >= 0 ? '적게' : '많이'}`,
    )
    .replaceAll(
      '▼ 15.6%',
      `${bill.savings >= 0 ? '▼' : '▲'} ${electricitySavingsPercent}%`,
    )
    .replaceAll('347<small> kWh', `${usage}<small> kWh`)
    .replaceAll('65,000', formatBillAmount(estimatedElectricityBill))
    .replaceAll('52,700', formatBillAmount(bill.items[0].amount))
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

  for (const item of bill.items) {
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

  let deviceRemaining = bill.items[0].amount;
  let deviceIndex = 0;
  const deviceWeights = [17900, 11800, 7400, 5500, 3600, 6500];
  result = result.replace(
    /(<strong class="device-cost">약 )[\d,]+원(<\/strong>)/g,
    (_, prefix: string, suffix: string) => {
      const amount =
        deviceIndex === deviceWeights.length - 1
          ? deviceRemaining
          : Math.round(
              (deviceWeights[deviceIndex] / 52700) * bill.items[0].amount,
            );
      deviceRemaining -= amount;
      deviceIndex++;
      return `${prefix}${formatBillAmount(amount)}원${suffix}`;
    },
  );

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
