import ReaderClient from './ReaderClient';

export default function ReaderPage({ params }: { params: { id: string } }) {
  return <ReaderClient bookId={params.id} />;
}
