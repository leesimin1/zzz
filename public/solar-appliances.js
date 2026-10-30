/* global DEV, S */

(() => {
  const original = document.getElementById('ltpl');
  if (!original) return;
  const list = original.cloneNode(false);
  original.replaceWith(list);
  list.setAttribute('aria-label', '가전기기별 사용량');
  const summary = document.createElement('p');
  summary.className = 'hint';
  list.after(summary);
  const restore = document.createElement('button');
  restore.type = 'button';
  restore.className = 'at';
  restore.textContent = '기본 가전기기 복원';
  summary.after(restore);
  let devices = [];

  function change(command) {
    const result = window.requestDemoApplianceChange?.(command);
    if (!result?.ok)
      document.getElementById('dm').textContent =
        result?.error || '화면을 새로고침한 후 다시 시도해 주세요.';
    return result?.ok;
  }
  restore.onclick = () => change({ type: 'restore' });

  function draw() {
    DEV.splice(
      0,
      DEV.length,
      ...devices.map((item) => ({
        k: item.id,
        n: item.name,
        s: item.start,
        e: item.end,
        kw: item.powerKw,
        u: 1,
      })),
    );
    S.dev = Object.fromEntries(devices.map((item) => [item.id, item.enabled]));
    list.replaceChildren();
    for (const item of devices) {
      const card = document.createElement('div');
      card.className = `source-card${item.enabled ? ' on' : ''}`;
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'source-main';
      toggle.setAttribute('aria-pressed', String(item.enabled));
      const name = document.createElement('span');
      name.className = 'nm';
      name.textContent = item.name;
      const detail = document.createElement('small');
      detail.textContent = `월 ${item.enabled ? item.monthlyKwh.toLocaleString('ko-KR') : 0} kWh`;
      const schedule = document.createElement('small');
      schedule.textContent = `${item.start}–${item.end}시 · ${item.powerKw.toLocaleString('ko-KR', { maximumFractionDigits: 3 })} kW`;
      toggle.append(name, detail, schedule);
      toggle.onclick = () => change({ type: 'toggle', id: item.id });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'source-remove';
      remove.textContent = '×';
      remove.setAttribute('aria-label', `${item.name} 삭제`);
      remove.onclick = () => change({ type: 'remove', id: item.id });
      card.append(toggle, remove);
      list.appendChild(card);
    }
    const monthly = devices.reduce(
      (sum, item) => sum + (item.enabled ? item.monthlyKwh : 0),
      0,
    );
    summary.textContent = `월 합계 ${monthly.toLocaleString('ko-KR', { maximumFractionDigits: 2 })} kWh · 사용 시간과 소비전력으로 계산한 30일 기준 데모입니다. 기기를 누르면 사용 여부가 바뀌어요.`;
  }
  window.devs = draw;
  window.applyDemoAppliances = function (items) {
    devices = items;
    draw();
    window.render();
  };
  list.replaceChildren();
  document.getElementById('da').onclick = () => {
    const value = (id) => document.getElementById(id).value;
    if (value('ds') === '' || value('de') === '' || value('dk') === '') {
      document.getElementById('dm').textContent =
        '사용 시작·종료 시각과 소비전력을 입력해 주세요.';
      return;
    }
    if (
      change({
        type: 'add',
        name: value('dn').trim(),
        start: Number(value('ds')),
        end: Number(value('de')),
        powerKw: Number(value('dk')),
      })
    ) {
      ['dn', 'ds', 'de', 'dk'].forEach((id) => {
        document.getElementById(id).value = '';
      });
      document.getElementById('dm').textContent =
        '가전기기를 추가했어요. 마이페이지와 그래프에도 반영됩니다.';
    }
  };
})();
