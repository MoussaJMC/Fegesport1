import { NewsItem } from '../types/news';

export const latestNews: NewsItem[] = [
  {
    id: '1',
    title: 'Lancement officiel de la FEGESPORT',
    excerpt: 'La Fédération Guinéenne d\'Esport (FEGESPORT) a été officiellement lancée lors d\'une cérémonie à Conakry.',
    content: 'La Fédération Guinéenne d\'Esport (FEGESPORT) a été officiellement lancée lors d\'une cérémonie à Conakry en présence de représentants du Ministère des Sports, de clubs esport et de partenaires. Cette étape marque un tournant majeur pour l\'esport guinéen qui dispose désormais d\'un organe officiel de gouvernance.',
    date: '2025-01-15',
    image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
    category: 'Communiqué',
    author: {
      name: 'FEGESPORT',
    },
    tags: ['lancement', 'officiel', 'cérémonie']
  },
  {
    id: '2',
    title: 'Premier tournoi national FIFA 25',
    excerpt: 'La FEGESPORT organise son premier tournoi national FIFA 25 avec la participation de 64 joueurs de toute la Guinée.',
    content: 'La FEGESPORT organise son premier tournoi national FIFA 25 avec la participation de 64 joueurs de toute la Guinée. L\'événement se déroulera à Conakry du 20 au 22 février et sera diffusé en direct sur les plateformes de streaming. Les meilleurs joueurs représenteront la Guinée lors des compétitions internationales.',
    date: '2025-01-28',
    image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
    category: 'Compétition',
    author: {
      name: 'Commission Compétitions',
    },
    tags: ['FIFA', 'tournoi', 'national']
  },
  {
    id: '3',
    title: 'Partenariat avec le Ministère de la Jeunesse et des Sports',
    excerpt: 'La FEGESPORT signe une convention de partenariat avec le Ministère de la Jeunesse et des Sports pour développer l\'esport en Guinée.',
    content: 'La FEGESPORT a signé une convention de partenariat avec le Ministère de la Jeunesse et des Sports pour développer l\'esport en Guinée. Ce partenariat stratégique permettra de mettre en place des programmes de formation, d\'organiser des compétitions nationales et de soutenir les athlètes guinéens dans les compétitions internationales.',
    date: '2025-02-05',
    image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg',
    category: 'Partenariat',
    author: {
      name: 'Direction Communication',
    },
    tags: ['ministère', 'partenariat', 'développement']
  },
  {
    id: '4',
    title: 'Formation des arbitres esport',
    excerpt: 'La FEGESPORT lance un programme de formation d\'arbitres esport pour professionnaliser les compétitions nationales.',
    content: 'La FEGESPORT lance un programme de formation d\'arbitres esport pour professionnaliser les compétitions nationales. Cette initiative vise à former des arbitres compétents capables d\'officier lors des tournois officiels selon les standards internationaux. La première session de formation se déroulera du 10 au 12 mars à Conakry.',
    date: '2025-02-20',
    image: 'https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg',
    category: 'Formation',
    author: {
      name: 'Commission Arbitrage',
    },
    tags: ['arbitres', 'formation', 'professionnalisation']
  },
  {
    id: '5',
    title: 'La Guinée sélectionnée pour les Championnats d\'Afrique d\'Esport',
    excerpt: 'La FEGESPORT annonce la participation de la Guinée aux Championnats d\'Afrique d\'Esport qui se tiendront au Sénégal.',
    content: 'La FEGESPORT annonce la participation de la Guinée aux Championnats d\'Afrique d\'Esport qui se tiendront au Sénégal du 15 au 20 avril. Une délégation de 12 joueurs représentera les couleurs nationales dans plusieurs disciplines dont FIFA, Street Fighter et League of Legends. Cette première participation internationale marque une étape importante pour l\'esport guinéen.',
    date: '2025-03-01',
    image: 'https://images.pexels.com/photos/159393/gamepad-video-game-controller-game-controller-controller-159393.jpeg',
    category: 'International',
    author: {
      name: 'FEGESPORT',
    },
    tags: ['championnat', 'afrique', 'international']
  }
];