'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = signup(email, password, name);
    if (!res.ok) {
      setError(res.error || '회원가입에 실패했습니다.');
      return;
    }
    router.push('/');
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-center text-2xl font-extrabold">회원가입</h1>
      <p className="mt-2 text-center text-sm text-gray-500">책둥지와 함께 공부 시작하기</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">이름</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-nest-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">이메일</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-nest-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">비밀번호 (4자 이상)</label>
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-nest-500"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full rounded-xl bg-nest-600 py-3.5 font-bold text-white hover:bg-nest-700">
          가입하기
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-semibold text-nest-700 hover:underline">로그인</Link>
      </p>
    </div>
  );
}
