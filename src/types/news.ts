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