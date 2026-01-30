import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface CommunityStats {
  players: number;
  clubs: number;
  partners: number;
}

export async function fetchCommunityStats(): Promise<CommunityStats> {
  try {
    console.log('[fetchCommunityStats] Starting fetch...');

    // Get active players count
    const playersResult = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('member_type', 'player')
      .eq('status', 'active');

    console.log('[fetchCommunityStats] Players result:', playersResult);
    if (playersResult.error) {
      console.error('[fetchCommunityStats] Players error:', playersResult.error);
    }

    // Get active clubs count
    const clubsResult = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('member_type', 'club')
      .eq('status', 'active');

    console.log('[fetchCommunityStats] Clubs result:', clubsResult);
    if (clubsResult.error) {
      console.error('[fetchCommunityStats] Clubs error:', clubsResult.error);
    }

    // Get partners count from both members table and partners table
    const memberPartnersResult = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('member_type', 'partner')
      .eq('status', 'active');

    console.log('[fetchCommunityStats] Member partners result:', memberPartnersResult);
    if (memberPartnersResult.error) {
      console.error('[fetchCommunityStats] Member partners error:', memberPartnersResult.error);
    }

    const directPartnersResult = await supabase
      .from('partners')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    console.log('[fetchCommunityStats] Direct partners result:', directPartnersResult);
    if (directPartnersResult.error) {
      console.error('[fetchCommunityStats] Direct partners error:', directPartnersResult.error);
    }

    // Combine partner counts
    const totalPartners = (memberPartnersResult.count || 0) + (directPartnersResult.count || 0);

    const stats = {
      players: playersResult.count || 0,
      clubs: clubsResult.count || 0,
      partners: totalPartners || 0
    };

    console.log('[fetchCommunityStats] Final stats:', stats);
    return stats;
  } catch (error) {
    console.error('[fetchCommunityStats] Exception:', error);
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
