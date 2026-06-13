import type {
  Article,
  ArticleListResponse,
  ArticlePayload,
  GenerateRequest,
  GenerateResult,
  Health,
  MediaItem,
  ReformulateRequest,
  SeoRequest,
  SeoResult,
  Stats,
  TitlesRequest,
  TitlesResult,
  UploadResult,
  Website,
  WebsitePayload,
} from './types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  offline: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.offline = status === 0;
  }
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Une erreur inattendue est survenue.';
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { cache: 'no-store', ...init });
  } catch {
    throw new ApiError('Backend injoignable — vérifiez que l’API tourne sur le port 4000.', 0);
  }
  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const data = await res.json();
      if (data && typeof data.error === 'string') message = data.error;
    } catch {
      // réponse sans corps JSON : on garde le message générique
    }
    throw new ApiError(message, res.status);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

function json(body: unknown, method = 'POST'): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

function query(params: Record<string, string | number | boolean | undefined>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

/* ——— Santé & statistiques ——— */

export const getHealth = () => request<Health>('/api/health');

export const getStats = () => request<Stats>('/api/stats');

/* ——— Sites ——— */

export const getWebsites = () => request<Website[]>('/api/websites');

export const updateWebsite = (id: string, data: WebsitePayload) =>
  request<Website>(`/api/websites/${id}`, json(data, 'PUT'));

/* ——— Articles ——— */

export interface ArticleQuery {
  status?: string;
  website?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getArticles = (params: ArticleQuery = {}) =>
  request<ArticleListResponse>(`/api/articles${query({ ...params })}`);

export const getArticle = (id: string) => request<Article>(`/api/articles/${id}`);

export const createArticle = (data: ArticlePayload) => request<Article>('/api/articles', json(data));

export const updateArticle = (id: string, data: ArticlePayload) =>
  request<Article>(`/api/articles/${id}`, json(data, 'PUT'));

export const deleteArticle = (id: string) =>
  request<{ ok?: boolean }>(`/api/articles/${id}`, { method: 'DELETE' });

export const duplicateArticle = (id: string) =>
  request<Article>(`/api/articles/${id}/duplicate`, { method: 'POST' });

/* ——— Médias ——— */

export const uploadFile = (file: File) => {
  const body = new FormData();
  body.append('file', file);
  return request<UploadResult>('/api/upload', { method: 'POST', body });
};

export const getMedia = () => request<MediaItem[]>('/api/media');

export const deleteMedia = (filename: string) =>
  request<{ ok?: boolean }>(`/api/media/${encodeURIComponent(filename)}`, { method: 'DELETE' });

/* ——— IA (Claude via le backend) ——— */

export const aiGenerate = (data: GenerateRequest) =>
  request<GenerateResult>('/api/ai/generate', json(data));

export const aiReformulate = (data: ReformulateRequest) =>
  request<{ text: string }>('/api/ai/reformulate', json(data));

export const aiSeo = (data: SeoRequest) => request<SeoResult>('/api/ai/seo', json(data));

export const aiTitles = (data: TitlesRequest) => request<TitlesResult>('/api/ai/titles', json(data));
