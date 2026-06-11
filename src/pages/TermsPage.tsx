import React from 'react';
import { SEO } from '../components/seo';

/**
 * /terms — Conditions d'utilisation.
 *
 * Design dark premium identique a /privacy :
 * - Fond general bg-dark-950
 * - Hero gradient avec accents fed-gold / fed-red
 * - Conteneur contenu : bg-dark-900/80 + border-dark-700 + rounded-2xl + shadow-xl
 * - Toutes les classes appliquees DIRECTEMENT sur chaque element (pas de selecteur arbitraire).
 */

const H2_CLASS =
  'text-light-100 font-bold text-2xl md:text-3xl mt-10 mb-4 tracking-tight first:mt-0';
const P_CLASS = 'text-light-200 leading-relaxed';
const UL_CLASS = 'list-disc list-outside ml-6 space-y-1.5 text-light-300';
const LI_CLASS = 'leading-relaxed';
const A_CLASS =
  'text-fed-gold-500 underline underline-offset-2 hover:text-fed-gold-400 transition-colors';

const TermsPage: React.FC = () => {
  return (
    <div className="bg-dark-950 text-light-100 min-h-screen">
      <SEO
        title="Conditions d'Utilisation"
        description="Conditions d'utilisation et regles d'usage du site et des services de la Federation Guineenne d'Esport (FEGESPORT)."
        keywords="conditions utilisation FEGESPORT, mentions legales esport Guinee, reglement utilisation federation"
        breadcrumbs={[{ name: "Conditions d'Utilisation", url: '/terms' }]}
      />

      {/* ================= Hero ================= */}
      <section className="relative bg-gradient-to-b from-dark-900 via-dark-950 to-dark-950 border-b border-dark-800 overflow-hidden pt-28 pb-16 md:pt-32 md:pb-20">
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-fed-gold-500/[0.06] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-fed-red-500/[0.06] blur-3xl"
        />
        <div className="relative container-custom">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-fed-gold-500/30 bg-fed-gold-500/5 mb-5 text-xs uppercase tracking-widest font-semibold text-fed-gold-500">
              Document legal
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-light-100 leading-tight tracking-tight mb-4">
              Conditions d'Utilisation
            </h1>
            <p className="text-lg md:text-xl text-light-200 leading-relaxed">
              Veuillez lire attentivement ces conditions d'utilisation avant d'utiliser nos services.
            </p>
          </div>
        </div>
      </section>

      {/* ================= Content (premium dark card) ================= */}
      <section className="bg-dark-950 py-14 md:py-20">
        <div className="container-custom max-w-4xl">
          <article className="bg-dark-900/80 border border-dark-700 rounded-2xl shadow-xl shadow-black/40 p-6 sm:p-8 md:p-12 space-y-5">
            <h2 className={H2_CLASS}>1. Acceptation des Conditions</h2>
            <p className={P_CLASS}>
              En accedant et en utilisant le site web de la FEGESPORT, vous acceptez d'etre lie par ces conditions
              d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site.
            </p>

            <h2 className={H2_CLASS}>2. Description des Services</h2>
            <p className={P_CLASS}>
              La FEGESPORT fournit une plateforme en ligne permettant aux utilisateurs d'acceder a des informations sur
              l'esport en Guinee, de s'inscrire a des evenements, et de participer a la communaute esport guineenne.
            </p>

            <h2 className={H2_CLASS}>3. Inscription et Compte Utilisateur</h2>
            <p className={P_CLASS}>
              Pour acceder a certaines fonctionnalites du site, vous devrez creer un compte. Vous etes responsable de
              maintenir la confidentialite de vos informations de connexion et de toutes les activites qui se produisent
              sous votre compte.
            </p>

            <h2 className={H2_CLASS}>4. Regles de Conduite</h2>
            <p className={P_CLASS}>En utilisant notre site, vous acceptez de :</p>
            <ul className={UL_CLASS}>
              <li className={LI_CLASS}>Ne pas violer les lois applicables</li>
              <li className={LI_CLASS}>Respecter les droits des autres utilisateurs</li>
              <li className={LI_CLASS}>Ne pas publier de contenu offensant ou inapproprie</li>
              <li className={LI_CLASS}>Ne pas perturber le fonctionnement normal du site</li>
            </ul>

            <h2 className={H2_CLASS}>5. Propriete Intellectuelle</h2>
            <p className={P_CLASS}>
              Tout le contenu present sur le site de la FEGESPORT est protege par les droits d'auteur et autres lois
              sur la propriete intellectuelle. Vous ne pouvez pas utiliser ce contenu sans autorisation explicite.
            </p>

            <h2 className={H2_CLASS}>6. Limitation de Responsabilite</h2>
            <p className={P_CLASS}>
              La FEGESPORT ne peut etre tenue responsable des dommages directs ou indirects resultant de l'utilisation
              ou de l'impossibilite d'utiliser nos services.
            </p>

            <h2 className={H2_CLASS}>7. Modifications des Conditions</h2>
            <p className={P_CLASS}>
              Nous nous reservons le droit de modifier ces conditions a tout moment. Les modifications entrent en
              vigueur des leur publication sur le site.
            </p>

            <h2 className={H2_CLASS}>8. Contact</h2>
            <p className={P_CLASS}>
              Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter a l'adresse
              suivante :{' '}
              <a className={A_CLASS} href="mailto:contact@fegesport.org">
                contact@fegesport.org
              </a>
            </p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;
