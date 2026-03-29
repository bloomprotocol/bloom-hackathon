import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';

// Client component wrapper
import ProjectDetailPageClient from './ProjectDetailPageClient';

// Helper function to fetch project data
async function getProjectData(slug: string, isPreview: boolean = false, token?: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
  const decodedSlug = decodeURIComponent(slug);

  // Build URL with preview param if needed
  const url = isPreview
    ? `${apiUrl}/public/project/${decodedSlug}?preview=true`
    : `${apiUrl}/public/project/${decodedSlug}`;

  // Build headers with Authorization if preview mode and token exists
  const headers: HeadersInit = {};
  if (isPreview && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers,
    });

    if (!response.ok) return null;

    const result = await response.json();
    return result.data || null;
  } catch {
    return null;
  }
}

// Helper function to strip HTML tags
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// Dynamic metadata generation
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === 'true';

  // Get token for preview mode
  let token: string | undefined;
  if (isPreview) {
    const cookieStore = await cookies();
    token = cookieStore.get('auth-token')?.value;
  }

  const project = await getProjectData(name, isPreview, token);

  if (!project) {
    return {
      title: 'Project Not Found | Bloom',
      description: 'The requested project could not be found.',
    };
  }

  const projectName = project.project?.name || 'Project';
  const title = `${projectName} | Bloom Protocol`;
  const overview = project.content?.overview || project.project?.whyMe || '';
  const description = stripHtml(overview) || `Learn more about ${projectName} on Bloom Protocol`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://bloomprotocol.ai/project/${name}`,
      images: project.project?.avatarUrl ? [
        {
          url: project.project.avatarUrl,
          width: 1200,
          height: 630,
          alt: projectName,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: project.project?.avatarUrl ? [project.project.avatarUrl] : [],
    },
  };
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { name } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === 'true';

  if (!name) {
    redirect('/spotlight');
  }

  // Get token for preview mode
  let token: string | undefined;
  if (isPreview) {
    const cookieStore = await cookies();
    token = cookieStore.get('auth-token')?.value;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
  const decodedSlug = decodeURIComponent(name);

  // Fetch project data and display config in parallel
  const [projectData, configResponse] = await Promise.all([
    getProjectData(name, isPreview, token),
    fetch(`${apiUrl}/projects/${decodedSlug}/display-config`, { cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .catch(() => null)
  ]);

  if (!projectData) {
    notFound();
  }

  // Handle display config - provide default if not available
  const displayConfig = configResponse?.data?.components ?? {
    teamMembers: true,
    roadmap: true,
    tokenomics: true,
    projectUpdates: true,
    links: true
  };

  return <ProjectDetailPageClient
    projectData={projectData}
    displayConfig={displayConfig}
  />;
}
