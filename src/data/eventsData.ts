import { EventItem } from '../types/events';

export const upcomingEvents: EventItem[] = [
  {
    id: '1',
    title: 'Tournoi National FIFA 25',
    description: 'Premier tournoi national de FIFA 25 organisé par la FEGESPORT avec 64 participants venant de toute la Guinée.',
    date: '2025-02-20',
    formattedDate: '20-22 Février 2025',
    time: '09:00 - 18:00',
    location: 'Palais des Sports de Conakry',
    image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
    category: 'Compétition',
    registrationLink: '/events/fifa25-registration',
    type: 'in-person',
    maxParticipants: 64,
    currentParticipants: 32,
    prices: [
      {
        id: 'early-bird',
        name: 'Early Bird',
        amount: 15000,
        description: 'Tarif préférentiel pour les 20 premiers inscrits',
        features: [
          'Participation au tournoi',
          'T-shirt officiel',
          'Accès zone VIP',
          'Buffet inclus'
        ]
      },
      {
        id: 'standard',
        name: 'Standard',
        amount: 25000,
        description: 'Tarif standard',
        features: [
          'Participation au tournoi',
          'T-shirt officiel',
          'Buffet inclus'
        ]
      }
    ],
    rules: `1. Le tournoi est ouvert aux joueurs de plus de 16 ans
2. Chaque participant doit apporter sa propre manette
3. Les matchs se jouent en 6 minutes par mi-temps
4. Le règlement complet sera envoyé par email après l'inscription
5. Les décisions des arbitres sont définitives
6. Tout comportement antisportif sera sanctionné`
  },
  {
    id: '2',
    title: 'Formation des Arbitres Esport',
    description: 'Programme de formation destiné aux futurs arbitres officiels de la FEGESPORT pour les compétitions nationales.',
    date: '2025-03-10',
    formattedDate: '10-12 Mars 2025',
    time: '10:00 - 16:00',
    location: 'Siège FEGESPORT, Conakry',
    image: 'https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg',
    category: 'Formation',
    type: 'in-person',
    maxParticipants: 30,
    currentParticipants: 15,
    prices: [
      {
        id: 'formation-complete',
        name: 'Formation Complète',
        amount: 50000,
        description: 'Formation complète avec certification',
        features: [
          'Formation théorique et pratique',
          'Support de cours',
          'Certification officielle',
          'Repas inclus'
        ]
      }
    ],
    rules: `1. Les participants doivent avoir plus de 18 ans
2. Une bonne connaissance des jeux esport est requise
3. La présence est obligatoire sur les 3 jours
4. Un test final validera la certification`
  },
  {
    id: '3',
    title: 'Remise de PRIX aux Champions du Tournoi Annuel EDITION 9',
    description: 'Cérémonie officielle de remise des prix aux champions du tournoi annuel de la FEGESPORT, édition 9.',
    date: '2025-06-28',
    formattedDate: '28 Juin 2025',
    time: '18:00 - 21:00',
    location: 'Hôtel Kaloum, Conakry',
    image: 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg',
    category: 'Cérémonie',
    type: 'in-person',
    maxParticipants: 200,
    currentParticipants: 0,
    prices: [
      {
        id: 'invitation',
        name: 'Sur Invitation',
        amount: 0,
        description: 'Entrée sur invitation uniquement',
        features: [
          'Cérémonie de remise des prix',
          'Cocktail dînatoire',
          'Networking avec les professionnels',
          'Photos officielles'
        ]
      }
    ],
    rules: `1. Entrée sur invitation uniquement
2. Tenue correcte exigée
3. Les champions doivent confirmer leur présence 7 jours avant l'événement
4. Les photos de l'événement pourront être utilisées à des fins promotionnelles`
  }
];