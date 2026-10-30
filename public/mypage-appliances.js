(() => {
  window.applyDemoAppliances = function (items, energyAmount) {
    const head = document.querySelector('.device-head');
    if (!head) return;
    const card = head.parentElement;
    card
      .querySelectorAll('.device-row,.shared-device-empty')
      .forEach((row) => row.remove());
    const total = items.reduce(
      (sum, item) => sum + (item.enabled ? item.monthlyKwh : 0),
      0,
    );
    let remaining = energyAmount;
    const enabled = items.filter((item) => item.enabled);
    for (const item of items) {
      const amount =
        !item.enabled || !total
          ? 0
          : item === enabled.at(-1)
            ? remaining
            : Math.round((energyAmount * item.monthlyKwh) / total);
      remaining -= amount;
      const row = document.createElement('div');
      row.className = 'device-row';
      row.dataset.applianceId = item.id;
      const top = document.createElement('div');
      top.className = 'device-top';
      const name = document.createElement('span');
      name.className = 'device-name';
      name.textContent = item.name;
      const usage = document.createElement('span');
      usage.className = 'device-kwh';
      usage.textContent = `${item.enabled ? item.monthlyKwh : 0} kWh · ${item.enabled && total ? Math.round((item.monthlyKwh / total) * 100) : 0}%${item.enabled ? '' : ' · 사용 안 함'}`;
      const cost = document.createElement('strong');
      cost.className = 'device-cost';
      cost.textContent = `약 ${amount.toLocaleString('ko-KR')}원`;
      top.append(name, usage, cost);
      const meter = document.createElement('div');
      meter.className = 'device-meter';
      const fill = document.createElement('span');
      fill.style.width = `${item.enabled && total ? (item.monthlyKwh / total) * 100 : 0}%`;
      meter.appendChild(fill);
      row.append(top, meter);
      card.insertBefore(row, card.querySelector('.notice'));
    }
    if (!items.length) {
      const note = document.createElement('p');
      note.className = 'shared-device-empty';
      note.textContent =
        '등록된 가전기기가 없어요. 그래프 화면에서 기기를 추가해 주세요.';
      card.appendChild(note);
    }
    let link = document.getElementById('manageSharedAppliances');
    if (!link) {
      link = document.createElement('a');
      link.id = 'manageSharedAppliances';
      link.href = '/solar';
      link.target = '_top';
      link.className = 'primary';
      link.style.cssText =
        'display:block;text-align:center;margin-top:14px;text-decoration:none';
      link.textContent = '가전기기 추가·사용 설정 →';
      card.appendChild(link);
    }
    const tip = document.querySelector('.tip-card p');
    if (tip) {
      const largest = enabled
        .slice()
        .sort((a, b) => b.monthlyKwh - a.monthlyKwh)[0];
      tip.textContent = largest
        ? `${largest.name}의 사용량이 가장 많아요. 그래프 화면에서 사용 기기를 조절하며 변화를 확인해 보세요.`
        : '사용 중인 가전기기가 없어요.';
    }
  };
})();
