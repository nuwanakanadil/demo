export interface Item {
  id: string;
  title: string;
  category: 'clothing' | 'shoes' | 'accessories';
  size: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  price: number;
  createdAt?: string;
  owner: string;
  imageUrl: string;
  isOwn: boolean;
  isCompleted?: boolean;
}

export interface Filters {
  category: string;
  size: string;
  condition: string;
  dateFrom: string;
  dateTo: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: Filters;
}
