import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock, Globe, CheckCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(3, 'Le sujet doit contenir au moins 3 caracteres'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caracteres'),
});

const ContactPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';
  const { getSetting } = useSiteSettings();
  const [sent, setSent] = useState(false);

  const contactInfo = getSetting('contact_info', {
    address: "Conakry, Guinee",
    postal_code: "BP 12345",
    email: "contact@fegesport224.org",
    phone: "+224 625878764",
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          status: 'unread'
        }]);

      if (error) throw error;

      toast.success(lang === 'fr' ? 'Message envoye avec succes!' : 'Message sent successfully!');
      reset();
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error(lang === 'fr' ? 'Erreur lors de l\'envoi. Reessayez.' : 'Error sending. Please try again.');
    }
  };

  const contactItems = [
    {
      icon: <MapPin size={22} />,
      title: lang === 'fr' ? 'Adresse' : 'Address',
      content: (
        <>
          {lang === 'fr' ? 'Siege FEGESPORT' : 'FEGESPORT Headquarters'}<br />
          {contactInfo.address}<br />
          {contactInfo.postal_code}
        </>
      ),
    },
    {
      icon: <Mail size={22} />,
      title: 'Email',
      content: (
        <a href={`mailto:${contactInfo.email}`} className="text-fed-gold-500 hover:text-fed-gold-400 transition-colors break-all">
          {contactInfo.email}
        </a>
      ),
    },
    {
      icon: <Phone size={22} />,
      title: lang === 'fr' ? 'Telephone' : 'Phone',
      content: (
        <a href={`tel:${contactInfo.phone}`} className="text-fed-gold-500 hover:text-fed-gold-400 transition-colors">
          {contactInfo.phone}
        </a>
      ),
    },
    {
      icon: <Globe size={22} />,
      title: 'Web',
      content: 'fegesport224.org',
    },
  ];

  return (
    <div className="pt-20">
      {/* ============ HERO ============ */}
      <section className="relative bg-dark-950 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 -left-32 w-96 h-96 bg-fed-red-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-fed-gold-500/5 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <span className="overline block mb-4">
              {lang === 'fr' ? 'CONTACTEZ-NOUS' : 'CONTACT US'}
            </span>
            <h1 className="text-hero font-heading text-white mb-6">
              {t('contact.title')}
            </h1>
            <p className="text-lg md:text-xl text-light-300">
              {t('contact.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <section className="section bg-section-alt">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

            {/* ---- LEFT: Contact Info ---- */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-white mb-8 font-heading">
                {t('contact.info.title')}
              </h2>

              <div className="space-y-6">
                {contactItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-fed-red-500/10 border border-fed-red-500/20 flex items-center justify-center flex-shrink-0 text-fed-red-500">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
                      <div className="text-light-400 text-sm leading-relaxed">{item.content}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Horaires */}
              <div className="mt-10 pt-8 border-t border-dark-700">
                <div className="flex items-center gap-3 mb-4">
                  <Clock size={18} className="text-fed-gold-500" />
                  <h3 className="font-bold text-white font-heading">{t('contact.hours.title')}</h3>
                </div>
                <div className="space-y-2 text-sm text-light-400">
                  <div className="flex justify-between">
                    <span>{lang === 'fr' ? 'Lundi - Vendredi' : 'Monday - Friday'}</span>
                    <span className="text-light-100">8h30 - 17h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'fr' ? 'Samedi' : 'Saturday'}</span>
                    <span className="text-light-100">9h00 - 13h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'fr' ? 'Dimanche' : 'Sunday'}</span>
                    <span className="text-fed-red-400">{lang === 'fr' ? 'Ferme' : 'Closed'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ---- RIGHT: Contact Form ---- */}
            <div className="lg:col-span-3">
              <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-6 font-heading">
                  {t('contact.form.title')}
                </h2>

                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="text-emerald-500" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 font-heading">
                      {lang === 'fr' ? 'Message envoye !' : 'Message sent!'}
                    </h3>
                    <p className="text-light-400">
                      {lang === 'fr'
                        ? 'Nous reviendrons vers vous dans les meilleurs delais.'
                        : 'We will get back to you as soon as possible.'}
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Name + Email row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-light-300 mb-2">
                          {t('contact.form.name')}
                        </label>
                        <input
                          type="text"
                          id="name"
                          {...register("name")}
                          className={`w-full px-4 py-3 rounded-xl bg-dark-900 border ${
                            errors.name ? 'border-fed-red-500/50' : 'border-dark-700'
                          } text-light-100 placeholder-light-400/50 focus:outline-none focus:border-fed-red-500 focus:ring-1 focus:ring-fed-red-500/30 transition-all`}
                          placeholder={lang === 'fr' ? 'Votre nom complet' : 'Your full name'}
                        />
                        {errors.name && (
                          <p className="mt-1.5 text-sm text-fed-red-400">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-light-300 mb-2">
                          {t('contact.form.email')}
                        </label>
                        <input
                          type="email"
                          id="email"
                          {...register("email")}
                          className={`w-full px-4 py-3 rounded-xl bg-dark-900 border ${
                            errors.email ? 'border-fed-red-500/50' : 'border-dark-700'
                          } text-light-100 placeholder-light-400/50 focus:outline-none focus:border-fed-red-500 focus:ring-1 focus:ring-fed-red-500/30 transition-all`}
                          placeholder="email@exemple.com"
                        />
                        {errors.email && (
                          <p className="mt-1.5 text-sm text-fed-red-400">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-light-300 mb-2">
                        {t('contact.form.subject')}
                      </label>
                      <input
                        type="text"
                        id="subject"
                        {...register("subject")}
                        className={`w-full px-4 py-3 rounded-xl bg-dark-900 border ${
                          errors.subject ? 'border-fed-red-500/50' : 'border-dark-700'
                        } text-light-100 placeholder-light-400/50 focus:outline-none focus:border-fed-red-500 focus:ring-1 focus:ring-fed-red-500/30 transition-all`}
                        placeholder={lang === 'fr' ? 'Sujet de votre message' : 'Subject of your message'}
                      />
                      {errors.subject && (
                        <p className="mt-1.5 text-sm text-fed-red-400">{errors.subject.message}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-light-300 mb-2">
                        {t('contact.form.message')}
                      </label>
                      <textarea
                        id="message"
                        rows={6}
                        {...register("message")}
                        className={`w-full px-4 py-3 rounded-xl bg-dark-900 border ${
                          errors.message ? 'border-fed-red-500/50' : 'border-dark-700'
                        } text-light-100 placeholder-light-400/50 focus:outline-none focus:border-fed-red-500 focus:ring-1 focus:ring-fed-red-500/30 transition-all resize-none`}
                        placeholder={lang === 'fr' ? 'Ecrivez votre message ici...' : 'Write your message here...'}
                      />
                      {errors.message && (
                        <p className="mt-1.5 text-sm text-fed-red-400">{errors.message.message}</p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl font-semibold text-white bg-fed-red-500 hover:bg-fed-red-600 focus:outline-none focus:ring-2 focus:ring-fed-red-500/50 focus:ring-offset-2 focus:ring-offset-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-fed-red-500/20 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {lang === 'fr' ? 'Envoi en cours...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          {t('contact.form.send')}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MAP ============ */}
      <section className="section bg-section-dark">
        <div className="container-custom">
          <div className="text-center mb-10">
            <span className="overline block">
              {lang === 'fr' ? 'NOTRE SIEGE' : 'OUR HEADQUARTERS'}
            </span>
            <h2 className="section-title">{lang === 'fr' ? 'Nous Trouver' : 'Find Us'}</h2>
          </div>
          <div className="rounded-2xl overflow-hidden border border-dark-700 shadow-2xl shadow-dark-950/50">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62545.89841772947!2d-13.700854668459958!3d9.535214899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xf1cd6de30c66417%3A0x1e85cbe8a0e1cf2f!2sConakry%2C%20Guin%C3%A9e!5e0!3m2!1sfr!2sfr!4v1709321169447!5m2!1sfr!2sfr"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Siege FEGESPORT - Conakry, Guinee"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
