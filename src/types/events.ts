export interface EventPrice {
  id: string;
  name: string;
  amount: number;
  description: string;
  features: string[];
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  formattedDate: string;
  time?: string;
  location?: string;
  image: string;
  category?: string;
  registrationLink?: string;
  type?: 'online' | 'in-person' | 'hybrid';
  prices?: EventPrice[];
  rules?: string;
  maxParticipants?: number;
  currentParticipants?: number;
}