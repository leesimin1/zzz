(() => {
  const labels = {
    idle: '기본',
    wave: '인사하는',
    happy: '웃는',
    sad: '우는',
    thinking: '생각하는',
    cheer: '응원하는',
    eating: '먹이를 먹는',
    sleeping: '잠자는',
  };
  const levelLooks = [
    { mood: 'sleeping', color: '#e0f2fe' },
    { mood: 'wave', color: '#dcfce7' },
    { mood: 'eating', color: '#fff2cf' },
    { mood: 'cheer', color: '#ede9fe' },
    { mood: 'thinking', color: '#dbeafe' },
    { mood: 'happy', color: '#fef3c7' },
  ];
  let growthMood = null;
  let moodReset = null;
  let scheduled = false;

  function picture(mood) {
    const image = document.createElement('img');
    image.src = `/polar-bear/${mood}.png`;
    image.alt = `${labels[mood]} 북극곰`;
    image.className = 'polar-character-image';
    image.setAttribute('data-polar-character', 'true');
    return image;
  }

  function setFigure(element, mood) {
    if (!element) return;
    let image = element.querySelector(':scope > img[data-polar-character]');
    if (!image) {
      image = picture(mood);
      element.replaceChildren(image);
    }
    const source = `/polar-bear/${mood}.png`;
    if (image.getAttribute('src') !== source) image.src = source;
    image.alt = `${labels[mood]} 북극곰`;
    element.dataset.polarMood = mood;
  }

  function replaceBearText() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (
        /🐻‍❄️|🐻/u.test(node.textContent) &&
        !node.parentElement?.closest('script,style,textarea,input,select')
      )
        nodes.push(node);
    }
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const part of node.textContent.split(/(🐻‍❄️|🐻)/u)) {
        if (part === '🐻‍❄️' || part === '🐻') {
          const image = picture('wave');
          image.className = 'polar-inline-bear';
          image.alt = '';
          image.setAttribute('aria-hidden', 'true');
          fragment.appendChild(image);
        } else {
          fragment.appendChild(document.createTextNode(part));
        }
      }
      node.parentNode?.replaceChild(fragment, node);
    }
  }

  function synchronize() {
    const reportedLevel =
      typeof window.level === 'function' ? window.level() : 1;
    const currentLevel = Number.isFinite(reportedLevel)
      ? Math.min(levelLooks.length, Math.max(1, Math.floor(reportedLevel)))
      : 1;
    const look = levelLooks[currentLevel - 1];
    const growBear = document.getElementById('growBear');
    const restingMood = window.polarBearHungry ? 'sad' : look.mood;
    setFigure(growBear, growthMood ?? restingMood);
    if (growBear) {
      growBear.dataset.polarLevel = String(currentLevel);
      growBear.style.setProperty(
        '--polar-size',
        `${170 + currentLevel * 12}px`,
      );
    }
    document.querySelectorAll('#levelList .level').forEach((element, index) => {
      const appearance = levelLooks[index];
      const avatar = element.firstElementChild;
      if (!appearance || !avatar) return;
      avatar.classList.add('polar-level-avatar');
      avatar.style.fontSize = '0';
      avatar.style.setProperty('--polar-level-color', appearance.color);
      avatar.dataset.polarLocked = String(index + 1 > currentLevel);
      setFigure(avatar, appearance.mood);
      avatar.querySelector('img').alt =
        `Lv.${index + 1} ${labels[appearance.mood]} 북극곰${index + 1 > currentLevel ? ' (잠김)' : ''}`;
    });
    document.querySelectorAll('.banner .bear').forEach((element) => {
      setFigure(element, growthMood ?? restingMood);
    });
    document.querySelectorAll('.bear-reaction').forEach((element) => {
      const mood = element.textContent.includes('😢')
        ? 'sad'
        : element.textContent.includes('😄')
          ? 'happy'
          : element.dataset.polarMood || 'happy';
      setFigure(element, mood);
    });
    document.querySelectorAll('.mission').forEach((element) => {
      if (element.querySelector('[role="timer"]')) {
        setFigure(element.querySelector('.micon'), 'sleeping');
      }
    });
    document
      .querySelectorAll(
        '.avatar img,.detail-art img,.mission-picture img,.quiz-scene-full img',
      )
      .forEach((image) => {
        const mood = image.closest('.quiz-scene-full')
          ? 'thinking'
          : image.closest('.mission-picture')
            ? 'cheer'
            : 'wave';
        const source = `/polar-bear/${mood}.png`;
        if (image.getAttribute('src') !== source) image.src = source;
        image.alt = `${labels[mood]} 북극곰`;
      });
    replaceBearText();
  }

  window.setPolarBearMood = function (mood) {
    if (mood !== 'level' && !Object.hasOwn(labels, mood)) return;
    clearTimeout(moodReset);
    growthMood = mood === 'level' ? null : mood;
    synchronize();
    if (growthMood !== null) {
      moodReset = setTimeout(() => {
        growthMood = null;
        synchronize();
      }, 4500);
    }
  };

  if (typeof window.render === 'function') {
    const originalRender = window.render;
    window.render = function (...args) {
      const result = originalRender.apply(this, args);
      synchronize();
      return result;
    };
  }

  synchronize();
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      synchronize();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
