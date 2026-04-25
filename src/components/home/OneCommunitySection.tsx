import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Users, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const OneCommunitySection: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const lang = currentLanguage;

  return (
    <section className="relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1600")',
          }}
        />
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/95 to-dark-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 to-transparent" />
        {/* Color accent */}
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-fed-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-fed-gold-500/8 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* LEFT: Big emotional title */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Decorative element */}
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-fed-gold-500" />
              <span className="overline mb-0">
                {lang === 'fr' ? 'NOTRE COMMUNAUTE' : 'OUR COMMUNITY'}
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white font-heading leading-[1.1] mb-6">
              {lang === 'fr' ? (
                <>
                  Une seule <span className="text-gradient-gold">passion</span>,
                  <br />
                  un esport guineen <span className="text-fed-red-500">uni</span>.
                </>
              ) : (
                <>
                  One <span className="text-gradient-gold">passion</span>,
                  <br />
                  a united Guinean <span className="text-fed-red-500">esports</span>.
                </>
              )}
            </h2>

            <p className="text-lg md:text-xl text-light-300 mb-8 max-w-xl leading-relaxed">
              {lang === 'fr'
                ? 'La FEGESPORT rassemble joueurs, clubs, partenaires et institutions autour d\'une vision commune : faire briller l\'esport guineen sur la scene africaine et mondiale.'
                : 'FEGESPORT unites players, clubs, partners and institutions around a common vision: shining a spotlight on Guinean esports across Africa and the world.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/membership" className="btn btn-primary px-7 py-3.5 shadow-lg shadow-fed-red-500/20 inline-flex items-center justify-center gap-2">
                {lang === 'fr' ? 'Rejoindre la communaute' : 'Join the community'}
                <ArrowRight size={16} />
              </Link>
              <Link to="/about" className="btn btn-secondary px-7 py-3.5 inline-flex items-center justify-center gap-2">
                {lang === 'fr' ? 'Decouvrir' : 'Discover'}
              </Link>
            </div>
          </motion.div>

          {/* RIGHT: Quote card + decorative elements */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main quote card */}
            <div className="bg-dark-800/80 backdrop-blur-md border border-dark-700 rounded-3xl p-8 md:p-10 relative overflow-hidden">
              {/* Top-left decoration */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-fed-red-500 via-fed-gold-500 to-fed-red-500" />

              {/* Big quote mark */}
              <div className="text-7xl text-fed-gold-500/20 font-serif leading-none mb-2">"</div>

              <blockquote className="text-xl md:text-2xl font-medium text-white leading-relaxed mb-6 font-heading">
                {lang === 'fr'
                  ? 'Structurer, developper et representer l\'esport guineen avec excellence et integrite.'
                  : 'Structuring, developing and representing Guinean esports with excellence and integrity.'}
              </blockquote>

              {/* Author signature */}
              <div className="flex items-center gap-3 pt-4 border-t border-dark-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fed-red-500 to-fed-red-700 flex items-center justify-center">
                  <Heart size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">FEGESPORT</div>
                  <div className="text-xs text-light-400">
                    {lang === 'fr' ? 'Mission officielle' : 'Official mission'}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating accent card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="absolute -bottom-6 -right-4 md:-right-6 bg-fed-gold-500 text-dark-950 rounded-2xl p-4 shadow-2xl shadow-fed-gold-500/30 max-w-[200px]"
            >
              <div className="flex items-center gap-2 mb-1">
                <Users size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {lang === 'fr' ? 'Reconnaissance' : 'Recognition'}
                </span>
              </div>
              <div className="text-sm font-bold leading-tight">
                {lang === 'fr'
                  ? 'Federation officielle agreee'
                  : 'Officially recognized federation'}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fed-gold-500/30 to-transparent" />
    </section>
  );
};

export default OneCommunitySection;
