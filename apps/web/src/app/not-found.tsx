import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-5xl font-extrabold text-nest-200">404</p>
      <h1 className="mt-4 text-xl font-bold text-gray-900">찾으시는 페이지가 둥지에 없어요</h1>
      <p className="mt-2 text-sm text-gray-500">주소가 바뀌었거나 판매가 종료된 도서일 수 있어요.</p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-nest-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-nest-700">
        홈으로 가기
      </Link>
    </div>
  );
}
