'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  electricitySavings,
  estimatedElectricityBill,
  formatBillAmount,
} from '@/lib/demo-electricity';

const faqs = [
  {
    question: '절약 목표는 어떻게 설정해?',
    keywords: ['목표', '사용량', '성공', '표정'],
    answer:
      '‘나의 전기 절약 목표’에서 월 최대 사용량을 입력하고 ‘목표 설정’을 누르세요. 데모 사용량이 목표 이하면 기쁜 표정, 초과하면 슬픈 표정이 나옵니다. 새로고침하면 초기화돼요.',
  },
  {
    question: '미션은 어떻게 참여해?',
    keywords: ['미션', '참여', '퀴즈', '사진'],
    answer:
      '하단 ‘미션’ 메뉴에서 미션을 선택하고 안내에 따라 완료해 보세요. 사진 미션은 사진 선택, 퀴즈는 정답 선택이 필요해요. 현재는 실제 행동을 검증하지 않는 데모입니다.',
  },
  {
    question: '북극곰에게 먹이는 어떻게 줘?',
    keywords: ['먹이', '북극곰', '성장', '경험치', '포인트'],
    answer:
      '미션을 완료하면 먹이와 포인트를 받아요. 미션 화면의 ‘북극곰에게 먹이 주기’를 누르면 먹이 1개를 사용하고 경험치 30을 얻습니다. 진행 상황은 현재 브라우저에 저장돼요.',
  },
  {
    question: '전기요금은 실제 금액이야?',
    keywords: ['요금', '금액', '탄소', '실제', '데모'],
    answer: `공통으로 표시하는 이번 달 예상 전기요금은 ${formatBillAmount(estimatedElectricityBill)}원, 지난달 대비 절약액은 ${formatBillAmount(electricitySavings)}원입니다. 화면을 위한 예시이며 실제 청구 금액과 연결되어 있지 않아요. 태양광 차트의 조건별 시뮬레이션 값은 별도로 계산됩니다.`,
  },
  {
    question: '태양광 발전용량은 어디서 봐?',
    keywords: ['태양광', '발전', '용량', '패널'],
    answer:
      '하단 ‘태양광’ 메뉴에서 발전량·전력 사용량·배터리·예상 절감액을 확인할 수 있어요. 발전원을 선택하거나 ‘설정’에서 조건을 바꿔 보세요. 값은 시뮬레이션 예시이며 실제 계량기나 청구 금액과 연결되어 있지 않습니다.',
  },
  {
    question: '로그인과 회원가입은 어디서 해?',
    keywords: ['로그인', '회원가입', '계정', '마이페이지'],
    answer:
      '로그인 전에는 하단 ‘마이페이지’를 누르면 로그인 화면이 열립니다. 회원가입한 브라우저에서 같은 이메일·비밀번호로 데모 로그인할 수 있어요. 실제 서비스 계정은 아니며 다른 기기와 공유되지 않습니다.',
  },
];

type Message = {
  role: 'user' | 'assistant';
  text: string;
};

export default function FaqChatbot() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: '안녕하세요! 절약 목표, 미션, 먹이, 태양광 메뉴가 궁금하면 질문해 주세요.',
    },
  ]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages]);

  function ask(value: string) {
    const text = value.trim();
    if (!text || text.length > 300) return;

    const matched = faqs.find((faq) =>
      faq.keywords.some((keyword) => text.includes(keyword)),
    );

    const answer =
      matched?.answer ??
      '아직 이 질문에 대한 안내는 준비되어 있지 않아요. 아래 추천 질문을 선택하거나 절약 목표·미션·먹이·전기요금·태양광·로그인 중 궁금한 주제를 적어 주세요.';

    setMessages((previous) =>
      [
        ...previous,
        { role: 'user' as const, text },
        { role: 'assistant' as const, text: answer },
      ].slice(-20),
    );
    setQuestion('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(question);
  }

  return (
    <details className="group fixed right-4 bottom-[calc(88px+env(safe-area-inset-bottom))] z-30 w-14">
      <summary className="flex size-14 cursor-pointer list-none items-center justify-center rounded-full bg-emerald-700 text-2xl text-white shadow-xl hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800 [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="group-open:hidden">
          💬
        </span>
        <span aria-hidden="true" className="hidden group-open:inline">
          ×
        </span>
        <span className="sr-only">FAQ 챗봇 열기 또는 닫기</span>
      </summary>
      <section
        aria-labelledby="faq-chat-title"
        className="absolute right-0 bottom-20 max-h-[calc(100dvh-200px)] w-[min(360px,calc(100vw-32px))] overflow-y-auto rounded-3xl border border-sky-100 bg-white p-5 text-[#17365e] shadow-2xl"
      >
        <h2 id="faq-chat-title" className="text-lg font-extrabold">
          💬 폴라 도우미
        </h2>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          정해진 안내에 답하는 FAQ 챗봇입니다. 대화는 저장되지 않으며
          새로고침하면 초기화돼요.
        </p>

        <div
          ref={logRef}
          role="log"
          aria-label="질문과 답변"
          aria-live="polite"
          tabIndex={0}
          className="mt-4 max-h-72 space-y-3 overflow-y-auto rounded-2xl bg-sky-50 p-3 focus-visible:outline-2"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-[95%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap break-words ${
                message.role === 'user'
                  ? 'ml-auto bg-emerald-700 text-white'
                  : 'mr-auto bg-white text-[#17365e]'
              }`}
            >
              <span className="sr-only">
                {message.role === 'user' ? '내 질문: ' : '폴라 도우미: '}
              </span>
              {message.text}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {faqs.map((faq) => (
            <button
              key={faq.question}
              type="button"
              onClick={() => ask(faq.question)}
              className="min-h-11 rounded-xl border border-sky-200 px-3 py-2 text-left text-xs font-bold text-[#17365e] hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {faq.question}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <label htmlFor="faq-question" className="text-sm font-bold">
            궁금한 내용을 입력하세요
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              id="faq-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={300}
              required
              placeholder="예: 미션은 어떻게 참여해?"
              className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm focus-visible:outline-2 focus-visible:outline-emerald-700"
            />
            <button
              type="submit"
              disabled={!question.trim()}
              className="min-h-12 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              질문하기
            </button>
          </div>
        </form>
      </section>
    </details>
  );
}
