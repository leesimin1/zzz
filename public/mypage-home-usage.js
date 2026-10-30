/* global tariffData, renderTariff */

window.applyDemoHomeUsage = function (usage) {
  if (!Number.isFinite(usage) || usage < 0) return;
  for (const period of [3, 6, 12]) {
    const rows = tariffData[period];
    rows[rows.length - 1][2] = usage;
  }
  let remaining = usage;
  tariffData[1].forEach((row, index, rows) => {
    row[2] =
      index === rows.length - 1
        ? remaining
        : Math.round((row[2] / 347) * usage);
    remaining -= row[2];
  });
  remaining = usage;
  const devices = document.querySelectorAll('.device-kwh');
  devices.forEach((element, index) => {
    const original = parseInt(element.textContent, 10);
    const amount =
      index === devices.length - 1
        ? remaining
        : Math.round((original / 347) * usage);
    remaining -= amount;
    element.textContent = `${amount} kWh · ${usage ? Math.round((amount / usage) * 100) : 0}%`;
    element
      .closest('.device-row')
      .querySelector('.device-meter span').style.width =
      `${usage ? (amount / usage) * 100 : 0}%`;
  });
  renderTariff(6);
};
