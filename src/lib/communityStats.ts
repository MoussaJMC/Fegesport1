import { supabase } from './supabase';

export interface CommunityStats {
  players: number;
  clubs: number;
  partners: number;
}

export async function fetchCommunityStats(): Promise<CommunityStats> {
  try {
    // Get active players count
    const { count: playersCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('member_type', 'player')
      .eq('status', 'active');

    // Get active clubs count
    const { count: clubsCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('member_type', 'club')
      .eq('status', 'active');

    // Get partners count from both members table and partners table
    const { count: memberPartnersCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('member_type', 'partner')
      .eq('status', 'active');

    const { count: directPartnersCount } = await supabase
      .from('partners')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Combine partner counts
    const totalPartners = (memberPartnersCount || 0) + (directPartnersCount || 0);

    return {
      players: playersCount || 0,
      clubs: clubsCount || 0,
      partners: totalPartners || 0
    };
  } catch (error) {
    console.error('Error fetching community stats:', error);
    return {
      players: 0,
      clubs: 0,
      partners: 0
    };
  }
}
