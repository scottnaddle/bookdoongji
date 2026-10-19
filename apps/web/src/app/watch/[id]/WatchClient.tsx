'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

// 샘플 강의 챕터 (영상 구간 + 교재 페이지 매핑)
const CHAPTERS = [
  { title: '1강. 행정의 개념', page: 0, startSec: 0 },
  { title: '2강. 행정법의 원칙', page: 1, startSec: 60 },
  { title: '3강. 국가행정조직', page: 2, startSec: 120 },
];

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
5. 조약 - 국제법`,
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
   - 목적의 정당성 / 수단의 적합성
   - 피해의 최소성 / 법익의 균형성`,
  },
  {
    title: '제2장 행정조직법 - 1절 국가행정조직',
    body: `국가행정조직의 구조

중앙행정기관:
- 부: 기획재정부, 교육부, 법무부 등 (장관급)
- 처: 인사혁신처, 법제처 등
- 청: 국세청, 관세청, 검찰청 등 (차관급)

합의제 행정기관:
- 국무회의: 대통령, 국무총리, 장관으로 구성
- 감사원, 선거관리위원회 등 헌법기관`,
  },
];

interface Stroke {
  tool: string;
  color: string;
  points: { x: number; y: number }[];
  videoTime: number;  // 영상의 몇 초 시점에 필기했는지
}

// 샘플 YouTube 영상 ID (실제 강의 영상으로 교체 가능)
const SAMPLE_VIDEO_ID = 'dQw4w9WgXcQ';

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function WatchClient({ bookId }: { bookId: string }) {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#1a1a1a');
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [strokes, setStrokes] = useState<Record<number, Stroke[]>>({ 0: [], 1: [], 2: [] });
  const [videoTime, setVideoTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [videoId] = useState(SAMPLE_VIDEO_ID);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const currentStroke = useRef<Stroke | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const userKey = user ? `${user.email}` : 'guest';
  const storageKey = `bookdoongji_watch:${userKey}:${bookId}`;

  // 저장된 필기 불러오기
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setStrokes(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [storageKey]);

  // 필기 저장
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(strokes));
    } catch { /* ignore */ }
  }, [strokes, storageKey]);

  // YouTube IFrame API 로드
  useEffect(() => {
    if ((window as any).YT?.Player) {
      initPlayer();
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    (window as any).onYouTubeIframeAPIReady = initPlayer;
    document.body.appendChild(tag);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const initPlayer = () => {
    if (playerRef.current || !(window as any).YT?.Player) return;
    playerRef.current = new (window as any).YT.Player('watch-player', {
      videoId,
      playerVars: { rel: 0, modestbranding: 1 },
      events: {
        onStateChange: (e: any) => {
          setPlaying(e.data === 1); // 1 = playing
        },
      },
    });
    // 1초마다 현재 시점 업데이트
    timerRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        setVideoTime(playerRef.current.getCurrentTime());
      }
    }, 1000);
  };

  const seekTo = useCallback((sec: number) => {
    playerRef.current?.seekTo(sec, true);
    setVideoTime(sec);
  }, []);

  const togglePlay = () => {
    if (playing) playerRef.current?.pauseVideo();
    else playerRef.current?.playVideo();
  };

  const jumpChapter = (ch: number) => {
    const c = CHAPTERS[ch];
    setPage(c.page);
    seekTo(c.startSec);
  };

  // 캔버스
  const fitCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const r = wrap.getBoundingClientRect();
    canvas.width = r.width * devicePixelRatio;
    canvas.height = r.height * devicePixelRatio;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(devicePixelRatio, devicePixelRatio);
    redraw();
  }, [page, strokes]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const r = wrap.getBoundingClientRect();
    ctx.clearRect(0, 0, r.width, r.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const draw = (s: Stroke) => {
      if (s.points.length < 2) return;
      ctx.globalAlpha = s.tool === 'highlighter' ? 0.35 : 1;
      ctx.strokeStyle = s.tool === 'eraser' ? '#ffffff' : s.color;
      ctx.lineWidth = s.tool === 'highlighter' ? 14 : s.tool === 'eraser' ? 20 : 2.5;
      ctx.beginPath();
      ctx.moveTo(s.points[0].x * r.width, s.points[0].y * r.height);
      s.points.forEach(p => ctx.lineTo(p.x * r.width, p.y * r.height));
      ctx.stroke();
      ctx.globalAlpha = 1;
    };
    (strokes[page] || []).forEach(draw);
    if (currentStroke.current) draw(currentStroke.current);
  }, [page, strokes]);

  useEffect(() => {
    fitCanvas();
    window.addEventListener('resize', fitCanvas);
    return () => window.removeEventListener('resize', fitCanvas);
  }, [fitCanvas]);

  const getPos = (e: React.PointerEvent) => {
    const wrap = wrapRef.current;
    if (!wrap) return { x: 0, y: 0 };
    const r = wrap.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    currentStroke.current = { tool, color, points: [getPos(e)], videoTime: Math.floor(videoTime) };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!currentStroke.current) return;
    currentStroke.current.points.push(getPos(e));
    redraw();
  };
  const onPointerUp = () => {
    const s = currentStroke.current;
    currentStroke.current = null;
    if (s && s.points.length > 3) {
      setStrokes(prev => ({ ...prev, [page]: [...(prev[page] || []), s] }));
    }
    redraw();
  };

  const changePage = (d: number) => {
    const n = page + d;
    if (n < 0 || n >= PAGES.length) return;
    setPage(n);
  };

  const jumpToAnnot = (time: number, pg: number) => {
    setPage(pg);
    seekTo(time);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 타임라인용 전체 필기 목록
  const allAnnots: { pg: number; idx: number; time: number }[] = [];
  Object.keys(strokes).forEach(k => {
    const pg = Number(k);
    (strokes[pg] || []).forEach((s, idx) => allAnnots.push({ pg, idx, time: s.videoTime }));
  });
  allAnnots.sort((a, b) => a.time - b.time);

  const activeChapter = CHAPTERS.reduce((acc, c, i) => (videoTime >= c.startSec ? i : acc), 0);

  return (
    <div className="pb-40">
      {/* 영상 영역 */}
      <div className="bg-black -mx-4">
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          <div id="watch-player" className="absolute inset-0 w-full h-full" />
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => seekTo(Math.max(0, videoTime - 10))} className="min-w-[44px] min-h-[44px] rounded-xl bg-gray-800 text-white text-xs font-bold">⏪10</button>
            <button onClick={togglePlay} className="min-w-[44px] min-h-[44px] rounded-xl bg-[#3f7c62] text-white text-lg">{playing ? '⏸' : '▶'}</button>
            <button onClick={() => seekTo(videoTime + 10)} className="min-w-[44px] min-h-[44px] rounded-xl bg-gray-800 text-white text-xs font-bold">10⏩</button>
            <span className="ml-auto text-sm font-mono text-gray-300">{fmt(videoTime)}</span>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {CHAPTERS.map((c, i) => (
              <button
                key={i}
                onClick={() => jumpChapter(i)}
                className={`shrink-0 text-xs px-3 py-2 rounded-full border ${i === activeChapter ? 'bg-[#3f7c62] border-[#3f7c62] text-white' : 'border-gray-600 text-gray-300'}`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 교재 영역 */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-sm">{PAGES[page].title}</h2>
          <div className="flex gap-1">
            <button onClick={() => changePage(-1)} disabled={page === 0} className="min-w-[44px] min-h-[44px] rounded-xl bg-white border border-gray-200 disabled:opacity-30">‹</button>
            <span className="self-center text-xs text-gray-500 px-1">{page + 1}/{PAGES.length}</span>
            <button onClick={() => changePage(1)} disabled={page === PAGES.length - 1} className="min-w-[44px] min-h-[44px] rounded-xl bg-white border border-gray-200 disabled:opacity-30">›</button>
          </div>
        </div>

        <div ref={wrapRef} className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-5 min-h-[400px] select-none pointer-events-none">
            <h3 className="font-extrabold mb-3">{PAGES[page].title}</h3>
            {PAGES[page].body.split('\n').map((line, i) =>
              line ? <p key={i} className="text-[15px] leading-8 text-gray-800">{line}</p> : <div key={i} className="h-3" />
            )}
          </div>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full touch-none"
            style={{ cursor: 'crosshair' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
        </div>
      </div>

      {/* 타임라인 */}
      <div className="mt-6">
        <h3 className="font-bold text-sm mb-2">🕐 내 필기 <span className="font-normal text-gray-400 text-xs">— 누르면 영상이 이동해요</span></h3>
        {allAnnots.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-2xl border border-gray-100">교재에 필기하면 여기에 영상 시점과 함께 저장돼요</p>
        ) : (
          <div className="space-y-2">
            {allAnnots.map((a, i) => (
              <button
                key={i}
                onClick={() => jumpToAnnot(a.time, a.pg)}
                className="w-full text-left bg-white rounded-xl border border-gray-200 px-3 py-2.5 flex items-center gap-3 border-l-4 border-l-[#3f7c62]"
              >
                <span className="text-xs font-mono font-bold text-[#3f7c62] bg-[#eef6f1] px-2 py-1 rounded">{fmt(a.time)}</span>
                <span className="text-sm">p.{a.pg + 1} 필기</span>
                <span className="ml-auto text-gray-400">▶</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 플로팅 필기도구 버튼 */}
      <button
        onClick={() => setToolbarOpen(!toolbarOpen)}
        className="fixed bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-[#3f7c62] text-white text-2xl shadow-lg active:scale-95 transition-transform"
        aria-label="필기 도구"
      >
        {toolbarOpen ? '✕' : '✏️'}
      </button>

      {/* 팝업 도구 패널 */}
      {toolbarOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setToolbarOpen(false)} />
          <div className="fixed bottom-24 right-4 z-50 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 w-64">
            <p className="text-xs font-bold text-gray-500 mb-2 px-1">필기 도구</p>
            <div className="grid grid-cols-3 gap-1 mb-3">
              {[
                { id: 'pen', icon: '✏️', label: '펜' },
                { id: 'highlighter', icon: '🖍️', label: '형광펜' },
                { id: 'eraser', icon: '🧽', label: '지우개' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl ${tool === t.id ? 'bg-[#3f7c62] text-white' : 'bg-gray-100'}`}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-[11px] font-medium">{t.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-gray-500 mb-2 px-1">색상</p>
            <div className="flex gap-2 mb-3 px-1">
              {['#1a1a1a', '#e11d48', '#2563eb', '#16a34a', '#eab308'].map(c => (
                <button
                  key={c}
                  onClick={() => { setColor(c); if (tool === 'eraser') setTool('pen'); }}
                  className={`w-10 h-10 rounded-full border-2 ${color === c ? 'border-[#3f7c62] ring-2 ring-[#3f7c62]/30' : 'border-gray-200'}`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setStrokes(prev => ({ ...prev, [page]: (prev[page] || []).slice(0, -1) })); }}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-medium"
              >
                ↩️ 되돌리기
              </button>
              <button
                onClick={() => { if (confirm('이 페이지 필기를 모두 지울까요?')) setStrokes(prev => ({ ...prev, [page]: [] })); }}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-medium"
              >
                🗑️ 전체 지우기
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-400 text-center">필기하면 현재 영상 시점({fmt(videoTime)})이 함께 저장돼요</p>
          </div>
        </>
      )}
    </div>
  );
}
