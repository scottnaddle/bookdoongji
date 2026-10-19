'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function MyPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [annotationCount, setAnnotationCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      // 이 사용자의 필기 개수 세기
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`bookdoongji_annotations:${user.email}:`)) count++;
      }
      setAnnotationCount(count);
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div className="py-20 text-center text-gray-500">로딩 중…</div>;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-extrabold">내 정보</h1>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-nest-100 text-2xl">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-extrabold text-nest-700">{annotationCount}</p>
          <p className="mt-1 text-xs text-gray-500">필기한 페이지</p>
        </div>
        <Link href="/" className="rounded-2xl border border-gray-200 bg-white p-4 text-center hover:border-nest-300">
          <p className="text-2xl">📚</p>
          <p className="mt-1 text-xs text-gray-500">서재로 가기</p>
        </Link>
      </div>

      <button
        onClick={() => {
          if (confirm('로그아웃할까요?')) {
            logout();
            router.push('/');
          }
        }}
        className="mt-6 w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        로그아웃
      </button>
    </div>
  );
}
