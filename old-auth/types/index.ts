export interface Post {
  id: string;
  title: string;
  content: string;
  location: string;
  createdAt: string;
  category: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  attachment?: string;
  images: string[];
}

export type Category = 'immigration' | 'fire' | 'general';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 