import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Clock, Users, AlertTriangle } from 'lucide-react';
import { upcomingEvents } from '../data/eventsData';
import EventRegistrationForm from '../components/events/EventRegistrationForm';
import { useTranslation } from 'react-i18next';

const EventPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const event = upcomingEvents.find(event => event.id === id);
  const [showRegistration, setShowRegistration] = React.useState(false);

  if (!event) {
    return (
      <div className="pt-20 min-h-screen bg-secondary-900">
        <div className="container-custom py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">{t('common.notFound')}</h1>
          <p className="text-gray-300 mb-8">{t('common.notFoundMessage')}</p>
          <Link 
            to="/" 
            className="inline-flex items-center text-primary-500 hover:text-primary-400"
          >
            <ArrowLeft size={20} className="mr-2" />
            {t('common.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  const isFull = event.maxParticipants && event.currentParticipants 
    ? event.currentParticipants >= event.maxParticipants 
    : false;

  return (
    <div className="pt-20 min-h-screen bg-secondary-900">
      {/* Hero Image */}
      <div className="relative h-[400px] w-full">
        <div className="absolute inset-0">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-secondary-900/50 to-transparent" />
        </div>
      </div>

      {/* Event Content */}
      <div className="container-custom relative -mt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-secondary-800 rounded-lg shadow-xl p-8 mb-12"
        >
          {/* Category Badge */}
          {event.category && (
            <span className="inline-block bg-primary-600 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
              {event.category}
            </span>
          )}

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-6">{event.title}</h1>

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="flex items-center text-gray-300">
              <Calendar size={20} className="mr-2 text-primary-500" />
              <div>
                <div className="font-semibold">{t('events.date')}</div>
                <div>{event.formattedDate}</div>
              </div>
            </div>

            {event.time && (
              <div className="flex items-center text-gray-300">
                <Clock size={20} className="mr-2 text-primary-500" />
                <div>
                  <div className="font-semibold">{t('events.time')}</div>
                  <div>{event.time}</div>
                </div>
              </div>
            )}

            {event.location && (
              <div className="flex items-center text-gray-300">
                <MapPin size={20} className="mr-2 text-primary-500" />
                <div>
                  <div className="font-semibold">{t('events.location')}</div>
                  <div>{event.location}</div>
                </div>
              </div>
            )}

            {event.maxParticipants && (
              <div className="flex items-center text-gray-300">
                <Users size={20} className="mr-2 text-primary-500" />
                <div>
                  <div className="font-semibold">{t('events.participants')}</div>
                  <div>
                    {event.currentParticipants || 0} / {event.maxParticipants}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-lg prose-invert max-w-none mb-8">
            <p className="text-gray-300">{event.description}</p>
          </div>

          {/* Rules */}
          {event.rules && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">{t('events.rules')}</h2>
              <div className="bg-secondary-700 rounded-lg p-6">
                <div className="flex items-start mb-4">
                  <AlertTriangle size={24} className="text-primary-500 mr-2 flex-shrink-0 mt-1" />
                  <p className="text-gray-300">
                    En vous inscrivant, vous acceptez de respecter le règlement suivant :
                  </p>
                </div>
                <div className="prose prose-invert max-w-none">
                  {event.rules.split('\n').map((rule, index) => (
                    <p key={index} className="text-gray-300">{rule}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Registration Button */}
          {!showRegistration && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowRegistration(true)}
                disabled={isFull}
                className={`btn ${
                  isFull
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                } text-white text-lg px-8 py-3`}
              >
                {isFull ? t('events.full') : t('events.register')}
              </button>
            </div>
          )}
        </motion.div>

        {/* Registration Form */}
        {showRegistration && event.prices && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-secondary-800 rounded-lg shadow-xl p-8 mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">{t('events.register')}</h2>
            <EventRegistrationForm
              eventId={event.id}
              prices={event.prices}
              onSuccess={() => setShowRegistration(false)}
            />
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center py-8 border-t border-secondary-700">
          <Link 
            to="/" 
            className="inline-flex items-center text-primary-500 hover:text-primary-400"
          >
            <ArrowLeft size={20} className="mr-2" />
            {t('common.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventPage;