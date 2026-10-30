/* global state, selected, doneKey */

(() => {
  const totalElement = document.getElementById('missionTotal');
  if (!totalElement) return;

  const badges = [
    { count: 1, name: '첫걸음', icon: '🌱' },
    { count: 5, name: '절약 새싹', icon: '🌿' },
    { count: 10, name: '에너지 지킴이', icon: '⚡' },
    { count: 25, name: '빙하 수호자', icon: '🧊' },
    { count: 50, name: '환경 영웅', icon: '🏅' },
    { count: 100, name: '지구의 친구', icon: '🌎' },
  ];

  if (
    !state.missionActivity ||
    typeof state.missionActivity !== 'object' ||
    Array.isArray(state.missionActivity)
  ) {
    state.missionActivity = {};
  }

  const style = document.createElement('style');
  style.textContent = `
    .activity-open { display:flex; align-items:center; justify-content:space-between; gap:12px; width:100%; padding:4px 0; border:0; background:none; color:inherit; font:inherit; text-align:left; cursor:pointer; }
    .activity-open:focus-visible,.activity-dialog button:focus-visible { outline:3px solid #079578; outline-offset:3px; }
    .activity-dialog { box-sizing:border-box; width:calc(100% - 24px); max-width:480px; max-height:calc(100dvh - 32px); padding:0; border:1px solid #cfebf5; border-radius:24px; color:#17365e; background:#f2fbff; box-shadow:0 16px 70px #12325340; }
    .activity-dialog::backdrop { background:#12325380; }
    .activity-header { position:sticky; top:0; z-index:1; display:flex; align-items:center; justify-content:space-between; padding:18px 20px; background:#f2fbfff5; border-bottom:1px solid #dceff6; }
    .activity-header h2 { margin:0; font-size:19px; }
    .activity-close { width:44px; height:44px; border:0; border-radius:50%; background:white; color:#17365e; font-size:26px; cursor:pointer; }
    .activity-body { padding:20px; }
    .activity-summary { padding:20px; border-radius:20px; background:linear-gradient(120deg,#daf5ff,#e0faee); text-align:center; }
    .activity-summary strong { display:block; margin:6px 0; font-size:36px; color:#087c69; }
    .activity-body h3 { margin:24px 0 12px; font-size:17px; }
    .activity-note { margin:8px 0; font-size:12px; line-height:1.7; color:#526b82; }
    .activity-badges { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; padding:0; list-style:none; }
    .activity-badge { padding:16px 8px; border:1px solid #d8e8ef; border-radius:18px; text-align:center; background:#e9eff3; color:#617488; }
    .activity-badge.earned { border-color:#8cdcc0; background:#fff; color:#145849; box-shadow:0 4px 14px #0f9b6910; }
    .activity-medal { display:grid; place-items:center; width:58px; height:58px; margin:0 auto 10px; border-radius:50%; background:#dce4ea; font-size:28px; }
    .earned .activity-medal { background:linear-gradient(135deg,#fff4b0,#fbd17a); border:3px solid #ffeac0; box-shadow:0 3px 0 #dfb758; }
    .activity-badge b,.activity-badge small { display:block; margin:6px 0; }
    .activity-badge small { font-size:12px; }
    .activity-badge progress { width:85%; height:6px; accent-color:#10b981; }
    .activity-history { list-style:none; margin:0; padding:0; }
    .activity-history li { padding:14px 0; border-bottom:1px solid #deedf3; }
    .activity-history b { display:block; margin:4px 0; font-size:14px; }
    .activity-history time,.activity-history small { font-size:12px; color:#526b82; }
  `;
  document.head.appendChild(style);

  const row = totalElement.closest('.row');
  const openButton = document.createElement('button');
  openButton.type = 'button';
  openButton.className = 'activity-open';
  openButton.setAttribute('aria-haspopup', 'dialog');
  openButton.setAttribute('aria-controls', 'missionActivityDialog');
  while (row.firstChild) openButton.appendChild(row.firstChild);
  const arrow = document.createElement('span');
  arrow.textContent = '›';
  arrow.setAttribute('aria-hidden', 'true');
  openButton.appendChild(arrow);
  row.replaceWith(openButton);
  const hint = document.createElement('p');
  hint.className = 'activity-note';
  hint.textContent = '눌러서 완료한 미션과 수집한 배지를 확인해 보세요.';
  openButton.after(hint);

  const dialog = document.createElement('dialog');
  dialog.id = 'missionActivityDialog';
  dialog.className = 'activity-dialog';
  dialog.setAttribute('aria-labelledby', 'missionActivityTitle');
  dialog.innerHTML = `
    <header class="activity-header">
      <h2 id="missionActivityTitle">내 활동 기록</h2>
      <button type="button" class="activity-close" aria-label="활동 기록 닫기">×</button>
    </header>
    <div class="activity-body">
      <div class="activity-summary"><span>지금까지 완료한 미션</span><strong id="activityTotal"></strong><span id="activityNext"></span></div>
      <h3 id="activityBadgeTitle">나의 배지 컬렉션</h3>
      <p class="activity-note">미션 완료 횟수에 따라 배지가 자동으로 수집돼요.</p>
      <ul class="activity-badges" aria-labelledby="activityBadgeTitle"></ul>
      <h3>미션별 완료 횟수</h3>
      <ul class="activity-counts activity-history"></ul>
      <h3>완료한 미션 기록</h3>
      <p id="activityLegacy" class="activity-note"></p>
      <ul class="activity-history"></ul>
      <p class="activity-note">현재 로그인한 계정의 활동입니다. 이 브라우저에 계정별로 저장되며, 브라우저 데이터를 삭제하면 기록과 배지가 초기화됩니다.</p>
    </div>`;
  document.body.appendChild(dialog);
  dialog.querySelector('.activity-close').onclick = () => dialog.close();
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });

  function completionKeys() {
    return Object.keys(state.done).filter((key) => Boolean(state.done[key]));
  }

  function renderActivity() {
    const keys = completionKeys();
    const total = keys.length;
    totalElement.textContent = `완료 미션 ${total}회`;
    dialog.querySelector('#activityTotal').textContent = `${total}회`;
    const next = badges.find((badge) => total < badge.count);
    dialog.querySelector('#activityNext').textContent = next
      ? `다음 배지 ‘${next.name}’까지 ${next.count - total}회 남았어요`
      : '모든 배지를 모았어요!';
    const earned = badges.filter((badge) => total >= badge.count).length;
    dialog.querySelector('#activityBadgeTitle').textContent =
      `나의 배지 컬렉션 · ${earned}/${badges.length}`;
    const collection = dialog.querySelector('.activity-badges');
    collection.replaceChildren();
    for (const badge of badges) {
      const unlocked = total >= badge.count;
      const item = document.createElement('li');
      item.className = `activity-badge${unlocked ? ' earned' : ''}`;
      // Badge names and icons are fixed application data.
      item.innerHTML = `<span class="activity-medal" aria-hidden="true">${unlocked ? badge.icon : '🔒'}</span><b>${badge.name}</b><small>미션 ${badge.count}회 완료</small><small>${unlocked ? '✓ 달성 완료 · 수집됨' : `${total}/${badge.count}회 · 도전 중`}</small><progress max="${badge.count}" value="${Math.min(total, badge.count)}" aria-label="${badge.name} 달성 진행률"></progress>`;
      collection.appendChild(item);
    }

    const entries = keys
      .map((key) => state.missionActivity[key])
      .filter(
        (entry) =>
          entry &&
          typeof entry.title === 'string' &&
          typeof entry.category === 'string' &&
          Number.isFinite(entry.completedAt) &&
          entry.completedAt > 0 &&
          entry.completedAt <= 8640000000000000,
      )
      .sort((a, b) => b.completedAt - a.completedAt);
    const legacy = total - entries.length;
    const counts = new Map();
    for (const entry of entries) {
      const key = `${entry.category}: ${entry.title}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const countList = dialog.querySelector('.activity-counts');
    countList.replaceChildren();
    for (const [name, count] of counts) {
      const item = document.createElement('li');
      item.textContent = `${name} · ${count}회`;
      countList.appendChild(item);
    }
    if (legacy || total === 0) {
      const item = document.createElement('li');
      item.textContent = legacy
        ? `상세 정보가 없는 이전 미션 · ${legacy}회`
        : '첫 미션을 완료하면 미션별 횟수가 표시돼요.';
      countList.appendChild(item);
    }
    dialog.querySelector('#activityLegacy').textContent =
      total === 0
        ? '아직 완료한 미션이 없어요. 첫 미션에 도전하고 배지를 모아 보세요!'
        : legacy > 0
          ? `이전 완료 기록 ${legacy}회도 누적 횟수와 배지에 포함돼요. 이전 기록에는 미션 이름과 날짜가 저장되어 있지 않아요.`
          : '최근 완료한 미션부터 보여드려요.';
    const history = dialog.querySelector(
      '.activity-history:not(.activity-counts)',
    );
    history.replaceChildren();
    for (const entry of entries.slice(0, 100)) {
      const item = document.createElement('li');
      const category = document.createElement('small');
      category.textContent = `${entry.category} · 완료`;
      const title = document.createElement('b');
      title.textContent = entry.title;
      const time = document.createElement('time');
      const date = new Date(entry.completedAt);
      time.dateTime = date.toISOString();
      time.textContent = date.toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
      });
      item.append(category, title, time);
      history.appendChild(item);
    }
    if (entries.length > 100) {
      const note = document.createElement('li');
      note.textContent =
        '최근 100개의 상세 기록을 표시하고 있어요. 누적 횟수에는 전체 기록이 포함됩니다.';
      history.appendChild(note);
    }
  }

  openButton.onclick = () => {
    renderActivity();
    dialog.showModal();
  };

  const originalRender = window.render;
  window.render = function (...args) {
    const result = originalRender.apply(this, args);
    renderActivity();
    return result;
  };

  const originalComplete = window.completeMission;
  window.completeMission = function (...args) {
    const mission = selected ? { ...selected } : null;
    const key = mission ? doneKey(mission) : null;
    const alreadyDone = key && Boolean(state.done[key]);
    const result = originalComplete.apply(this, args);
    if (key && !alreadyDone && state.done[key]) {
      state.missionActivity[key] = {
        title: mission.title,
        category: mission.cat,
        completedAt: Date.now(),
      };
      window.save();
    }
    return result;
  };

  renderActivity();
})();
