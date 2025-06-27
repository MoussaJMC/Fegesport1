import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import CardItem from './CardItem';

interface Card {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  category: 'communiqué' | 'compétition' | 'partenariat';
  is_active: boolean;
}

interface CardGridProps {
  category?: 'communiqué' | 'compétition' | 'partenariat';
  limit?: number;
  title?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
}

const CardGrid: React.FC<CardGridProps> = ({ 
  category, 
  limit = 3, 
  title, 
  showViewAll = false,
  viewAllLink = '/news'
}) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, [category, limit]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      
      // Build query
      let query = supabase
        .from('cards')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      // Add category filter if provided
      if (category) {
        query = query.eq('category', category);
      }
      
      // Add limit
      query = query.limit(limit);
      
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching cards:', error);
        // Use mock data on error
        setCards(getMockCards(category, limit));
      } else if (data && data.length > 0) {
        setCards(data);
      } else {
        // No data found, use mock data
        setCards(getMockCards(category, limit));
      }
    } catch (error) {
      console.error('Error in fetchCards:', error);
      setCards(getMockCards(category, limit));
    } finally {
      setLoading(false);
    }
  };

  const getMockCards = (category?: string, limit: number = 3): Card[] => {
    const allCards = [
      {
        id: '1',
        title: 'Lancement officiel de la FEGESPORT',
        content: 'La Fédération Guinéenne d\'Esport (FEGESPORT) a été officiellement lancée lors d\'une cérémonie à Conakry en présence de représentants du Ministère des Sports, de clubs esport et de partenaires.',
        image_url: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
        category: 'communiqué' as const,
        is_active: true
      },
      {
        id: '2',
        title: 'Premier tournoi national FIFA 25',
        content: 'La FEGESPORT organise son premier tournoi national FIFA 25 avec la participation de 64 joueurs de toute la Guinée. L\'événement se déroulera à Conakry du 20 au 22 février.',
        image_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
        category: 'compétition' as const,
        is_active: true
      },
      {
        id: '3',
        title: 'Partenariat avec le Ministère de la Jeunesse et des Sports',
        content: 'La FEGESPORT a signé une convention de partenariat avec le Ministère de la Jeunesse et des Sports pour développer l\'esport en Guinée.',
        image_url: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg',
        category: 'partenariat' as const,
        is_active: true
      },
      {
        id: '4',
        title: 'Formation des arbitres esport',
        content: 'La FEGESPORT lance un programme de formation d\'arbitres esport pour professionnaliser les compétitions nationales.',
        image_url: 'https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg',
        category: 'communiqué' as const,
        is_active: true
      },
      {
        id: '5',
        title: 'Championnat national de PUBG Mobile',
        content: 'Le premier championnat national de PUBG Mobile se tiendra du 15 au 17 mars à Conakry avec 32 équipes qualifiées.',
        image_url: 'https://images.pexels.com/photos/159393/gamepad-video-game-controller-game-controller-controller-159393.jpeg',
        category: 'compétition' as const,
        is_active: true
      },
      {
        id: '6',
        title: 'Partenariat avec Orange Guinée',
        content: 'Orange Guinée devient partenaire officiel de la FEGESPORT pour soutenir le développement de l\'esport en Guinée.',
        image_url: 'https://images.pexels.com/photos/2381466/pexels-photo-2381466.jpeg',
        category: 'partenariat' as const,
        is_active: true
      }
    ];
    
    // Filter by category if provided
    const filteredCards = category 
      ? allCards.filter(card => card.category === category)
      : allCards;
    
    // Return limited number of cards
    return filteredCards.slice(0, limit);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: limit }).map((_, index) => (
          <div key={index} className="card h-64 animate-pulse">
            <div className="h-32 bg-gray-300"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {title && (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4 sm:mb-0">{title}</h2>
          {showViewAll && (
            <a href={viewAllLink} className="text-primary-500 hover:text-primary-400 font-medium flex items-center">
              Voir tout <span aria-hidden="true" className="ml-1">→</span>
            </a>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            id={card.id}
            title={card.title}
            content={card.content}
            imageUrl={card.image_url}
            category={card.category}
          />
        ))}
      </div>
    </div>
  );
};

export default CardGrid;