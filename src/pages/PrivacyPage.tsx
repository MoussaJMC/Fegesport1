import React from 'react';
import { SEO } from '../components/seo';

/**
 * /privacy — Politique de confidentialite.
 *
 * Design dark premium :
 * - Fond general bg-dark-950
 * - Hero gradient avec accents fed-gold / fed-red
 * - Conteneur contenu : bg-dark-900/80 + border-dark-700 + rounded-2xl + shadow-xl
 * - Toutes les classes appliquees DIRECTEMENT sur chaque element (pas de selecteur arbitraire).
 */

// Reusable class fragments — keeps the JSX clean while staying explicit
const H2_CLASS =
  'text-light-100 font-bold text-2xl md:text-3xl mt-10 mb-4 tracking-tight first:mt-0';
const P_CLASS = 'text-light-200 leading-relaxed';
const UL_CLASS = 'list-disc list-outside ml-6 space-y-1.5 text-light-300';
const LI_CLASS = 'leading-relaxed';
const A_CLASS =
  'text-fed-gold-500 underline underline-offset-2 hover:text-fed-gold-400 transition-colors';

const PrivacyPage: React.FC = () => {
  return (
    <div className="bg-dark-950 text-light-100 min-h-screen">
      <SEO
        title="Politique de Confidentialite"
        description="Politique de confidentialite et protection des donnees personnelles de la Federation Guineenne d'Esport (FEGESPORT). RGPD et droits des utilisateurs."
        keywords="politique confidentialite FEGESPORT, RGPD esport Guinee, donnees personnelles federation, vie privee FEGESPORT"
        breadcrumbs={[{ name: 'Politique de Confidentialite', url: '/privacy' }]}
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
              Politique de Confidentialite
            </h1>
            <p className="text-lg md:text-xl text-light-200 leading-relaxed">
              Protection de vos donnees personnelles et respect de votre vie privee.
            </p>
          </div>
        </div>
      </section>

      {/* ================= Content (premium dark card) ================= */}
      <section className="bg-dark-950 py-14 md:py-20">
        <div className="container-custom max-w-4xl">
          <article className="bg-dark-900/80 border border-dark-700 rounded-2xl shadow-xl shadow-black/40 p-6 sm:p-8 md:p-12 space-y-5">
            <h2 className={H2_CLASS}>1. Collecte des Donnees</h2>
            <p className={P_CLASS}>La FEGESPORT collecte les donnees personnelles suivantes :</p>
            <ul className={UL_CLASS}>
              <li className={LI_CLASS}>Nom et prenom</li>
              <li className={LI_CLASS}>Adresse email</li>
              <li className={LI_CLASS}>Numero de telephone</li>
              <li className={LI_CLASS}>Date de naissance</li>
              <li className={LI_CLASS}>Adresse postale</li>
              <li className={LI_CLASS}>
                Informations de paiement (traitees de maniere securisee par nos prestataires de paiement)
              </li>
            </ul>

            <h2 className={H2_CLASS}>2. Utilisation des Donnees</h2>
            <p className={P_CLASS}>Nous utilisons vos donnees personnelles pour :</p>
            <ul className={UL_CLASS}>
              <li className={LI_CLASS}>Gerer votre compte et votre adhesion</li>
              <li className={LI_CLASS}>Vous permettre de participer aux evenements</li>
              <li className={LI_CLASS}>Vous envoyer des informations importantes</li>
              <li className={LI_CLASS}>Ameliorer nos services</li>
              <li className={LI_CLASS}>Respecter nos obligations legales</li>
            </ul>

            <h2 className={H2_CLASS}>3. Protection des Donnees</h2>
            <p className={P_CLASS}>
              Nous mettons en oeuvre des mesures de securite appropriees pour proteger vos donnees personnelles contre
              tout acces non autorise, modification, divulgation ou destruction.
            </p>

            <h2 className={H2_CLASS}>4. Partage des Donnees</h2>
            <p className={P_CLASS}>Nous ne partageons vos donnees personnelles qu'avec :</p>
            <ul className={UL_CLASS}>
              <li className={LI_CLASS}>Nos prestataires de services (hebergement, paiement)</li>
              <li className={LI_CLASS}>Les autorites competentes lorsque la loi l'exige</li>
              <li className={LI_CLASS}>Les partenaires avec votre consentement explicite</li>
            </ul>

            <h2 className={H2_CLASS}>5. Vos Droits</h2>
            <p className={P_CLASS}>
              Conformement a la reglementation en vigueur, vous disposez des droits suivants :
            </p>
            <ul className={UL_CLASS}>
              <li className={LI_CLASS}>Droit d'acces a vos donnees</li>
              <li className={LI_CLASS}>Droit de rectification</li>
              <li className={LI_CLASS}>Droit a l'effacement</li>
              <li className={LI_CLASS}>Droit a la limitation du traitement</li>
              <li className={LI_CLASS}>Droit a la portabilite des donnees</li>
              <li className={LI_CLASS}>Droit d'opposition</li>
            </ul>

            <h2 className={H2_CLASS}>6. Cookies</h2>
            <p className={P_CLASS}>
              Notre site utilise des cookies pour ameliorer votre experience de navigation. Vous pouvez configurer votre
              navigateur pour refuser les cookies, mais certaines fonctionnalites pourraient ne pas fonctionner
              correctement.
            </p>

            <h2 className={H2_CLASS}>7. Modifications</h2>
            <p className={P_CLASS}>
              Nous nous reservons le droit de modifier cette politique de confidentialite a tout moment. Les
              modifications entrent en vigueur des leur publication sur le site.
            </p>

            <h2 className={H2_CLASS}>8. Contact</h2>
            <p className={P_CLASS}>
              Pour toute question concernant notre politique de confidentialite ou pour exercer vos droits, veuillez
              nous contacter a l'adresse suivante :{' '}
              <a className={A_CLASS} href="mailto:privacy@fegesport.org">
                privacy@fegesport.org
              </a>
            </p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;
