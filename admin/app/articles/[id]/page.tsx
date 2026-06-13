'use client';

import { use } from 'react';
import ArticleEditor from '@/components/editor/ArticleEditor';

// Next.js 16 : params est une Promise — on la déballe avec React.use().
export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ArticleEditor articleId={id} />;
}
