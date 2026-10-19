/** 표지 이미지 연결 전까지 쓰는 플레이스홀더 — 도서 ID로 색 조합을 고정한다 */
const PALETTES = [
  { bg: "from-nest-600 to-nest-800", band: "bg-twig" },
  { bg: "from-[#6b4f8a] to-[#3f2d55]", band: "bg-yellow-300" },
  { bg: "from-[#b5753c] to-[#7a4b22]", band: "bg-nest-200" },
  { bg: "from-[#33607e] to-[#1d3a4f]", band: "bg-[#f2c879]" },
  { bg: "from-[#8a3b3b] to-[#5a2323]", band: "bg-paper" },
] as const;

function paletteFor(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTES[hash % PALETTES.length] ?? PALETTES[0];
}

interface BookCoverProps {
  id: string;
  title: string;
  publisher: string;
  size?: "md" | "lg";
}

export default function BookCover({ id, title, publisher, size = "md" }: BookCoverProps) {
  const palette = paletteFor(id);
  const large = size === "lg";

  return (
    <div
      role="img"
      aria-label={`${title} 표지`}
      className={`relative aspect-[3/4] w-full overflow-hidden rounded-r-md rounded-l-sm bg-gradient-to-br ${palette.bg} shadow-book`}
    >
      {/* 책등 그림자 */}
      <div className="absolute inset-y-0 left-0 w-2 bg-black/20" />
      <div className={`absolute left-0 right-0 top-[18%] h-1.5 ${palette.band} opacity-90`} />
      <div className={`absolute inset-x-0 flex flex-col justify-between ${large ? "inset-y-8 px-7" : "inset-y-5 px-4"}`}>
        <p
          className={`mt-6 font-bold leading-snug text-white [word-break:keep-all] ${
            large ? "text-2xl" : "line-clamp-4 text-sm"
          }`}
        >
          {title}
        </p>
        <p className={`text-white/70 ${large ? "text-sm" : "text-[11px]"}`}>{publisher}</p>
      </div>
    </div>
  );
}
