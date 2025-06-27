import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface CardProps {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  category: 'communiqué' | 'compétition' | 'partenariat';
  linkTo?: string;
}

const CardItem: React.FC<CardProps> = ({ id, title, content, imageUrl, category, linkTo }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'communiqué': return 'bg-blue-600';
      case 'compétition': return 'bg-green-600';
      case 'partenariat': return 'bg-purple-600';
      default: return 'bg-primary-600';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'communiqué': return 'Communiqué';
      case 'compétition': return 'Compétition';
      case 'partenariat': return 'Partenariat';
      default: return category;
    }
  };

  const getDefaultLink = () => {
    switch (category) {
      case 'communiqué': return `/news/${id}`;
      case 'compétition': return `/events/${id}`;
      case 'partenariat': return `/partners`;
      default: return '#';
    }
  };

  const finalLinkTo = linkTo || getDefaultLink();

  return (
    <motion.div 
      className="card h-full flex flex-col"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl || "https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg"} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg";
          }}
        />
        <span className={`absolute top-4 right-4 ${getCategoryColor(category)} text-white text-xs font-bold px-3 py-1 rounded-full`}>
          {getCategoryLabel(category)}
        </span>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold mb-2 line-clamp-2 card-title">
          <Link to={finalLinkTo} className="hover:text-primary-600 transition-colors">
            {title}
          </Link>
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow card-description">
          {content}
        </p>
        <Link 
          to={finalLinkTo} 
          className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
        >
          En savoir plus
          <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
    </motion.div>
  );
};

export default CardItem;