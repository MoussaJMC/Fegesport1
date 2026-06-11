import React from 'react';
import { SEO } from '../components/seo';

const PrivacyPage: React.FC = () => {
  return (
    <div className="bg-dark-950 text-light-100 min-h-screen">
      <SEO
        title="Politique de Confidentialite"
        description="Politique de confidentialite et protection des donnees personnelles de la Federation Guineenne d'Esport (FEGESPORT). RGPD et droits des utilisateurs."
        keywords="politique confidentialite FEGESPORT, RGPD esport Guinee, donnees personnelles federation, vie privee FEGESPORT"
        breadcrumbs={[{ name: 'Politique de Confidentialite', url: '/privacy' }]}
      />

      {/* Hero — federation dark theme */}
      <section className="relative bg-gradient-to-b from-dark-900 via-dark-950 to-dark-950 border-b border-dark-800 overflow-hidden pt-28 pb-16 md:pt-32 md:pb-20">
        {/* subtle gold/red glow accents */}
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
            <p className="text-lg md:text-xl text-light-300 leading-relaxed">
              Protection de vos donnees personnelles et respect de votre vie privee.
            </p>
          </div>
        </div>
      </section>

      {/* Content — dark prose */}
      <section className="container-custom max-w-4xl py-14 md:py-20">
        <article
          className="
            text-light-200 leading-relaxed text-[16px] md:text-[17px] space-y-5
            [&_h2]:text-light-100 [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:tracking-tight
            [&_h2:first-child]:mt-0
            [&_h3]:text-light-100 [&_h3]:font-semibold [&_h3]:text-xl [&_h3]:mt-8 [&_h3]:mb-3
            [&_p]:text-light-300 [&_p]:leading-relaxed
            [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-1.5 [&_ul]:text-light-300
            [&_li]:leading-relaxed
            [&_a]:text-fed-gold-500 [&_a]:underline [&_a:hover]:text-fed-gold-400
            [&_strong]:text-light-100
          "
        >
          <h2>1. Collecte des Donnees</h2>
          <p>La FEGESPORT collecte les donnees personnelles suivantes :</p>
          <ul>
            <li>Nom et prenom</li>
            <li>Adresse email</li>
            <li>Numero de telephone</li>
            <li>Date de naissance</li>
            <li>Adresse postale</li>
            <li>Informations de paiement (traitees de maniere securisee par nos prestataires de paiement)</li>
          </ul>

          <h2>2. Utilisation des Donnees</h2>
          <p>Nous utilisons vos donnees personnelles pour :</p>
          <ul>
            <li>Gerer votre compte et votre adhesion</li>
            <li>Vous permettre de participer aux evenements</li>
            <li>Vous envoyer des informations importantes</li>
            <li>Ameliorer nos services</li>
            <li>Respecter nos obligations legales</li>
          </ul>

          <h2>3. Protection des Donnees</h2>
          <p>
            Nous mettons en oeuvre des mesures de securite appropriees pour proteger vos donnees personnelles contre
            tout acces non autorise, modification, divulgation ou destruction.
          </p>

          <h2>4. Partage des Donnees</h2>
          <p>Nous ne partageons vos donnees personnelles qu'avec :</p>
          <ul>
            <li>Nos prestataires de services (hebergement, paiement)</li>
            <li>Les autorites competentes lorsque la loi l'exige</li>
            <li>Les partenaires avec votre consentement explicite</li>
          </ul>

          <h2>5. Vos Droits</h2>
          <p>Conformement a la reglementation en vigueur, vous disposez des droits suivants :</p>
          <ul>
            <li>Droit d'acces a vos donnees</li>
            <li>Droit de rectification</li>
            <li>Droit a l'effacement</li>
            <li>Droit a la limitation du traitement</li>
            <li>Droit a la portabilite des donnees</li>
            <li>Droit d'opposition</li>
          </ul>

          <h2>6. Cookies</h2>
          <p>
            Notre site utilise des cookies pour ameliorer votre experience de navigation. Vous pouvez configurer votre
            navigateur pour refuser les cookies, mais certaines fonctionnalites pourraient ne pas fonctionner correctement.
          </p>

          <h2>7. Modifications</h2>
          <p>
            Nous nous reservons le droit de modifier cette politique de confidentialite a tout moment. Les modifications
            entrent en vigueur des leur publication sur le site.
          </p>

          <h2>8. Contact</h2>
          <p>
            Pour toute question concernant notre politique de confidentialite ou pour exercer vos droits, veuillez nous
            contacter a l'adresse suivante : <a href="mailto:privacy@fegesport.org">privacy@fegesport.org</a>
          </p>
        </article>
      </section>
    </div>
  );
};

export default PrivacyPage;
