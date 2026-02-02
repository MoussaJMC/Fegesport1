import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface CommunityStats {
  players: number;
  clubs: number;
  partners: number;
}

export async function fetchCommunityStats(): Promise<CommunityStats> {
  try {
    // Get active players count
    const playersResult = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('member_type', 'player')
      .eq('status', 'active');

    // Get active clubs count
    const clubsResult = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('member_type', 'club')
      .eq('status', 'active');

    // Get partners count from both members table and partners table
    const memberPartnersResult = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('member_type', 'partner')
      .eq('status', 'active');

    const directPartnersResult = await supabase
      .from('partners')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Combine partner counts
    const totalPartners = (memberPartnersResult.count || 0) + (directPartnersResult.count || 0);

    const stats = {
      players: playersResult.count || 0,
      clubs: clubsResult.count || 0,
      partners: totalPartners || 0
    };

    return stats;
  } catch (error) {
    // Return default values on error
    return {
      players: 0,
      clubs: 0,
      partners: 0
    };
  }
}

export function subscribeToCommunityStats(
  onUpdate: () => void
): RealtimeChannel {
  const channel = supabase
    .channel('community-stats-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'members'
      },
      () => {
        onUpdate();
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'partners'
      },
      () => {
        onUpdate();
      }
    )
    .subscribe();

  return channel;
}
