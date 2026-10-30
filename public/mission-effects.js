/* global state, showPage */

(() => {
  if (
    typeof state === 'undefined' ||
    typeof window.completeMission !== 'function' ||
    typeof window.feedBear !== 'function'
  ) {
    return;
  }

  const reducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function floatingItem(text, left, top, size = 28) {
    const item = document.createElement('span');
    item.textContent = text;
    item.setAttribute('aria-hidden', 'true');
    Object.assign(item.style, {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      fontSize: `${size}px`,
      lineHeight: '1',
      pointerEvents: 'none',
      zIndex: '50',
    });
    document.body.appendChild(item);
    return item;
  }

  async function animateAndRemove(item, frames, options) {
    try {
      await item.animate(frames, options).finished;
    } finally {
      item.remove();
    }
  }

  function fireworks() {
    if (reducedMotion()) return;

    const colors = ['#10b981', '#38bdf8', '#fbbf24', '#fb7185', '#a78bfa'];

    for (let side = 0; side < 2; side++) {
      for (let index = 0; index < 28; index++) {
        const angle = (index / 28) * Math.PI * 2;
        const distance = 75 + Math.random() * 100;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const item = floatingItem(
          '✦',
          innerWidth * (side === 0 ? 0.28 : 0.72),
          Math.min(innerHeight * 0.35, 280),
          12 + Math.random() * 10,
        );
        item.style.color = colors[index % colors.length];

        void animateAndRemove(
          item,
          [
            { transform: 'translate(0, 0) scale(0)', opacity: 0 },
            {
              transform: `translate(${x}px, ${y}px) scale(1)`,
              opacity: 1,
              offset: 0.45,
            },
            {
              transform: `translate(${x * 1.2}px, ${y + 100}px) scale(0.3)`,
              opacity: 0,
            },
          ],
          { duration: 1100 + Math.random() * 400, easing: 'ease-out' },
        );
      }
    }
  }

  const originalComplete = window.completeMission;

  window.completeMission = function (...args) {
    const before = Object.keys(state.done).length;
    const result = originalComplete.apply(this, args);

    if (Object.keys(state.done).length > before) {
      window.setPolarBearMood?.('happy');
      fireworks();
    }

    return result;
  };

  const originalFeed = window.feedBear;
  let feeding = false;

  window.feedBear = async function (...args) {
    if (feeding) return;

    const before = state.food;
    originalFeed.apply(this, args);
    if (state.food >= before) {
      window.setPolarBearMood?.('sad');
      return;
    }

    feeding = true;

    try {
      window.setPolarBearMood?.('idle');
      showPage('bear');
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      await new Promise(requestAnimationFrame);

      const bear = document.getElementById('growBear');
      if (!bear) return;

      let message = document.getElementById('feedingMessage');
      if (!message) {
        message = document.createElement('p');
        message.id = 'feedingMessage';
        message.setAttribute('role', 'status');
        message.style.cssText =
          'margin:8px 0;color:#08784c;font-size:14px;font-weight:800';
        bear.after(message);
      }

      if (reducedMotion()) {
        window.setPolarBearMood?.('happy');
        message.textContent = '먹이를 먹었어요! 북극곰이 행복해해요 💚';
        return;
      }

      message.textContent = '물고기가 북극곰에게 날아가요!';
      const rect = bear.getBoundingClientRect();
      const mouthX = rect.left + rect.width / 2;
      const mouthY = rect.top + rect.height * 0.44;
      const fish = floatingItem('🐟', mouthX, mouthY, 38);

      await animateAndRemove(
        fish,
        [
          {
            transform: 'translate(-130px, 100px) rotate(-25deg) scale(1)',
            opacity: 1,
          },
          {
            transform: 'translate(-65px, -25px) rotate(10deg) scale(1)',
            opacity: 1,
            offset: 0.55,
          },
          { transform: 'translate(-15px, 0) scale(0.15)', opacity: 0 },
        ],
        { duration: 850, easing: 'ease-in-out' },
      );

      message.textContent = '냠냠! 정말 맛있어요!';
      window.setPolarBearMood?.('eating');
      await bear.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.1, 0.92)' },
          { transform: 'scale(1)' },
        ],
        { duration: 300, iterations: 3 },
      ).finished;

      message.textContent = '고마워요! 북극곰이 행복해해요 💚';
      window.setPolarBearMood?.('happy');
      const happyRect = bear.getBoundingClientRect();

      for (let index = 0; index < 5; index++) {
        const heart = floatingItem(
          index % 2 ? '✨' : '💚',
          happyRect.left + happyRect.width / 2 + (index - 2) * 24,
          happyRect.top + 25,
          24,
        );
        void animateAndRemove(
          heart,
          [
            { transform: 'translateY(0) scale(0.5)', opacity: 0 },
            {
              transform: 'translateY(-30px) scale(1)',
              opacity: 1,
              offset: 0.3,
            },
            { transform: 'translateY(-100px) scale(0.8)', opacity: 0 },
          ],
          { duration: 1200, delay: index * 70, easing: 'ease-out' },
        );
      }

      await bear.animate(
        [
          { transform: 'translateY(0) rotate(0)' },
          { transform: 'translateY(-18px) rotate(-7deg)' },
          { transform: 'translateY(0) rotate(7deg)' },
          { transform: 'translateY(0) rotate(0)' },
        ],
        { duration: 650, iterations: 2 },
      ).finished;
    } finally {
      feeding = false;
    }
  };
})();
