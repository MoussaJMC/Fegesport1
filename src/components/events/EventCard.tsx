import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { EventItem } from '../../types/events';
import { useTranslation } from 'react-i18next';

interface EventCardProps {
  event: EventItem;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { t } = useTranslation();
  
  return (
    <motion.div 
      className="card flex overflow-hidden"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <div className="w-1/3 relative">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover"
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
      <div className="w-2/3 p-5">
        <div className="text-sm text-gray-500 mb-1 flex items-center">
          <Calendar size={14} className="mr-1" />
          <time dateTime={event.date}>{event.formattedDate}</time>
        </div>
        <h3 className="text-lg font-bold mb-2">
          <Link to={`/events/${event.id}`} className="hover:text-primary-600 transition-colors">
            {event.title}
          </Link>
        </h3>
        <div className="flex flex-col space-y-1 mb-3">
          {event.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin size={14} className="mr-1 text-gray-400" />
              <span>{event.location}</span>
            </div>
          )}
          {event.time && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock size={14} className="mr-1 text-gray-400" />
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