/* global state */

(() => {
  const bear = document.getElementById('growBear');
  if (!bear || typeof window.feedBear !== 'function') return;
  const HUNGER_MS = 12 * 60 * 60 * 1000;
  const now = Date.now();
  const validTime = (value) =>
    Number.isFinite(value) && value > 0 && value <= now;
  if (
    !state.bearCare ||
    typeof state.bearCare !== 'object' ||
    Array.isArray(state.bearCare)
  ) {
    state.bearCare = { startedAt: now, lastFedAt: null };
  }
  if (!validTime(state.bearCare.startedAt)) state.bearCare.startedAt = now;
  if (!validTime(state.bearCare.lastFedAt)) state.bearCare.lastFedAt = null;

  const panel = document.createElement('div');
  panel.id = 'bearHungerStatus';
  panel.style.cssText =
    'margin:12px 0;padding:14px;border-radius:18px;background:#e4faf1;color:#145849;text-align:center;line-height:1.6';
  const status = document.createElement('strong');
  status.setAttribute('role', 'status');
  const detail = document.createElement('p');
  detail.style.cssText = 'margin:5px 0;font-size:12px';
  const clock = document.createElement('div');
  clock.id = 'bearHungerTimer';
  clock.setAttribute('role', 'timer');
  clock.setAttribute('aria-live', 'off');
  clock.style.cssText =
    'margin:8px 0;font-size:30px;font-weight:900;font-variant-numeric:tabular-nums';
  const feed = document.createElement('button');
  feed.type = 'button';
  feed.className = 'btn primary';
  feed.style.cssText = 'min-height:44px;margin-top:6px';
  feed.textContent = '🐟 북극곰에게 먹이 주기';
  feed.onclick = () => window.feedBear();
  panel.append(status, clock, detail, feed);
  bear.before(panel);

  function text(element, value) {
    if (element.textContent !== value) element.textContent = value;
  }

  function updateHunger() {
    const care = state.bearCare;
    const lastMeal = care.lastFedAt ?? care.startedAt;
    const remaining = Math.max(0, lastMeal + HUNGER_MS - Date.now());
    const hungry = remaining === 0;
    const minutes = Math.ceil(remaining / 60000);
    text(
      clock,
      `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
    );
    clock.setAttribute(
      'aria-label',
      `배고프기까지 ${Math.floor(minutes / 60)}시간 ${minutes % 60}분`,
    );
    const changed = window.polarBearHungry !== hungry;
    window.polarBearHungry = hungry;
    panel.dataset.hungry = String(hungry);
    panel.style.background = hungry ? '#fff0f1' : '#e4faf1';
    panel.style.color = hungry ? '#9f2442' : '#145849';
    text(
      status,
      hungry
        ? '배고파요! 먹이를 주세요 🐟'
        : care.lastFedAt
          ? '배불러요! 고마워요 💚'
          : '북극곰을 돌봐 주세요 💚',
    );
    if (hungry) {
      text(
        detail,
        '12시간 동안 먹이를 먹지 못했어요. 미션으로 먹이를 모아 주세요.',
      );
      const message = document.getElementById('feedingMessage');
      if (message) text(message, '배고파요. 맛있는 먹이를 기다리고 있어요!');
    } else {
      text(
        detail,
        '배고프기까지 남은 시간 (시간:분) · 먹이를 주면 12시간이 다시 시작돼요.',
      );
    }
    if (changed) window.setPolarBearMood?.('level');
  }

  let timer;
  function refreshHunger() {
    clearTimeout(timer);
    updateHunger();
    const lastMeal = state.bearCare.lastFedAt ?? state.bearCare.startedAt;
    const remaining = Math.max(0, lastMeal + HUNGER_MS - Date.now());
    // Recalculate from the saved meal time at each minute boundary, avoiding drift.
    timer = setTimeout(
      refreshHunger,
      remaining > 0 ? (remaining % 60000 || 60000) + 10 : 60000,
    );
  }

  const originalFeed = window.feedBear;
  window.feedBear = function (...args) {
    const before = state.food;
    const result = originalFeed.apply(this, args);
    if (state.food < before) {
      state.bearCare.lastFedAt = Date.now();
      window.save();
    }
    return result;
  };

  const originalRender = window.render;
  window.render = function (...args) {
    const result = originalRender.apply(this, args);
    refreshHunger();
    return result;
  };

  window.save();
  window.addEventListener('pageshow', refreshHunger);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshHunger();
  });
})();
