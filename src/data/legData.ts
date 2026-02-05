export interface Discipline {
  id: string;
  name: string;
  games: string[];
  icon: string;
  color: string;
  image?: string;
}

export interface ClubStats {
  trophies: number;
  streamViewers: number;
  winRate: number;
  rank: number;
}

export interface Club {
  id: string;
  name: string;
  city: string;
  region: string;
  leader: {
    name: string;
    title: string;
    photo?: string;
    quote: string;
  };
  coordinates: [number, number];
  color: string;
  logo?: string;
  stats: ClubStats;
  disciplines: {
    [key: string]: {
      roster: string[];
      achievements: string[];
      stats: any;
    };
  };
  socials: {
    discord?: string;
    twitch?: string;
    twitter?: string;
  };
}

export const disciplines: Discipline[] = [
  {
    id: 'strategy',
    name: 'Stratégie',
    games: ['League of Legends', 'Dota 2'],
    icon: '🧠',
    color: '#8B5CF6',
    image: 'https://images.pexels.com/photos/7915435/pexels-photo-7915435.jpeg'
  },
  {
    id: 'fps',
    name: 'FPS',
    games: ['CS:GO', 'Valorant'],
    icon: '🎯',
    color: '#EF4444',
    image: 'https://images.pexels.com/photos/7915257/pexels-photo-7915257.jpeg'
  },
  {
    id: 'foot',
    name: 'Football',
    games: ['FC 26', 'eFootball'],
    icon: '⚽',
    color: '#10B981',
    image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg'
  },
  {
    id: 'racing',
    name: 'Racing',
    games: ['F1 24', 'Gran Turismo'],
    icon: '🏎️',
    color: '#F59E0B',
    image: 'https://images.pexels.com/photos/92071/pexels-photo-92071.jpeg'
  },
  {
    id: 'fighting',
    name: 'Fighting',
    games: ['Tekken 8', 'Street Fighter 6'],
    icon: '🥊',
    color: '#EC4899',
    image: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg'
  }
];

export const clubs: Club[] = [
  {
    id: 'conakry',
    name: 'Capital eSport Elite',
    city: 'Conakry',
    region: 'Capitale',
    leader: {
      name: 'Rep. Féd. Conakry',
      title: 'Représentant Fédéral',
      quote: "L'excellence n'est pas un acte, mais une habitude."
    },
    coordinates: [9.6412, -13.5784],
    color: '#DC2626',
    stats: {
      trophies: 24,
      streamViewers: 15000,
      winRate: 76,
      rank: 1
    },
    disciplines: {
      strategy: {
        roster: ['ProGamer_GN', 'StratMaster', 'LegendKry'],
        achievements: ['Champion National 2024', 'Top 3 West Africa'],
        stats: { winRate: 78, matches: 45 }
      },
      fps: {
        roster: ['HeadshotKing', 'SniperElite', 'TacticalPro'],
        achievements: ['MVP Tournoi National', 'Clutch Master'],
        stats: { kd: 1.8, matches: 52 }
      },
      foot: {
        roster: ['FIFA_Legend', 'eFootPro', 'GoalMachine'],
        achievements: ['Champion e-Ligue', 'Top Scorer'],
        stats: { goals: 124, assists: 67 }
      },
      racing: {
        roster: ['SpeedDemon', 'DriftKing', 'F1_Pro'],
        achievements: ['Fastest Lap Record', 'Circuit Master'],
        stats: { bestLap: '1:23.456', podiums: 18 }
      },
      fighting: {
        roster: ['ComboMaster', 'KO_Legend', 'FightPro'],
        achievements: ['Champion Tekken', 'SF6 Regional Winner'],
        stats: { winRate: 82, perfectKOs: 34 }
      }
    },
    socials: {
      discord: 'https://discord.gg/cee',
      twitch: 'https://twitch.tv/cee',
      twitter: 'https://twitter.com/cee'
    }
  },
  {
    id: 'kankan',
    name: 'Kankan Cyber Kings',
    city: 'Kankan',
    region: 'Haute-Guinée',
    leader: {
      name: 'Rep. Féd. Kankan',
      title: 'Représentant Fédéral',
      quote: "Les rois ne naissent pas, ils se forgent dans la bataille."
    },
    coordinates: [10.3853, -9.3064],
    color: '#F59E0B',
    stats: {
      trophies: 18,
      streamViewers: 8500,
      winRate: 68,
      rank: 3
    },
    disciplines: {
      strategy: {
        roster: ['KingStrat', 'CyberLord', 'TacticsKKN'],
        achievements: ['Vice-Champion 2024', 'Best Rookie Team'],
        stats: { winRate: 65, matches: 38 }
      },
      fps: {
        roster: ['QuickShot', 'RoyalSniper', 'KingFrag'],
        achievements: ['Top 5 National', 'Ace Master'],
        stats: { kd: 1.6, matches: 44 }
      },
      foot: {
        roster: ['KankanMessi', 'CyberRonaldo', 'eKing'],
        achievements: ['Regional Champion', 'Best Defense'],
        stats: { goals: 89, assists: 52 }
      },
      racing: {
        roster: ['FastKing', 'RaceMaster', 'TurboKKN'],
        achievements: ['Regional Podium', 'Drift Champion'],
        stats: { bestLap: '1:25.123', podiums: 12 }
      },
      fighting: {
        roster: ['FightKing', 'ComboLord', 'KKN_Fighter'],
        achievements: ['Regional Winner', 'Combo Specialist'],
        stats: { winRate: 75, perfectKOs: 28 }
      }
    },
    socials: {
      discord: 'https://discord.gg/kck',
      twitch: 'https://twitch.tv/kck'
    }
  },
  {
    id: 'kindia',
    name: 'Kindia Gaming Force',
    city: 'Kindia',
    region: 'Kindia',
    leader: {
      name: 'Rep. Féd. Kindia',
      title: 'Représentant Fédéral',
      quote: "La force réside dans l'unité et la détermination."
    },
    coordinates: [10.0565, -12.8654],
    color: '#10B981',
    stats: {
      trophies: 15,
      streamViewers: 6800,
      winRate: 64,
      rank: 4
    },
    disciplines: {
      strategy: {
        roster: ['ForceStrat', 'GamingTact', 'KND_Brain'],
        achievements: ['Top 8 National', 'Rising Stars'],
        stats: { winRate: 62, matches: 35 }
      },
      fps: {
        roster: ['ForceFPS', 'SharpShooter', 'KND_Aim'],
        achievements: ['Regional Top 3', 'Headshot Leader'],
        stats: { kd: 1.5, matches: 40 }
      },
      foot: {
        roster: ['ForceFC', 'KindiaKick', 'eForce'],
        achievements: ['Regional Semi-Final', 'Best Midfielder'],
        stats: { goals: 76, assists: 48 }
      },
      racing: {
        roster: ['SpeedForce', 'RaceKND', 'TurboForce'],
        achievements: ['Top 10 National', 'Consistency Award'],
        stats: { bestLap: '1:26.789', podiums: 9 }
      },
      fighting: {
        roster: ['FightForce', 'KND_Warrior', 'ComboForce'],
        achievements: ['Regional Top 5', 'Comeback Master'],
        stats: { winRate: 70, perfectKOs: 22 }
      }
    },
    socials: {
      discord: 'https://discord.gg/kgf'
    }
  },
  {
    id: 'labe',
    name: 'Labé Strategy Masters',
    city: 'Labé',
    region: 'Moyenne-Guinée',
    leader: {
      name: 'Rep. Féd. Labé',
      title: 'Représentant Fédéral',
      quote: "La stratégie est l'art de faire servir le temps et l'espace."
    },
    coordinates: [11.3181, -12.2897],
    color: '#8B5CF6',
    stats: {
      trophies: 20,
      streamViewers: 9200,
      winRate: 72,
      rank: 2
    },
    disciplines: {
      strategy: {
        roster: ['MasterStrat', 'LabéBrain', 'TacticalLB'],
        achievements: ['Champion Stratégie 2024', 'Best IGL'],
        stats: { winRate: 80, matches: 42 }
      },
      fps: {
        roster: ['StratShooter', 'TacticalAim', 'LB_Sniper'],
        achievements: ['Top 3 National', 'Strategic Player Award'],
        stats: { kd: 1.7, matches: 48 }
      },
      foot: {
        roster: ['TacticFC', 'LabéPro', 'eMaster'],
        achievements: ['Best Tactics Award', 'Regional Champion'],
        stats: { goals: 95, assists: 71 }
      },
      racing: {
        roster: ['StratRace', 'TacticalDrive', 'LB_Speed'],
        achievements: ['Best Strategy Award', 'Overtake Master'],
        stats: { bestLap: '1:24.567', podiums: 15 }
      },
      fighting: {
        roster: ['StratFight', 'MasterCombo', 'LB_Tactician'],
        achievements: ['Strategic Fighter Award', 'Mind Games Master'],
        stats: { winRate: 78, perfectKOs: 30 }
      }
    },
    socials: {
      discord: 'https://discord.gg/lsm',
      twitch: 'https://twitch.tv/lsm',
      twitter: 'https://twitter.com/lsm'
    }
  },
  {
    id: 'mamou',
    name: 'Mamou Speed Demons',
    city: 'Mamou',
    region: 'Mamou',
    leader: {
      name: 'Rep. Féd. Mamou',
      title: 'Représentant Fédéral',
      quote: "La vitesse n'est rien sans le contrôle."
    },
    coordinates: [10.3753, -12.0913],
    color: '#F97316',
    stats: {
      trophies: 16,
      streamViewers: 7100,
      winRate: 66,
      rank: 5
    },
    disciplines: {
      strategy: {
        roster: ['SpeedStrat', 'QuickMind', 'MM_Tactical'],
        achievements: ['Fast Play Award', 'Aggro Masters'],
        stats: { winRate: 64, matches: 36 }
      },
      fps: {
        roster: ['SpeedFrag', 'QuickScope', 'MM_Rush'],
        achievements: ['Fastest Player Award', 'Rush Master'],
        stats: { kd: 1.6, matches: 46 }
      },
      foot: {
        roster: ['SpeedFC', 'QuickGoal', 'MM_Counter'],
        achievements: ['Counter-Attack Specialists', 'Speed Award'],
        stats: { goals: 88, assists: 59 }
      },
      racing: {
        roster: ['DemonSpeed', 'MamouRacer', 'MM_Turbo'],
        achievements: ['Speed Champion', 'Lap Record Holder'],
        stats: { bestLap: '1:23.891', podiums: 17 }
      },
      fighting: {
        roster: ['SpeedFight', 'QuickCombo', 'MM_Rush'],
        achievements: ['Speed Fighter', 'Quick KO Master'],
        stats: { winRate: 73, perfectKOs: 26 }
      }
    },
    socials: {
      discord: 'https://discord.gg/msd',
      twitch: 'https://twitch.tv/msd'
    }
  },
  {
    id: 'nzerekore',
    name: 'Nzérékoré FPS Fury',
    city: 'Nzérékoré',
    region: 'Guinée Forestière',
    leader: {
      name: 'Rep. Féd. Nzérékoré',
      title: 'Représentant Fédéral',
      quote: "La précision et la rage, ensemble invincibles."
    },
    coordinates: [7.7562, -8.8179],
    color: '#DC2626',
    stats: {
      trophies: 19,
      streamViewers: 8900,
      winRate: 70,
      rank: 3
    },
    disciplines: {
      strategy: {
        roster: ['FuryStrat', 'NZK_Tactical', 'ForestBrain'],
        achievements: ['Aggressive Play Award', 'Top 5 National'],
        stats: { winRate: 67, matches: 39 }
      },
      fps: {
        roster: ['FuryFrag', 'HeadshotNZK', 'ForestSniper'],
        achievements: ['FPS Champion 2024', 'Best Aimer'],
        stats: { kd: 1.9, matches: 55 }
      },
      foot: {
        roster: ['FuryFC', 'NZK_Striker', 'ForestGoal'],
        achievements: ['Top Scorer Regional', 'Attack Award'],
        stats: { goals: 102, assists: 64 }
      },
      racing: {
        roster: ['FuryRace', 'NZK_Speed', 'ForestDrift'],
        achievements: ['Regional Winner', 'Aggressive Racer'],
        stats: { bestLap: '1:24.890', podiums: 14 }
      },
      fighting: {
        roster: ['FuryFight', 'NZK_Combo', 'ForestWarrior'],
        achievements: ['Aggressive Fighter', 'KO Specialist'],
        stats: { winRate: 76, perfectKOs: 32 }
      }
    },
    socials: {
      discord: 'https://discord.gg/nff',
      twitch: 'https://twitch.tv/nff'
    }
  },
  {
    id: 'boke',
    name: 'Boké Fight Legion',
    city: 'Boké',
    region: 'Boké',
    leader: {
      name: 'Rep. Féd. Boké',
      title: 'Représentant Fédéral',
      quote: "Chaque combat est une leçon, chaque victoire une légende."
    },
    coordinates: [10.9424, -14.2918],
    color: '#EC4899',
    stats: {
      trophies: 17,
      streamViewers: 7500,
      winRate: 67,
      rank: 4
    },
    disciplines: {
      strategy: {
        roster: ['LegionStrat', 'BK_Tactical', 'FightMind'],
        achievements: ['Defensive Masters', 'Top 6 National'],
        stats: { winRate: 66, matches: 37 }
      },
      fps: {
        roster: ['LegionFPS', 'BK_Sniper', 'FightShooter'],
        achievements: ['Clutch Master', 'Defense Award'],
        stats: { kd: 1.7, matches: 47 }
      },
      foot: {
        roster: ['LegionFC', 'BK_Defender', 'FightGoalie'],
        achievements: ['Best Defense Award', 'Clean Sheet Master'],
        stats: { goals: 72, assists: 55 }
      },
      racing: {
        roster: ['LegionRace', 'BK_Racer', 'FightSpeed'],
        achievements: ['Consistent Finisher', 'Regional Top 5'],
        stats: { bestLap: '1:25.678', podiums: 11 }
      },
      fighting: {
        roster: ['LegionFighter', 'BK_Master', 'ComboLegion'],
        achievements: ['Fighting Champion 2024', 'Combo Legend'],
        stats: { winRate: 80, perfectKOs: 35 }
      }
    },
    socials: {
      discord: 'https://discord.gg/bfl',
      twitch: 'https://twitch.tv/bfl'
    }
  },
  {
    id: 'faranah',
    name: 'Faranah Foot Legends',
    city: 'Faranah',
    region: 'Faranah',
    leader: {
      name: 'Rep. Féd. Faranah',
      title: 'Représentant Fédéral',
      quote: "Le football virtuel, comme le vrai, se joue avec le cœur."
    },
    coordinates: [10.0416, -10.7442],
    color: '#10B981',
    stats: {
      trophies: 21,
      streamViewers: 9800,
      winRate: 74,
      rank: 2
    },
    disciplines: {
      strategy: {
        roster: ['LegendStrat', 'FR_Tactical', 'FootBrain'],
        achievements: ['Team Play Masters', 'Top 4 National'],
        stats: { winRate: 71, matches: 40 }
      },
      fps: {
        roster: ['LegendFPS', 'FR_Shooter', 'FootSniper'],
        achievements: ['Team Coordination Award', 'Top 4 National'],
        stats: { kd: 1.7, matches: 49 }
      },
      foot: {
        roster: ['LegendFC', 'FR_Messi', 'FootMaster'],
        achievements: ['Football Champion 2024', 'Golden Boot'],
        stats: { goals: 145, assists: 89 }
      },
      racing: {
        roster: ['LegendRace', 'FR_Speed', 'FootRacer'],
        achievements: ['Fair Play Award', 'Regional Podium'],
        stats: { bestLap: '1:24.234', podiums: 13 }
      },
      fighting: {
        roster: ['LegendFight', 'FR_Combo', 'FootWarrior'],
        achievements: ['Technical Fighter', 'Regional Winner'],
        stats: { winRate: 77, perfectKOs: 29 }
      }
    },
    socials: {
      discord: 'https://discord.gg/ffl',
      twitch: 'https://twitch.tv/ffl',
      twitter: 'https://twitter.com/ffl'
    }
  }
];

export const getClubsByDisciplineRanking = (disciplineId: string) => {
  return clubs
    .map(club => ({
      club,
      stats: club.disciplines[disciplineId]?.stats || {},
      achievements: club.disciplines[disciplineId]?.achievements || []
    }))
    .sort((a, b) => {
      const aWinRate = a.stats.winRate || 0;
      const bWinRate = b.stats.winRate || 0;
      return bWinRate - aWinRate;
    });
};

export const getOverallRanking = () => {
  return clubs.sort((a, b) => b.stats.rank - a.stats.rank);
};
