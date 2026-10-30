/* global questQuestions, missionState, detailContent, detailShell, showScreen */
(() => {
  // 팀원 원본 화면의 문제와 보상 규칙을 유지하면서 문제 은행을 확장한다.
  const additions = [
    [
      '컴퓨터를 잠깐 쓰지 않을 때 좋은 설정은?',
      '절전 모드를 사용해요',
      '화면 밝기를 최대로 해요',
      '동영상을 계속 재생해요',
    ],
    [
      '휴대전화 충전이 끝났다면?',
      '충전기를 뽑아 정리해요',
      '다른 충전기도 꽂아요',
      '충전 화면을 계속 켜둬요',
    ],
    [
      '방을 나설 때 확인할 것은?',
      '불필요한 전등이 켜져 있는지 확인해요',
      '조명을 모두 켜요',
      'TV를 켜고 나가요',
    ],
    [
      '뜨거운 음식을 냉장고에 넣기 전에는?',
      '안전하게 식힌 뒤 보관해요',
      '냉장고 문을 열어 식혀요',
      '냉장고 온도를 계속 내려요',
    ],
    [
      '세탁기에 빨래를 너무 꽉 채우면?',
      '세탁 효율이 떨어질 수 있어요',
      '항상 더 잘 빨려요',
      '전기가 전혀 필요 없어요',
    ],
    [
      '건조기 사용을 줄일 수 있는 날에는?',
      '자연 건조를 활용해요',
      '마른 옷도 다시 건조해요',
      '건조기를 빈 채로 돌려요',
    ],
    [
      '여름 낮에 창으로 강한 햇빛이 들어오면?',
      '커튼이나 블라인드로 열 유입을 줄여요',
      '난방기를 켜요',
      '창문을 열고 냉방을 최대로 해요',
    ],
    [
      '에어컨 실외기 주변은 어떻게 관리할까요?',
      '통풍이 잘되도록 정리해요',
      '물건으로 꽉 막아요',
      '이불로 감싸요',
    ],
    [
      '선풍기를 아무도 없는 방에서 켜두면?',
      '불필요한 전기를 사용해요',
      '전기가 만들어져요',
      '다른 방까지 항상 시원해져요',
    ],
    [
      'TV 화면이 필요 이상으로 밝다면?',
      '보기 편한 밝기로 조절해요',
      '항상 최대로 유지해요',
      '조명도 전부 켜요',
    ],
    [
      '전기 주전자로 물을 끓일 때는?',
      '필요한 양만 끓여요',
      '매번 가득 채워요',
      '물을 계속 다시 끓여요',
    ],
    [
      '게임을 끝낸 게임기는?',
      '전원을 끄고 정리해요',
      '하루 종일 게임을 실행해 둬요',
      '주변 기기도 전부 켜요',
    ],
    [
      '추운 날 실내에서 에너지를 아끼는 방법은?',
      '따뜻한 실내복을 입어요',
      '반팔을 입고 난방을 최대로 해요',
      '창문을 열고 난방해요',
    ],
    [
      '난방기 앞을 큰 가구로 막으면?',
      '따뜻한 공기 순환을 방해할 수 있어요',
      '난방 효율이 항상 좋아져요',
      '전기를 만들 수 있어요',
    ],
    [
      '겨울철 틈새로 찬바람이 들어온다면?',
      '창문 틈새를 점검해요',
      '냉방기를 켜요',
      '창문을 더 크게 열어요',
    ],
    [
      '에너지 효율이 좋은 제품을 고를 때는?',
      '효율 등급과 소비전력을 함께 확인해요',
      '색깔만 보고 골라요',
      '포장 크기만 비교해요',
    ],
    [
      '멀티탭을 안전하게 쓰려면?',
      '허용 용량을 확인해 사용해요',
      '고전력 제품을 무제한 연결해요',
      '멀티탭을 계속 이어 붙여요',
    ],
    [
      '전기를 많이 쓰는 기기를 알아보려면?',
      '가전기기별 사용량을 확인해요',
      '제품 색을 비교해요',
      '전원선을 숨겨요',
    ],
    [
      '이번 달 절약 목표는 어떻게 정할까요?',
      '우리 집 사용량을 보고 실천 가능한 목표를 정해요',
      '사용량과 관계없이 정해요',
      '안전한 생활에 필요한 전기도 모두 끊어요',
    ],
    [
      '전력 사용 그래프가 갑자기 높아졌다면?',
      '그 시간에 사용한 가전기기를 확인해요',
      '무조건 고장이라고 단정해요',
      '확인하지 않고 모든 기기를 바꿔요',
    ],
    [
      '가족이 함께 절약하려면?',
      '실천할 일을 나누고 기록해요',
      '한 사람에게만 맡겨요',
      '사용량을 서로 숨겨요',
    ],
    [
      '양치하는 동안 수도꼭지는?',
      '필요할 때만 틀어요',
      '계속 틀어둬요',
      '뜨거운 물만 계속 틀어요',
    ],
    [
      '분리배출하기 전 용기 안은?',
      '내용물을 비우고 재질에 맞게 배출해요',
      '음식물을 그대로 넣어요',
      '모두 한 봉지에 섞어요',
    ],
    [
      '장보러 갈 때 쓰레기를 줄이는 방법은?',
      '장바구니를 챙겨요',
      '봉투를 매번 여러 장 받아요',
      '불필요한 포장을 더 해요',
    ],
    [
      '가까운 거리를 이동할 때 가능한 선택은?',
      '걷기나 자전거를 이용해요',
      '항상 혼자 자동차를 타요',
      '자동차 시동을 오래 켜둬요',
    ],
    [
      '물을 마실 때 일회용품을 줄이려면?',
      '개인 컵이나 물병을 사용해요',
      '매번 새 종이컵을 여러 개 써요',
      '쓰지 않은 컵도 버려요',
    ],
    [
      '아직 사용할 수 있는 물건이 필요 없어졌다면?',
      '나누거나 재사용할 방법을 찾아요',
      '바로 모두 버려요',
      '같은 물건을 더 사요',
    ],
    [
      '태양광 발전이 주로 활용하는 에너지는?',
      '햇빛이에요',
      '플라스틱 쓰레기예요',
      '수돗물의 색이에요',
    ],
    [
      '태양광 발전량은 날씨에 따라 어떻게 될까요?',
      '일사량에 따라 달라질 수 있어요',
      '언제나 완전히 같아요',
      '밤에만 발전해요',
    ],
    [
      '절약 실천을 오래 유지하는 방법은?',
      '작은 목표부터 꾸준히 기록하고 실천해요',
      '실패하면 영원히 포기해요',
      '매일 무리한 목표만 세워요',
    ],
  ];

  additions.forEach(([q, ...a], index) => {
    questQuestions[Math.floor(index / 3)].push({ q, a, c: 0 });
  });

  function shuffled(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  const style = document.createElement('style');
  style.textContent = `
    .simple-quiz-feedback { display: grid; gap: 12px; margin-top: 16px;
      padding: 20px; border-radius: 18px; background: #dcfce7;
      border: 1px solid #86efac; color: #14532d; }
    .simple-quiz-feedback strong { font-size: 22px; }
    .simple-quiz-feedback p { margin: 0; line-height: 1.6; }
    .simple-quiz-feedback.incorrect { background: #fff7ed; color: #7c2d12; border-color: #fdba74; }
    .simple-quiz-feedback .primary { width: 100%; min-height: 44px; }
    .daily-quiz-options { display: grid; gap: 10px; }
    .daily-quiz-options button { width: 100%; min-height: 48px; text-align: left; }
    .daily-quiz-options button:disabled { opacity: 1; cursor: default; }
    .quiz-fireworks { position:fixed; inset:0; overflow:hidden; pointer-events:none; z-index:100; }
    .quiz-confetti { position:absolute; width:8px; height:12px; border-radius:2px;
      animation:quiz-confetti-burst 1250ms ease-out both; }
    @keyframes quiz-confetti-burst {
      0% { transform:translate(0,0) rotate(0deg) scale(0); opacity:0; }
      15% { opacity:1; }
      55% { transform:translate(var(--burst-x),var(--burst-y)) rotate(var(--spin)) scale(1); opacity:1; }
      100% { transform:translate(var(--fall-x),var(--fall-y)) rotate(var(--spin)) scale(.4); opacity:0; }
    }
    @media(prefers-reduced-motion:reduce) { .quiz-fireworks { display:none; } }
  `;
  document.head.appendChild(style);

  let advanceTimer;
  let fireworksTimer;
  let fireworksLayer;
  function cancelAdvance() {
    clearTimeout(advanceTimer);
    clearTimeout(fireworksTimer);
    fireworksLayer?.remove();
  }

  function celebrateAnswer(target) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layer = document.createElement('div');
    layer.className = 'quiz-fireworks';
    layer.setAttribute('aria-hidden', 'true');
    const top = Math.max(
      80,
      Math.min(target.getBoundingClientRect().top + 30, innerHeight - 120),
    );
    const colors = ['#10b981', '#38bdf8', '#fbbf24', '#fb7185', '#a78bfa'];
    for (let side = 0; side < 2; side++) {
      for (let index = 0; index < 24; index++) {
        const particle = document.createElement('span');
        particle.className = 'quiz-confetti';
        const angle = (index / 24) * Math.PI * 2;
        const distance = 60 + Math.random() * 85;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance - 45;
        particle.style.left = `${innerWidth * (side ? 0.7 : 0.3)}px`;
        particle.style.top = `${top}px`;
        particle.style.backgroundColor = colors[index % colors.length];
        particle.style.setProperty('--burst-x', `${x}px`);
        particle.style.setProperty('--burst-y', `${y}px`);
        particle.style.setProperty('--fall-x', `${x * 1.2}px`);
        particle.style.setProperty('--fall-y', `${y + 120}px`);
        particle.style.setProperty('--spin', `${180 + Math.random() * 360}deg`);
        layer.appendChild(particle);
      }
    }
    fireworksLayer = layer;
    document.body.appendChild(layer);
    fireworksTimer = setTimeout(() => layer.remove(), 1300);
  }

  const originalShowScreen = window.showScreen;
  window.showScreen = function (id) {
    cancelAdvance();
    return originalShowScreen(id);
  };

  // 정답 영역에는 이미지와 이모지를 넣지 않는다.
  function showFeedback(target, correct, answer, label, onNext) {
    cancelAdvance();
    target.replaceChildren();
    target.className = `simple-quiz-feedback${correct ? '' : ' incorrect'}`;
    target.setAttribute('role', 'status');
    const title = document.createElement('strong');
    title.textContent = correct
      ? '정답입니다'
      : '아쉬워요. 정답을 확인해 주세요';
    const explanation = document.createElement('p');
    explanation.textContent = `정답: ${answer}`;
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'primary';
    next.textContent = label;
    let advanced = false;
    function advance() {
      cancelAdvance();
      if (advanced || !target.isConnected || !target.closest('.screen.active'))
        return;
      advanced = true;
      next.disabled = true;
      onNext();
    }
    next.addEventListener('click', advance, { once: true });
    target.append(title, explanation, next);
    if (correct) {
      celebrateAnswer(target);
      const notice = document.createElement('small');
      notice.textContent = '잠시 후 자동으로 넘어갑니다.';
      target.appendChild(notice);
      advanceTimer = setTimeout(advance, 1500);
    }
  }

  let deck = [];
  let position = 0;
  let score = 0;
  let answered = false;
  let order = [];

  function renderDailyQuiz() {
    const question = deck[position];
    answered = false;
    order = shuffled([0, 1, 2]);
    detailContent.innerHTML = detailShell(
      '오늘의 에너지 퀴즈',
      `총 ${deck.length}문제 · 전기 절약과 환경을 배워요`,
      `<article class="card"><div class="eyebrow">${position + 1} / ${deck.length}문제 · 정답 ${score}개</div><h2 class="quiz-question-title"></h2><div class="daily-quiz-options"></div><div id="quizResult" aria-live="polite"></div></article>`,
    );
    detailContent.querySelector('h2.quiz-question-title').textContent =
      question.q;
    const options = detailContent.querySelector('.daily-quiz-options');
    order.forEach((original, choice) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-choice';
      button.textContent = `${['①', '②', '③'][choice]} ${question.a[original]}`;
      button.addEventListener('click', () => window.answerQuiz(choice));
      options.appendChild(button);
    });
    showScreen('detail');
  }

  const originalOpenDetail = window.openDetail;
  window.openDetail = function (key) {
    cancelAdvance();
    if (key !== 'quiz') return originalOpenDetail(key);
    deck = shuffled(questQuestions.flat());
    position = 0;
    score = 0;
    renderDailyQuiz();
  };

  window.answerQuiz = function (choice) {
    const result = document.getElementById('quizResult');
    if (
      !result ||
      answered ||
      !Number.isInteger(choice) ||
      !order.includes(choice)
    )
      return;
    answered = true;
    const question = deck[position];
    const correct = order[choice] === question.c;
    if (correct) score++;
    detailContent
      .querySelectorAll('.daily-quiz-options button')
      .forEach((button, index) => {
        button.disabled = true;
        if (order[index] === question.c) button.classList.add('correct');
        else if (index === choice) button.classList.add('wrong');
      });
    const last = position === deck.length - 1;
    showFeedback(
      result,
      correct,
      question.a[question.c],
      last ? '전체 결과 보기' : '다음 문제',
      () => {
        if (!last) {
          position++;
          renderDailyQuiz();
          return;
        }
        detailContent.innerHTML = detailShell(
          '퀴즈 완료',
          '모든 문제를 풀었어요',
          `<article class="card"><h2>${deck.length}문제 중 ${score}문제 정답</h2><button type="button" class="primary">새 순서로 다시 풀기</button></article>`,
        );
        detailContent.querySelector('.primary').addEventListener(
          'click',
          () => {
            deck = shuffled(questQuestions.flat());
            position = 0;
            score = 0;
            renderDailyQuiz();
          },
          { once: true },
        );
      },
    );
  };

  const originalSelectStage = window.selectStage;
  window.selectStage = function (stage) {
    cancelAdvance();
    if (
      stage >= 1 &&
      stage <= missionState.unlocked &&
      questQuestions[stage - 1]
    ) {
      const pool = questQuestions[stage - 1];
      pool.splice(0, pool.length, ...shuffled(pool));
    }
    return originalSelectStage(stage);
  };

  window.chooseAnswer = function (choice) {
    const feedback = document.getElementById('answerFeedback');
    if (
      !feedback ||
      feedback.dataset.answered ||
      !Number.isInteger(choice) ||
      choice < 0 ||
      choice > 2
    )
      return;
    feedback.dataset.answered = 'true';
    const question =
      questQuestions[missionState.stage - 1][missionState.question];
    const correct = missionState.answerOrder[choice] === question.c;
    if (correct) missionState.correct++;
    detailContent.querySelectorAll('.quiz-choice').forEach((button, index) => {
      button.disabled = true;
      if (missionState.answerOrder[index] === question.c)
        button.classList.add('correct');
      else if (index === choice) button.classList.add('wrong');
    });
    showFeedback(
      feedback,
      correct,
      question.a[question.c],
      missionState.question < 2 ? '다음 문제' : '결과 확인하기',
      () => window.continueQuiz(),
    );
    const note = detailContent.querySelector('.detail-note');
    if (note) note.textContent = '정답을 확인하고 다음 문제에 도전해 보세요.';
  };
})();
