export interface Post {
  id: number;
  title: string;
  content: string;
  category_id: number;
  tags?: string[];
  location?: string;
  attachment?: string;
  status: 'pending' | 'verified' | 'flagged';
  upvotes: number;
  downvotes: number;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 