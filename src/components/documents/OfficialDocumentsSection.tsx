import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, Lock, Loader2, FileCheck, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import SectionHeader from '../ui/SectionHeader';

interface OfficialDocument {
  id: string;
  label_fr: string;
  label_en: string | null;
  description: string | null;
  icon: string;
  lang: string;
  group_name: string | null;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  is_published: boolean;
  sort_order: number;
}

const OfficialDocumentsSection: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const lang = currentLanguage;
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('official_documents')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching documents:', error);
        setDocuments([]);
      } else {
        setDocuments(data || []);
      }
    } catch (err) {
      console.error('Error in fetchDocuments:', err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const getDocLabel = (doc: OfficialDocument): string => {
    if (lang === 'en' && doc.label_en) return doc.label_en;
    return doc.label_fr;
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getLangLabel = (docLang: string): { label: string; color: string } => {
    const upper = (docLang || '').toUpperCase();
    if (upper.includes('FR') && upper.includes('EN')) return { label: 'FR/EN', color: 'bg-fed-gold-500' };
    if (upper === 'FR') return { label: 'FR', color: 'bg-fed-red-500' };
    if (upper === 'EN') return { label: 'EN', color: 'bg-accent-blue-500' };
    return { label: upper || 'FR', color: 'bg-dark-700' };
  };

  // Sort: prefer documents matching current language
  const sortedDocs = [...documents].sort((a, b) => {
    const aMatch = (a.lang || '').toUpperCase().includes(lang.toUpperCase()) ? 0 : 1;
    const bMatch = (b.lang || '').toUpperCase().includes(lang.toUpperCase()) ? 0 : 1;
    if (aMatch !== bMatch) return aMatch - bMatch;
    return (a.sort_order || 0) - (b.sort_order || 0);
  });

  if (loading) {
    return (
      <section className="section bg-section-dark">
        <div className="container-custom">
          <SectionHeader
            overline={lang === 'fr' ? 'TRANSPARENCE' : 'TRANSPARENCY'}
            title={lang === 'fr' ? 'Documents Officiels' : 'Official Documents'}
            dividerColor="gold"
          />
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-fed-red-500" />
          </div>
        </div>
      </section>
    );
  }

  if (documents.length === 0) {
    return (
      <section className="section bg-section-dark">
        <div className="container-custom">
          <SectionHeader
            overline={lang === 'fr' ? 'TRANSPARENCE' : 'TRANSPARENCY'}
            title={lang === 'fr' ? 'Documents Officiels' : 'Official Documents'}
            dividerColor="gold"
          />
          <div className="max-w-md mx-auto card p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-fed-gold-500/10 border border-fed-gold-500/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="text-fed-gold-500" size={24} />
            </div>
            <p className="text-light-400">
              {lang === 'fr'
                ? 'Les documents officiels seront publies prochainement.'
                : 'Official documents will be published soon.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-section-dark relative overflow-hidden">
      {/* Top gold accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fed-gold-500/40 to-transparent" />

      <div className="container-custom relative z-10">
        <SectionHeader
          overline={lang === 'fr' ? 'TRANSPARENCE' : 'TRANSPARENCY'}
          title={lang === 'fr' ? 'Documents Officiels' : 'Official Documents'}
          description={
            lang === 'fr'
              ? 'Consultez et telechargez les documents officiels de la FEGESPORT : statuts, reglements, agrements et publications institutionnelles.'
              : "View and download FEGESPORT's official documents: statutes, regulations, certifications and institutional publications."
          }
          dividerColor="gold"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {sortedDocs.map((doc, index) => {
            const langBadge = getLangLabel(doc.lang);
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
                viewport={{ once: true }}
                className="card p-5 group hover:border-fed-gold-500/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Document icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-fed-red-500/10 border border-fed-red-500/20 flex items-center justify-center text-fed-red-500 group-hover:bg-fed-red-500/20 transition-colors">
                      <FileText size={22} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header with title + language badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-white font-heading leading-tight">
                        {getDocLabel(doc)}
                      </h3>
                      <span className={`inline-flex items-center gap-1 ${langBadge.color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0`}>
                        {langBadge.label === 'FR/EN' && <Globe size={10} />}
                        {langBadge.label}
                      </span>
                    </div>

                    {/* Description */}
                    {doc.description && (
                      <p className="text-light-400 text-xs leading-relaxed mb-3 line-clamp-2">
                        {doc.description}
                      </p>
                    )}

                    {/* Metadata row */}
                    <div className="flex items-center gap-3 text-xs text-light-400/70 mb-3">
                      <span className="inline-flex items-center gap-1">
                        <FileCheck size={12} className="text-fed-gold-500" />
                        {lang === 'fr' ? 'Officiel' : 'Official'}
                      </span>
                      {doc.file_size && (
                        <span>{formatFileSize(doc.file_size)}</span>
                      )}
                    </div>

                    {/* Action buttons */}
                    {doc.file_url ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-dark-700 hover:bg-fed-red-500 text-light-100 hover:text-white text-xs font-semibold transition-all"
                          title={lang === 'fr' ? 'Consulter' : 'View'}
                        >
                          <ExternalLink size={13} />
                          {lang === 'fr' ? 'Consulter' : 'View'}
                        </a>
                        <a
                          href={doc.file_url}
                          download={doc.file_name || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-fed-gold-500 hover:bg-fed-gold-600 text-dark-950 text-xs font-semibold transition-all"
                          title={lang === 'fr' ? 'Telecharger' : 'Download'}
                        >
                          <Download size={13} />
                          {lang === 'fr' ? 'Telecharger' : 'Download'}
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-light-400/50 italic">
                        {lang === 'fr' ? 'Document non disponible' : 'Document not available'}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-dark-800 border border-fed-gold-500/20 text-light-300 text-sm">
            <Lock size={14} className="text-fed-gold-500" />
            <span>
              {lang === 'fr'
                ? `${documents.length} documents officiels publies`
                : `${documents.length} official documents published`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfficialDocumentsSection;
