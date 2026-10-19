'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function AuthButtons() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) return <span className="text-sm text-gray-400">…</span>;

  if (!user) {
    return (
      <>
        <li>
          <Link href="/login" className="hover:text-nest-600">로그인</Link>
        </li>
        <li>
          <Link href="/signup" className="rounded-full bg-nest-600 px-3 py-1.5 text-white hover:bg-nest-700">
            회원가입
          </Link>
        </li>
      </>
    );
  }

  return (
    <>
      <li>
        <Link href="/my" className="hover:text-nest-600" title={user.email}>
          {user.name}님
        </Link>
      </li>
      <li>
        <button onClick={logout} className="text-gray-500 hover:text-gray-700">
          로그아웃
        </button>
      </li>
    </>
  );
}
