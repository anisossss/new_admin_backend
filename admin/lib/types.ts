export type Language = 'fr' | 'en' | 'ar';
export type ArticleStatus = 'draft' | 'published' | 'scheduled';
export type AiTone = 'neutre' | 'formel' | 'dynamique' | 'analytique';
export type AiLength = 'court' | 'moyen' | 'long';
export type AiMode = 'ameliorer' | 'raccourcir' | 'developper' | 'simplifier' | 'professionnel';

export interface Website {
  _id: string;
  name: string;
  slug: string;
  url?: string;
  description?: string;
  language: Language;
  themeColor: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoverImage {
  url?: string;
  alt?: string;
}

export interface ArticleSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: CoverImage;
  category: string;
  tags: string[];
  author?: { name?: string };
  websites: (Website | string)[];
  status: ArticleStatus;
  publishedAt?: string;
  scheduledFor?: string;
  featured: boolean;
  views: number;
  seo?: ArticleSeo;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  pages: number;
}

export interface ArticlePayload {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: CoverImage;
  category?: string;
  tags?: string[];
  websites?: string[];
  status?: ArticleStatus;
  featured?: boolean;
  scheduledFor?: string | null;
  seo?: ArticleSeo;
}

export interface WebsitePayload {
  name?: string;
  description?: string;
  url?: string;
  active?: boolean;
}

export interface Health {
  ok: boolean;
  mongo: boolean;
  aiConfigured: boolean;
}

export interface Stats {
  totals: {
    articles: number;
    published: number;
    drafts: number;
    websites: number;
    views: number;
  };
  perWebsite: {
    name: string;
    slug: string;
    themeColor: string;
    articles: number;
    views: number;
  }[];
  recent: Article[];
}

export interface MediaItem {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
}

export interface UploadResult {
  url: string;
  filename: string;
}

export interface GenerateRequest {
  topic: string;
  language: Language;
  tone: AiTone;
  length: AiLength;
  instructions?: string;
}

export interface GenerateResult {
  title: string;
  excerpt: string;
  contentHtml: string;
  category: string;
  tags: string[];
}

export interface ReformulateRequest {
  text: string;
  mode: AiMode;
  language: Language;
}

export interface SeoRequest {
  title: string;
  content: string;
  language: Language;
}

export interface SeoResult {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  slug: string;
}

export interface TitlesRequest {
  topic?: string;
  content?: string;
  language: Language;
}

export interface TitlesResult {
  titles: string[];
}
