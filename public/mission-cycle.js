/* global missions, state, selected: writable, doneKey, toast */

(() => {
  const STORE_KEY = window.polarMissionStoreKey || 'polarHomeV2';
  const ROW_COUNT = 5;
  const MISSIONS_PER_ROW = 3;
  const COOLDOWN_MS = 5 * 60 * 1000;

  const pool = missions.map((mission) => ({
    ...mission,
    type: 'daily',
    cat:
      mission.cat === '에너지 절약' || mission.cat === '퀴즈'
        ? '전기 절약'
        : '환경 절약',
  }));

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }

  function validRound(round, size = MISSIONS_PER_ROW) {
    return (
      round &&
      typeof round.id === 'string' &&
      /^[a-zA-Z0-9-]{1,64}$/.test(round.id) &&
      Array.isArray(round.queue) &&
      round.queue.length === size &&
      new Set(round.queue).size === size &&
      round.queue.every((id) => pool.some((item) => item.id === id)) &&
      Number.isFinite(round.availableAt) &&
      round.availableAt >= 0
    );
  }

  function missionAt(round, index) {
    return {
      ...pool.find((item) => item.id === round.queue[index]),
      id: `round-${round.id}-${index}`,
    };
  }

  const originalCycleKey = window.cycleKey;
  window.cycleKey = function (mission) {
    return mission.id.startsWith('round-') ? 'once' : originalCycleKey(mission);
  };

  function completedCount(round) {
    return round.queue.filter((_, index) =>
      Boolean(state.done[doneKey(missionAt(round, index))]),
    ).length;
  }

  function currentTemplate(round) {
    return round.queue[Math.min(completedCount(round), MISSIONS_PER_ROW - 1)];
  }

  function createRound(excluded = []) {
    const first = shuffle(
      pool.filter((item) => !excluded.includes(item.id)),
    )[0];
    const second = shuffle(pool.filter((item) => item.cat !== first.cat))[0];
    const third = shuffle(
      pool.filter((item) => item.id !== first.id && item.id !== second.id),
    )[0];
    return {
      id: crypto.randomUUID(),
      queue: [first.id, second.id, third.id],
      availableAt: 0,
    };
  }

  function prepareRows() {
    let changed = false;
    if (
      !Array.isArray(state.randomMissionRows) ||
      state.randomMissionRows.length !== ROW_COUNT ||
      !state.randomMissionRows.every((round) => validRound(round))
    ) {
      const retained = Array.isArray(state.randomMissionRows)
        ? state.randomMissionRows
            .filter((round) => validRound(round))
            .slice(0, ROW_COUNT)
        : [];
      const previous = state.randomMissionCycle;
      if (
        retained.length === 0 &&
        (validRound(previous, 3) || validRound(previous, 5))
      ) {
        retained.push({
          id: previous.id,
          queue: previous.queue.slice(0, MISSIONS_PER_ROW),
          availableAt: previous.availableAt,
        });
      }
      while (retained.length < ROW_COUNT) {
        retained.push(createRound(retained.map(currentTemplate)));
      }
      state.randomMissionRows = retained;
      changed = true;
    }

    const rows = state.randomMissionRows;
    for (let index = 0; index < rows.length; index++) {
      const round = rows[index];
      if (completedCount(round) < MISSIONS_PER_ROW) {
        if (round.availableAt !== 0) {
          round.availableAt = 0;
          changed = true;
        }
        continue;
      }
      if (!round.availableAt) {
        round.availableAt = Date.now() + COOLDOWN_MS;
        changed = true;
      }
      if (Date.now() >= round.availableAt) {
        rows[index] = createRound(
          rows.filter((_, other) => other !== index).map(currentTemplate),
        );
        changed = true;
      }
    }

    missions.splice(
      0,
      missions.length,
      ...rows.map((round) =>
        missionAt(round, Math.min(completedCount(round), MISSIONS_PER_ROW - 1)),
      ),
    );
    return changed;
  }

  function persist() {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    window.parent.dispatchEvent(
      new CustomEvent('polar-bear-state-change', {
        detail: { key: STORE_KEY },
      }),
    );
  }

  function synchronize() {
    if (prepareRows()) persist();
  }

  function updateTimers() {
    state.randomMissionRows.forEach((round, index) => {
      const timer = document.getElementById(`missionCooldown-${index}`);
      if (!timer || completedCount(round) < MISSIONS_PER_ROW) return;
      const seconds = Math.max(
        0,
        Math.ceil((round.availableAt - Date.now()) / 1000),
      );
      timer.textContent =
        `${String(Math.floor(seconds / 60)).padStart(2, '0')}:` +
        String(seconds % 60).padStart(2, '0');
    });
  }

  window.renderMissions = function () {
    synchronize();
    const rows = state.randomMissionRows;
    const total = rows.reduce((sum, round) => sum + completedCount(round), 0);
    const waiting = rows.filter(
      (round) => completedCount(round) === MISSIONS_PER_ROW,
    ).length;
    document.getElementById('progressCount').textContent =
      `${total}/${ROW_COUNT * MISSIONS_PER_ROW}`;
    document.getElementById('progressText').textContent =
      `각 줄마다 3개 도전 · 대기 중 ${waiting}/${ROW_COUNT}줄`;
    document.getElementById('progressBar').style.width =
      `${(total / (ROW_COUNT * MISSIONS_PER_ROW)) * 100}%`;
    const list = document.getElementById('missionList');
    list.replaceChildren();

    rows.forEach((round, index) => {
      const count = completedCount(round);
      const coolingDown = count === MISSIONS_PER_ROW;
      const mission = missionAt(round, Math.min(count, MISSIONS_PER_ROW - 1));
      const row = document.createElement(coolingDown ? 'div' : 'button');
      row.className = 'mission';
      row.style.cssText =
        'width:100%;text-align:left;color:inherit;font:inherit;min-height:88px';
      if (!coolingDown) {
        row.type = 'button';
        row.onclick = () => window.openMission(mission.id);
      } else {
        row.style.cursor = 'default';
      }
      const icon = document.createElement('span');
      icon.className = 'micon';
      icon.textContent = coolingDown ? '⏳' : mission.icon;
      icon.setAttribute('aria-hidden', 'true');
      const copy = document.createElement('span');
      const order = document.createElement('span');
      order.className = 'type';
      order.style.margin = '0 0 5px';
      order.textContent = `미션 ${index + 1} · ${count}/${MISSIONS_PER_ROW}`;
      const title = document.createElement('span');
      title.className = 'mname';
      title.style.display = 'block';
      title.textContent = coolingDown
        ? '이 줄의 미션 3개를 완료했어요!'
        : mission.title;
      const description = document.createElement('span');
      description.className = 'mdesc';
      description.style.display = 'block';
      description.textContent = coolingDown
        ? '다른 줄은 계속 도전할 수 있어요.'
        : `${mission.cat} · 먹이 ${mission.food}개 + ${mission.points}P`;
      copy.append(order, title, description);
      row.append(icon, copy);
      if (coolingDown) {
        const timer = document.createElement('strong');
        timer.id = `missionCooldown-${index}`;
        timer.setAttribute('role', 'timer');
        timer.setAttribute('aria-live', 'off');
        timer.setAttribute(
          'aria-label',
          `미션 ${index + 1} 새 미션까지 남은 시간`,
        );
        timer.style.cssText =
          'margin-left:auto;font-size:20px;color:#087bd1;white-space:nowrap';
        row.appendChild(timer);
      }
      list.appendChild(row);
    });
    updateTimers();
  };

  window.save = function () {
    prepareRows();
    persist();
    window.render();
  };

  function findRow(id) {
    return state.randomMissionRows.find(
      (round) =>
        missionAt(round, Math.min(completedCount(round), MISSIONS_PER_ROW - 1))
          .id === id,
    );
  }

  const originalOpen = window.openMission;
  window.openMission = function (id) {
    synchronize();
    const round = findRow(id);
    if (!round) {
      window.render();
      toast('새로 표시된 미션을 선택해 주세요.');
      return;
    }
    if (completedCount(round) === MISSIONS_PER_ROW) {
      toast('이 줄은 준비 중이에요. 다른 줄의 미션에 도전해 보세요!');
      return;
    }
    originalOpen(id);
  };

  const originalComplete = window.completeMission;
  window.completeMission = function (...args) {
    synchronize();
    const round = selected ? findRow(selected.id) : null;
    if (!round || completedCount(round) === MISSIONS_PER_ROW) {
      toast('현재 표시된 미션을 선택해 주세요.');
      return;
    }
    const before = completedCount(round);
    const result = originalComplete.apply(this, args);
    if (completedCount(round) > before) selected = null;
    return result;
  };

  document
    .querySelectorAll('.filterlabel, #typeFilters, #categoryFilters')
    .forEach((element) => {
      element.style.display = 'none';
    });

  function tick() {
    if (prepareRows()) {
      persist();
      window.render();
      toast('준비가 끝난 줄에 새로운 미션이 도착했어요!');
    } else {
      updateTimers();
    }
  }

  window.save();
  setInterval(tick, 1000);
  window.addEventListener('pageshow', tick);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tick();
  });
})();
