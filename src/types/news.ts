export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  category?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category?: string;
  image_url?: string;
  author_id?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}