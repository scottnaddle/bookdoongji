'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// 샘플 책 페이지 (오리지널 수험서 콘텐츠)
const PAGES = [
  {
    title: '제1장 행정법 총론 - 1절 행정의 개념',
    body: `행정은 국가 작용 중 입법·사법 작용을 제외한 모든 국가 작용을 말한다.

협의의 행정: 행정기관이 행하는 작용
광의의 행정: 실질적 의미의 행정 작용 전체

행정법의 법원(法源):
1. 헌법 - 행정법의 최고 법원
2. 법률 - 국회가 제정한 형식적 의미의 법률
3. 명령 - 행정기관이 제정한 하위 법규
4. 자치법규 - 조례와 규칙
5. 조약 - 국제법

[예제] 다음 중 행정법의 일반원칙이 아닌 것은?
① 법치주의 ② 평등원칙 ③ 비례원칙 ④ 무과실책임`,
  },
  {
    title: '제1장 행정법 총론 - 2절 행정법의 원칙',
    body: `행정법의 일반원칙

1. 법치주의
   - 법률의 지배: 모든 행정은 법에 근거해야 한다
   - 법률유보: 기본권 제한은 법률에 근거해야 한다
   - 법률우위: 하위 법규는 상위 법규에 위반될 수 없다

2. 평등원칙
   - 같은 것은 같게, 다른 것은 다르게
   - 합리적 이유 없는 차별 금지

3. 비례원칙 (과잉금지)
   - 목적의 정당성
   - 수단의 적합성
   - 피해의 최소성
   - 법익의 균형성

4. 신뢰보호원칙
   - 행정청의 공적 견해 표명에 대한 신뢰 보호
   - 요건: 공적 견해 표명, 귀책사유 없음, 신뢰에 상응하는 행위`,
  },
  {
    title: '제2장 행정조직법 - 1절 국가행정조직',
    body: `국가행정조직의 구조

중앙행정기관:
- 부: 기획재정부, 교육부, 법무부 등 (장관급)
- 처: 인사혁신처, 법제처 등 (차관급 또는 장관급)
- 청: 국세청, 관세청, 검찰청 등 (차관급)

합의제 행정기관:
- 국무회의: 대통령, 국무총리, 장관으로 구성
- 감사원, 선거관리위원회 등 헌법기관

지방자치단체:
- 광역자치단체: 특별시, 광역시, 도
- 기초자치단체: 시, 군, 구

[참고] 2026년 기준 중앙행정기관 수는 법률 개정에 따라
변동될 수 있으므로 최신 법령을 확인할 것.`,
  },
];

type Tool = 'pen' | 'highlighter' | 'eraser';
const COLORS = ['#1a1a1a', '#e53e3e', '#2563eb', '#16a34a'];
const HIGHLIGHT_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca'];

interface User {
  email: string;
  name: string;
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem('bookdoongji_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function annotationKey(userEmail: string, bookId: string, page: number) {
  return `bookdoongji_annotations:${userEmail}:${bookId}:${page}`;
}

export default function ReaderClient({ bookId }: { bookId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');

  const [page, setPage] = useState(0);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState<string>(COLORS[0] ?? '#1a1a1a');
  const [highlightColor, setHighlightColor] = useState<string>(HIGHLIGHT_COLORS[0] ?? '#fef08a');
  const [isDrawing, setIsDrawing] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(true);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'login-needed'>('saved');

  const pageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUser(loadUser());
  }, []);

  const doLogin = () => {
    if (!loginEmail.trim()) return;
    const u: User = {
      email: loginEmail.trim().toLowerCase(),
      name: loginName.trim() || loginEmail.split('@')[0] || '사용자',
    };
    localStorage.setItem('bookdoongji_user', JSON.stringify(u));
    setUser(u);
    setShowLogin(false);
    setSaveState('saved');
  };

  const doLogout = () => {
    if (confirm('로그아웃할까요? 이 기기의 필기는 유지됩니다.')) {
      localStorage.removeItem('bookdoongji_user');
      setUser(null);
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (ctx && canvas) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    }
  };

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const pageEl = pageRef.current;
    if (!canvas || !pageEl) return;
    const rect = pageEl.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, rect.width * dpr);
    canvas.height = Math.max(1, rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;
    const u = loadUser();
    if (u) {
      const saved = localStorage.getItem(annotationKey(u.email, bookId, page));
      if (saved) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
        img.src = saved;
      }
    }
  }, [page, bookId]);

  const saveAnnotation = useCallback(() => {
    const u = loadUser();
    const canvas = canvasRef.current;
    if (!u || !canvas || canvas.width <= 1) return;
    try {
      localStorage.setItem(annotationKey(u.email, bookId, page), canvas.toDataURL());
      setSaveState('saved');
    } catch {
      /* ignore */
    }
  }, [page, bookId]);

  const scheduleSave = useCallback(() => {
    const u = loadUser();
    if (!u) {
      setSaveState('login-needed');
      return;
    }
    setSaveState('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(saveAnnotation, 800);
  }, [saveAnnotation]);

  useEffect(() => {
    const t = setTimeout(setupCanvas, 60);
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        saveAnnotation();
        setupCanvas();
      }, 200);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      clearTimeout(t);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [page, setupCanvas, saveAnnotation, user]);

  const getPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const paint = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    if (tool === 'highlighter') {
      ctx.strokeStyle = highlightColor;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 20;
    } else if (tool === 'eraser') {
      ctx.globalAlpha = 1;
      ctx.lineWidth = 28;
    } else {
      ctx.strokeStyle = color;
      ctx.globalAlpha = 1;
      ctx.lineWidth = 3;
    }
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };

  const startDraw = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const pos = getPos(e);
    lastPos.current = pos;
    setIsDrawing(true);
    paint(pos, { x: pos.x + 0.1, y: pos.y + 0.1 });
  };

  const moveDraw = (e: React.PointerEvent) => {
    if (!isDrawing || !lastPos.current) return;
    e.preventDefault();
    const pos = getPos(e);
    paint(lastPos.current, pos);
    lastPos.current = pos;
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPos.current = null;
    scheduleSave();
  };

  const goPage = (next: number) => {
    if (next < 0 || next >= PAGES.length) return;
    saveAnnotation();
    setPage(next);
    document.getElementById('reader-scroll')?.scrollTo({ top: 0 });
  };

  const clearPage = () => {
    if (!confirm('이 페이지의 필기를 모두 지울까요?')) return;
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const u = loadUser();
    if (ctx && canvas) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    if (u) localStorage.removeItem(annotationKey(u.email, bookId, page));
  };

  const p = PAGES[page] ?? { title: '', body: '' };
  const activeColors = tool === 'highlighter' ? HIGHLIGHT_COLORS : COLORS;
  const activeColor = (tool === 'highlighter' ? highlightColor : color) ?? '#1a1a1a';
  const setActiveColor = tool === 'highlighter' ? setHighlightColor : setColor;

  return (
    <div className="flex bg-gray-100" style={{ height: '100dvh', overscrollBehavior: 'none' }}>
      {/* 왼쪽 사이드 도구모음 */}
      <aside
        className={`z-30 flex shrink-0 flex-col items-center gap-1 border-r border-gray-200 bg-white py-2 transition-all ${
          toolbarOpen ? 'w-[68px] px-1.5' : 'w-[44px] px-1'
        } pb-[env(safe-area-inset-bottom)]`}
      >
        <button
          onClick={() => setToolbarOpen((v) => !v)}
          aria-label={toolbarOpen ? '도구 닫기' : '도구 열기'}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg active:bg-gray-200"
        >
          {toolbarOpen ? '◀' : '▶'}
        </button>

        {toolbarOpen && (
          <>
            <div className="my-1 h-px w-8 bg-gray-200" />
            {(['pen', 'highlighter', 'eraser'] as Tool[]).map((t) => (
              <button
                key={t}
                onClick={() => setTool(t)}
                aria-label={t === 'pen' ? '펜' : t === 'highlighter' ? '형광펜' : '지우개'}
                className={`flex h-12 w-12 flex-col items-center justify-center rounded-xl text-xl ${
                  tool === t ? 'bg-blue-600 text-white shadow' : 'bg-gray-50 text-gray-600'
                }`}
              >
                {t === 'pen' ? '✏️' : t === 'highlighter' ? '🖍️' : '🧽'}
                <span className="mt-0.5 text-[9px] font-medium">
                  {t === 'pen' ? '펜' : t === 'highlighter' ? '형광' : '지움'}
                </span>
              </button>
            ))}

            <div className="my-1 h-px w-8 bg-gray-200" />

            <div className="flex flex-col items-center gap-1.5">
              {activeColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveColor(c)}
                  aria-label="색상"
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    activeColor === c ? 'border-blue-600 scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="my-1 h-px w-8 bg-gray-200" />

            <button
              onClick={clearPage}
              aria-label="전체 지우기"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-lg"
            >
              🗑️
            </button>
          </>
        )}
      </aside>

      {/* 메인 영역 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="z-20 flex shrink-0 items-center justify-between bg-white px-3 py-2.5 shadow-sm">
          <Link href="/" className="rounded-lg px-2 py-1.5 text-sm text-gray-600 active:bg-gray-100">
            ‹ 서재
          </Link>
          <div className="min-w-0 flex-1 px-2 text-center">
            <div className="truncate text-sm font-semibold">둥지 행정법총론 핵심 압축노트</div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[11px] text-gray-400">{p.title}</span>
              {saveState === 'saving' && <span className="text-[10px] text-blue-500">저장 중…</span>}
              {saveState === 'saved' && user && (
                <span className="text-[10px] text-green-600">✓ 저장됨</span>
              )}
              {saveState === 'login-needed' && (
                <button
                  onClick={() => setShowLogin(true)}
                  className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700"
                >
                  로그인하면 필기 저장
                </button>
              )}
            </div>
          </div>
          {user ? (
            <button
              onClick={doLogout}
              className="max-w-[80px] truncate rounded-lg bg-gray-100 px-2 py-1.5 text-xs text-gray-600"
              title={`${user.email} (로그아웃)`}
            >
              {user.name}
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
            >
              로그인
            </button>
          )}
        </header>

        <div id="reader-scroll" className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-3 pb-6">
            <div
              ref={pageRef}
              className="relative mx-auto w-full max-w-2xl select-none bg-white px-5 py-6 shadow-md sm:px-8 sm:py-8"
              style={{ minHeight: '60dvh', touchAction: 'none' }}
            >
              <h2 className="mb-4 text-base font-bold sm:text-lg">{p.title}</h2>
              <p className="whitespace-pre-line text-[15px] leading-8 text-gray-800">{p.body}</p>
              <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full"
                style={{ touchAction: 'none' }}
                onPointerDown={startDraw}
                onPointerMove={moveDraw}
                onPointerUp={endDraw}
                onPointerCancel={endDraw}
                onPointerLeave={endDraw}
              />
            </div>
          </div>
        </div>

        <footer className="z-20 flex shrink-0 items-center justify-between border-t border-gray-200 bg-white px-4 py-2 pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={() => goPage(page - 1)}
            disabled={page === 0}
            className="min-h-[40px] rounded-full bg-gray-100 px-5 text-sm font-medium disabled:opacity-30"
          >
            ◀ 이전
          </button>
          <div className="flex gap-1.5">
            {PAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => goPage(i)}
                aria-label={`${i + 1}페이지`}
                className={`h-2 rounded-full transition-all ${i === page ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300'}`}
              />
            ))}
          </div>
          <button
            onClick={() => goPage(page + 1)}
            disabled={page === PAGES.length - 1}
            className="min-h-[40px] rounded-full bg-gray-100 px-5 text-sm font-medium disabled:opacity-30"
          >
            다음 ▶
          </button>
        </footer>
      </div>

      {/* 로그인 모달 */}
      {showLogin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 text-lg font-bold">로그인</h3>
            <p className="mb-4 text-sm text-gray-500">
              로그인하면 필기가 사용자별로 저장되어
              <br />
              다시 들어와도 그대로 유지됩니다.
            </p>
            <label className="mb-1 block text-xs font-medium text-gray-600">이메일</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="you@example.com"
              className="mb-3 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
            <label className="mb-1 block text-xs font-medium text-gray-600">이름 (선택)</label>
            <input
              type="text"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              placeholder="홍길동"
              className="mb-4 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
            <button
              onClick={doLogin}
              disabled={!loginEmail.trim()}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              로그인
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className="mt-2 w-full rounded-xl py-2 text-sm text-gray-500"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
