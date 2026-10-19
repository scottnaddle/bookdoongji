import WatchClient from './WatchClient';

export const metadata = {
  title: '영상 연동 학습',
  description: '강의 영상을 보면서 교재에 필기하세요',
};

export default function WatchPage({ params }: { params: { id: string } }) {
  return <WatchClient bookId={params.id} />;
}
