import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface CommunityStats {
  players: number;
  clubs: number;
  partners: number;
}

export function useCommunityStats() {
  const [stats, setStats] = useState<CommunityStats>({
    players: 200,
    clubs: 15,
    partners: 8
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      // Try to get members count
      const { count: playersCount, error: playersError } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('member_type', 'player');
      
      // Try to get clubs count
      const { count: clubsCount, error: clubsError } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('member_type', 'club');
      
      // Try to get partners count
      const { count: partnersCount, error: partnersError } = await supabase
        .from('partners')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      // Update stats with real data if available
      setStats({
        players: playersCount || 200,
        clubs: clubsCount || 15,
        partners: partnersCount || 8
      });
    } catch (error) {
      console.error('Error fetching community stats:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const mutate = () => {
    fetchStats();
  };

  return {
    stats,
    isLoading,
    isError,
    mutate,
  };
}