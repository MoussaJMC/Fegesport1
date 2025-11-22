import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { EventItem } from '../../types/events';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { getEventTranslation } from '../../utils/translations';

interface EventCardProps {
  event: EventItem;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // Get translated content
  const translated = event.translations
    ? getEventTranslation(event.translations, currentLanguage)
    : { title: event.title, description: event.description, location: event.location || '' };
  
  return (
    <motion.div 
      className="card flex flex-col md:flex-row overflow-hidden"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <div className="w-full md:w-1/3 h-48 md:h-auto relative">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
          }}
        />
        <div className="absolute top-0 left-0 bg-primary-600 text-white p-2 text-center">
          <div className="text-xl font-bold">
            {new Date(event.date).getDate()}
          </div>
          <div className="text-xs">
            {new Date(event.date).toLocaleString('default', { month: 'short' })}
          </div>
        </div>
      </div>
      <div className="w-full md:w-2/3 p-5">
        <div className="text-sm text-gray-500 mb-1 flex items-center">
          <Calendar size={14} className="mr-1" />
          <time dateTime={event.date}>{event.formattedDate}</time>
        </div>
        <h3 className="text-lg font-bold mb-2 line-clamp-2 card-title">
          <Link to={`/events/${event.id}`} className="hover:text-primary-600 transition-colors">
            {translated.title || event.title}
          </Link>
        </h3>
        <div className="flex flex-col space-y-1 mb-3">
          {(translated.location || event.location) && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin size={14} className="mr-1 text-gray-400 flex-shrink-0" />
              <span className="line-clamp-1">{translated.location || event.location}</span>
            </div>
          )}
          {event.time && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock size={14} className="mr-1 text-gray-400 flex-shrink-0" />
              <span>{event.time}</span>
            </div>
          )}
        </div>
        <Link 
          to={`/events/${event.id}`} 
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          {t('events.details')}
        </Link>
      </div>
    </motion.div>
  );
};

export default EventCard;