import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-nest-100 bg-paper-dark">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-gray-600 md:grid-cols-3">
        <div>
          <p className="text-base font-bold text-nest-800">책둥지</p>
          <p className="mt-2 leading-relaxed">
            수험서를 둥지처럼 한곳에.
            <br />
            소장·대여·무료 맛보기로 필요한 만큼만 읽으세요.
          </p>
        </div>
        <ul className="space-y-2">
          <li>
            <Link href="/" className="hover:text-nest-700">
              홈
            </Link>
          </li>
          <li>
            <Link href="/search" className="hover:text-nest-700">
              도서 검색
            </Link>
          </li>
          <li>
            <Link href="/#free" className="hover:text-nest-700">
              무료 도서
            </Link>
          </li>
        </ul>
        <div className="space-y-1 md:text-right">
          <p>고객센터 운영시간 평일 10:00 – 18:00</p>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} 책둥지. 모든 도서 정보는 예시 데이터입니다.</p>
        </div>
      </div>
    </footer>
  );
}
