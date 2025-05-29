import useSWR from 'swr';
import { fetchAPI } from '../lib/strapi';

export interface CommunityStats {
  players: number;
  clubs: number;
  partners: number;
}

export function useCommunityStats() {
  const { data, error, isLoading, mutate } = useSWR<CommunityStats>(
    '/community-stats',
    () => fetchAPI('/community-stats')
  );

  return {
    stats: data,
    isLoading,
    isError: error,
    mutate,
  };
}