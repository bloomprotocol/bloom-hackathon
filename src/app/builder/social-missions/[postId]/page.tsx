import { metadata } from './page.meta';
import BuilderLayout from '../components/builder-layout';

export { metadata };

interface PageProps {
  params: Promise<{ postId: string }>;
}

export default async function BuilderMissionDetailPage({ params }: PageProps) {
  const { postId } = await params;

  return <BuilderLayout postId={postId} />;
}
