import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Trophy, Users, Flame, Target, Gamepad2, Map, TrendingUp, Calendar, Twitch, MessageCircle, ExternalLink, Award, Zap, Crown, X, ArrowLeft, Home } from 'lucide-react';
import { clubs, disciplines, getClubsByDisciplineRanking, Club, Discipline } from '../data/legData';
import GuineaMap from '../components/leg/GuineaMap';
import TournamentForm from '../components/forms/TournamentForm';
import SponsorsCarousel from '../components/leg/SponsorsCarousel';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

const LEGPage: React.FC = () => {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'clubs' | 'rankings' | 'tournaments'>('clubs');
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  });
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    document.title = 'LEG - League eSport de Guinée | 8 Clubs, 5 Disciplines';
  }, []);

  useEffect(() => {
    // Date cible du tournoi - 15 février 2026 à 14h00
    const targetDate = new Date('2026-02-15T14:00:00').getTime();

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        expired: false
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Back to Home Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-lg font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-green-500/50"
      >
        <ArrowLeft className="w-5 h-5" />
        <Home className="w-5 h-5" />
        <span className="hidden sm:inline">Menu</span>
      </Link>

      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent"></div>
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random()
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [null, Math.random(), 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ y, opacity }}
      >
        {/* Video Background Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Guinea Flag Colors Accent */}
            <div className="flex justify-center items-center space-x-2 mb-6">
              <div className="w-16 h-2 bg-red-600 rounded"></div>
              <div className="w-16 h-2 bg-yellow-400 rounded"></div>
              <div className="w-16 h-2 bg-green-600 rounded"></div>
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-4 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 bg-clip-text text-transparent drop-shadow-2xl">
              LEG
            </h1>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                League eSport de Guinée
              </h2>
              <div className="flex flex-wrap justify-center gap-4 text-xl md:text-2xl font-semibold">
                <span className="flex items-center gap-2 bg-green-600/20 border border-green-500 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Trophy className="w-6 h-6" /> 8 Clubs
                </span>
                <span className="flex items-center gap-2 bg-yellow-600/20 border border-yellow-500 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Gamepad2 className="w-6 h-6" /> 5 Disciplines
                </span>
                <span className="flex items-center gap-2 bg-red-600/20 border border-red-500 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Flame className="w-6 h-6" /> 1 Nation
                </span>
              </div>
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
            >
              Rejoins la révolution : <span className="text-purple-400 font-bold">Stratégie</span>,
              <span className="text-red-400 font-bold"> FPS</span>,
              <span className="text-green-400 font-bold"> Football</span>,
              <span className="text-orange-400 font-bold"> Racing</span>,
              <span className="text-pink-400 font-bold"> Fighting</span>
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap justify-center gap-4 pt-8"
            >
              <button
                onClick={() => scrollToSection('map')}
                className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 rounded-lg font-bold text-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Plonge dans la Carte
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>

              <button
                onClick={() => scrollToSection('clubs')}
                className="group relative px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg font-bold text-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Top Clubs
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>

              <button
                onClick={() => scrollToSection('tournaments')}
                className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-bold text-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-red-500/50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Twitch className="w-5 h-5" />
                  Lives & Tournois
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <div className="w-6 h-10 border-2 border-green-400 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-1 h-3 bg-green-400 rounded-full mt-2"
              ></motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Disciplines Overview */}
      <section className="relative py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-center mb-16"
          >
            <span className="bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
              5 Disciplines de Combat
            </span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {disciplines.map((discipline, index) => (
              <motion.div
                key={discipline.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="group relative bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl p-6 cursor-pointer overflow-hidden"
                style={{ borderColor: discipline.color }}
                onClick={() => setSelectedDiscipline(discipline.id)}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${discipline.color}20, transparent)`
                  }}
                ></div>

                <div className="relative z-10 text-center space-y-4">
                  <div className="text-6xl mb-4">{discipline.icon}</div>
                  <h3 className="text-2xl font-bold" style={{ color: discipline.color }}>
                    {discipline.name}
                  </h3>
                  <div className="space-y-2">
                    {discipline.games.map((game, i) => (
                      <div key={i} className="text-sm text-gray-400 bg-black/30 rounded px-2 py-1">
                        {game}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                  {clubs.length}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section id="map" className="relative py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-center mb-16"
          >
            <span className="bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 bg-clip-text text-transparent">
              Carte Interactive de Guinée
            </span>
          </motion.h2>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-green-500 shadow-2xl shadow-green-500/20">
            <GuineaMap clubs={clubs} onClubClick={setSelectedClub} />
          </div>
        </div>
      </section>

      {/* Clubs Section */}
      <section id="clubs" className="relative py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-center mb-16"
          >
            <span className="bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">
              Les 8 Clubs Légendaires
            </span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clubs.map((club, index) => (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -10, rotateY: 5 }}
                className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border-2 cursor-pointer"
                style={{ borderColor: club.color }}
                onClick={() => setSelectedClub(club)}
              >
                {/* Rank Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-2 border-yellow-300 shadow-lg">
                    <span className="text-black font-black text-lg">#{club.stats.rank}</span>
                  </div>
                </div>

                <div className="relative h-48 overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, ${club.color}, transparent)`
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-8xl opacity-20 group-hover:scale-110 transition-transform">
                      {disciplines.find(d => d.id === Object.keys(club.disciplines)[0])?.icon || '🏆'}
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-black text-white mb-1 drop-shadow-lg">
                      {club.name}
                    </h3>
                    <p className="text-sm text-gray-300 flex items-center gap-1">
                      <Map className="w-4 h-4" />
                      {club.city}, {club.region}
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Leader Info */}
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Représentant Fédéral</p>
                    <p className="text-sm font-bold" style={{ color: club.color }}>
                      {club.leader.name}
                    </p>
                    <p className="text-xs text-gray-500 italic mt-1">
                      "{club.leader.quote}"
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-black/30 rounded p-2">
                      <Trophy className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                      <p className="text-lg font-bold">{club.stats.trophies}</p>
                      <p className="text-xs text-gray-400">Trophées</p>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-400" />
                      <p className="text-lg font-bold">{club.stats.winRate}%</p>
                      <p className="text-xs text-gray-400">Victoires</p>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <Users className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                      <p className="text-lg font-bold">{(club.stats.streamViewers / 1000).toFixed(1)}K</p>
                      <p className="text-xs text-gray-400">Viewers</p>
                    </div>
                  </div>

                  {/* Disciplines Icons */}
                  <div className="flex justify-center gap-2">
                    {disciplines.map(disc => (
                      <div
                        key={disc.id}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2"
                        style={{
                          borderColor: disc.color,
                          backgroundColor: `${disc.color}20`
                        }}
                        title={disc.name}
                      >
                        {disc.icon}
                      </div>
                    ))}
                  </div>

                  <button
                    className="w-full py-3 rounded-lg font-bold text-white transform transition-all hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${club.color}, ${club.color}cc)`
                    }}
                  >
                    Voir le Profil <ExternalLink className="w-4 h-4 inline ml-2" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rankings Section */}
      <section id="rankings" className="relative py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-center mb-16"
          >
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Classements Live
            </span>
          </motion.h2>

          {/* Discipline Tabs */}
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            <button
              onClick={() => setSelectedDiscipline('all')}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                selectedDiscipline === 'all'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Crown className="w-5 h-5 inline mr-2" />
              Général
            </button>
            {disciplines.map(disc => (
              <button
                key={disc.id}
                onClick={() => setSelectedDiscipline(disc.id)}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  selectedDiscipline === disc.id
                    ? `text-white shadow-lg`
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
                style={
                  selectedDiscipline === disc.id
                    ? {
                        background: `linear-gradient(135deg, ${disc.color}, ${disc.color}cc)`,
                        boxShadow: `0 10px 25px ${disc.color}50`
                      }
                    : {}
                }
              >
                <span className="text-lg mr-2">{disc.icon}</span>
                {disc.name}
              </button>
            ))}
          </div>

          {/* Rankings Table */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-gray-700 shadow-2xl overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-400 font-bold">Rang</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-bold">Club</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-bold">Région</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-bold">Trophées</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-bold">Win Rate</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-bold">Viewers</th>
                </tr>
              </thead>
              <tbody>
                {(selectedDiscipline === 'all'
                  ? clubs.sort((a, b) => a.stats.rank - b.stats.rank)
                  : getClubsByDisciplineRanking(selectedDiscipline)
                ).map((item, index) => {
                  const club = 'club' in item ? item.club : item;
                  const stats = 'stats' in item && item.stats ? item.stats : club.stats;

                  return (
                    <motion.tr
                      key={club.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedClub(club)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {index < 3 ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                              index === 0 ? 'bg-yellow-400 text-black' :
                              index === 1 ? 'bg-gray-400 text-black' :
                              'bg-orange-600 text-white'
                            }`}>
                              {index + 1}
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-gray-400">
                              {index + 1}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: club.color }}
                          ></div>
                          <div>
                            <p className="font-bold text-white">{club.name}</p>
                            <p className="text-xs text-gray-400">{club.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">{club.region}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-yellow-400 font-bold">
                          <Trophy className="w-4 h-4" />
                          {club.stats.trophies}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-green-600"
                              style={{ width: `${stats.winRate || club.stats.winRate}%` }}
                            ></div>
                          </div>
                          <span className="text-green-400 font-bold">
                            {stats.winRate || club.stats.winRate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-blue-400 font-bold">
                        {(club.stats.streamViewers / 1000).toFixed(1)}K
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Tournaments Section */}
      <section id="tournaments" className="relative py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-center mb-16"
          >
            <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Tournois & Lives
            </span>
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Next Tournament */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-red-900/30 to-pink-900/30 border-2 border-red-500 rounded-2xl p-8 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-8 h-8 text-red-400" />
                <h3 className="text-3xl font-black text-white">Prochain Tournoi</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-black/50 rounded-lg p-6 text-center">
                  {timeRemaining.expired ? (
                    <div>
                      <p className="text-2xl font-bold text-red-400 mb-2">Tournoi Terminé</p>
                      <p className="text-sm text-gray-400">Consultez les résultats prochainement</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-400 mb-2">Démarre dans</p>
                      <div className="flex justify-center gap-4">
                        <div>
                          <p className="text-4xl font-black text-red-400">
                            {String(timeRemaining.days).padStart(2, '0')}
                          </p>
                          <p className="text-xs text-gray-400">JOURS</p>
                        </div>
                        <div className="text-4xl text-gray-600">:</div>
                        <div>
                          <p className="text-4xl font-black text-red-400">
                            {String(timeRemaining.hours).padStart(2, '0')}
                          </p>
                          <p className="text-xs text-gray-400">HEURES</p>
                        </div>
                        <div className="text-4xl text-gray-600">:</div>
                        <div>
                          <p className="text-4xl font-black text-red-400">
                            {String(timeRemaining.minutes).padStart(2, '0')}
                          </p>
                          <p className="text-xs text-gray-400">MINUTES</p>
                        </div>
                        <div className="text-4xl text-gray-600">:</div>
                        <div>
                          <p className="text-4xl font-black text-red-400">
                            {String(timeRemaining.seconds).padStart(2, '0')}
                          </p>
                          <p className="text-xs text-gray-400">SECONDES</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-400">Discipline</span>
                    <span className="font-bold text-white">CS:GO - National Cup</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-400">Format</span>
                    <span className="font-bold text-white">8 Équipes - Single Elimination</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-400">Prize Pool</span>
                    <span className="font-bold text-yellow-400">5,000,000 GNF</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowTournamentModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg font-bold text-white transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-red-500/50"
                >
                  <Award className="w-5 h-5 inline mr-2" />
                  S'inscrire Maintenant
                </button>
              </div>
            </motion.div>

            {/* Live Streams */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-2 border-purple-500 rounded-2xl p-8 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <Twitch className="w-8 h-8 text-purple-400" />
                <h3 className="text-3xl font-black text-white">Lives en Cours</h3>
                <span className="ml-auto flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  LIVE
                </span>
              </div>

              <div className="space-y-4">
                {clubs.slice(0, 4).map((club, index) => (
                  <div key={club.id} className="bg-black/50 rounded-lg p-4 hover:bg-black/70 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl">
                        {disciplines[index % disciplines.length].icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">{club.name}</h4>
                        <p className="text-sm text-gray-400">{disciplines[index % disciplines.length].name} - Match amical</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-red-400 font-bold">
                            {Math.floor(Math.random() * 5000 + 1000)} viewers
                          </span>
                        </div>
                      </div>
                      <Link
                        to="/direct"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-colors flex items-center justify-center"
                      >
                        <Twitch className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/direct"
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-bold text-white transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center"
              >
                <Twitch className="w-5 h-5 inline mr-2" />
                Voir Tous les Streams
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="relative py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black mb-8"
          >
            <span className="bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
              Rejoins la Communauté
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
          >
            Plus de 50,000 gamers guinéens unis. Trouve ton club, participe aux tournois, et écris l'histoire de l'eSport en Guinée.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <button className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-bold text-lg transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50">
              <MessageCircle className="w-5 h-5 inline mr-2" />
              Rejoindre Discord
            </button>
            <button className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-bold text-lg transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50">
              <Users className="w-5 h-5 inline mr-2" />
              Trouver Mon Club
            </button>
            <button className="group px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg font-bold text-lg transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-red-500/50">
              <Zap className="w-5 h-5 inline mr-2" />
              Newsletter
            </button>
          </motion.div>
        </div>
      </section>

      {/* Tournament Registration Modal */}
      {showTournamentModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowTournamentModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-500 rounded-2xl p-8 max-w-2xl w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-4xl font-black text-white mb-2">Inscription au Tournoi</h3>
                <p className="text-gray-400">CS:GO - National Cup</p>
              </div>
              <button
                onClick={() => setShowTournamentModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <TournamentForm />
          </motion.div>
        </motion.div>
      )}

      {/* Club Modal */}
      {selectedClub && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedClub(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="bg-gradient-to-br from-gray-900 to-black border-2 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            style={{ borderColor: selectedClub.color }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-4xl font-black text-white mb-2">{selectedClub.name}</h3>
                <p className="text-gray-400">{selectedClub.city}, {selectedClub.region}</p>
              </div>
              <button
                onClick={() => setSelectedClub(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Leader Section */}
            <div className="bg-black/50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-400 mb-2">Représentant Fédéral</p>
              <p className="text-xl font-bold mb-2" style={{ color: selectedClub.color }}>
                {selectedClub.leader.name}
              </p>
              <p className="text-gray-300 italic">"{selectedClub.leader.quote}"</p>
            </div>

            {/* Disciplines Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {disciplines.map(disc => {
                const discData = selectedClub.disciplines[disc.id];
                if (!discData) return null;

                return (
                  <div
                    key={disc.id}
                    className="bg-black/30 rounded-lg p-4 border-2"
                    style={{ borderColor: disc.color }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{disc.icon}</span>
                      <h4 className="text-xl font-bold" style={{ color: disc.color }}>
                        {disc.name}
                      </h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-400 mb-1">Roster:</p>
                        <div className="flex flex-wrap gap-1">
                          {discData.roster.map((player, i) => (
                            <span key={i} className="bg-gray-800 px-2 py-1 rounded text-xs">
                              {player}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Achievements:</p>
                        {discData.achievements.map((achievement, i) => (
                          <p key={i} className="text-xs text-green-400">• {achievement}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Socials */}
            <div className="flex gap-4">
              {selectedClub.socials.discord && (
                <a
                  href={selectedClub.socials.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold text-center transition-colors"
                >
                  <MessageCircle className="w-5 h-5 inline mr-2" />
                  Discord
                </a>
              )}
              {selectedClub.socials.twitch && (
                <a
                  href={selectedClub.socials.twitch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-center transition-colors"
                >
                  <Twitch className="w-5 h-5 inline mr-2" />
                  Twitch
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Sponsors Carousel */}
      <SponsorsCarousel />

      {/* Footer */}
      <footer className="relative py-12 bg-black border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center gap-8">
            <div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                LEG
              </h3>
              <p className="text-gray-400">League eSport de Guinée</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-2 bg-red-600 rounded"></div>
              <div className="w-12 h-2 bg-yellow-400 rounded"></div>
              <div className="w-12 h-2 bg-green-600 rounded"></div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>© 2026 FEGESPORT - Tous droits réservés | Propulsé par la passion du gaming guinéen</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LEGPage;
