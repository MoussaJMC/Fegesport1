import React from 'react';
import { SEO } from '../components/seo';

const TermsPage: React.FC = () => {
  return (
    <div className="bg-dark-950 text-light-100 min-h-screen">
      <SEO
        title="Conditions d'Utilisation"
        description="Conditions d'utilisation et regles d'usage du site et des services de la Federation Guineenne d'Esport (FEGESPORT)."
        keywords="conditions utilisation FEGESPORT, mentions legales esport Guinee, reglement utilisation federation"
        breadcrumbs={[{ name: "Conditions d'Utilisation", url: '/terms' }]}
      />

      {/* Hero — federation dark theme */}
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
            <p className="text-lg md:text-xl text-light-300 leading-relaxed">
              Veuillez lire attentivement ces conditions d'utilisation avant d'utiliser nos services.
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
          <h2>1. Acceptation des Conditions</h2>
          <p>
            En accedant et en utilisant le site web de la FEGESPORT, vous acceptez d'etre lie par ces conditions
            d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site.
          </p>

          <h2>2. Description des Services</h2>
          <p>
            La FEGESPORT fournit une plateforme en ligne permettant aux utilisateurs d'acceder a des informations sur
            l'esport en Guinee, de s'inscrire a des evenements, et de participer a la communaute esport guineenne.
          </p>

          <h2>3. Inscription et Compte Utilisateur</h2>
          <p>
            Pour acceder a certaines fonctionnalites du site, vous devrez creer un compte. Vous etes responsable de
            maintenir la confidentialite de vos informations de connexion et de toutes les activites qui se produisent
            sous votre compte.
          </p>

          <h2>4. Regles de Conduite</h2>
          <p>En utilisant notre site, vous acceptez de :</p>
          <ul>
            <li>Ne pas violer les lois applicables</li>
            <li>Respecter les droits des autres utilisateurs</li>
            <li>Ne pas publier de contenu offensant ou inapproprie</li>
            <li>Ne pas perturber le fonctionnement normal du site</li>
          </ul>

          <h2>5. Propriete Intellectuelle</h2>
          <p>
            Tout le contenu present sur le site de la FEGESPORT est protege par les droits d'auteur et autres lois sur
            la propriete intellectuelle. Vous ne pouvez pas utiliser ce contenu sans autorisation explicite.
          </p>

          <h2>6. Limitation de Responsabilite</h2>
          <p>
            La FEGESPORT ne peut etre tenue responsable des dommages directs ou indirects resultant de l'utilisation ou
            de l'impossibilite d'utiliser nos services.
          </p>

          <h2>7. Modifications des Conditions</h2>
          <p>
            Nous nous reservons le droit de modifier ces conditions a tout moment. Les modifications entrent en vigueur
            des leur publication sur le site.
          </p>

          <h2>8. Contact</h2>
          <p>
            Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter a l'adresse suivante :{' '}
            <a href="mailto:contact@fegesport.org">contact@fegesport.org</a>
          </p>
        </article>
      </section>
    </div>
  );
};

export default TermsPage;
