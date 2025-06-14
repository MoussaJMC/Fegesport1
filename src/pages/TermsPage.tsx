import React from 'react';
import { useTranslation } from 'react-i18next';

const TermsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-20">
      <section className="bg-primary-700 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Conditions d'Utilisation</h1>
            <p className="text-xl">
              Veuillez lire attentivement ces conditions d'utilisation avant d'utiliser nos services.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2>1. Acceptation des Conditions</h2>
            <p>
              En accédant et en utilisant le site web de la FEGESPORT, vous acceptez d'être lié par ces conditions d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site.
            </p>

            <h2>2. Description des Services</h2>
            <p>
              La FEGESPORT fournit une plateforme en ligne permettant aux utilisateurs d'accéder à des informations sur l'esport 
              en Guinée, de s'inscrire à des événements, et de participer à la communauté esport guinéenne.
            </p>

            <h2>3. Inscription et Compte Utilisateur</h2>
            <p>
              Pour accéder à certaines fonctionnalités du site, vous devrez créer un compte. Vous êtes responsable de maintenir 
              la confidentialité de vos informations de connexion et de toutes les activités qui se produisent sous votre compte.
            </p>

            <h2>4. Règles de Conduite</h2>
            <p>
              En utilisant notre site, vous acceptez de :
            </p>
            <ul>
              <li>Ne pas violer les lois applicables</li>
              <li>Respecter les droits des autres utilisateurs</li>
              <li>Ne pas publier de contenu offensant ou inapproprié</li>
              <li>Ne pas perturber le fonctionnement normal du site</li>
            </ul>

            <h2>5. Propriété Intellectuelle</h2>
            <p>
              Tout le contenu présent sur le site de la FEGUIESPORT est protégé par les droits d'auteur et autres lois sur 
              la propriété intellectuelle. Vous ne pouvez pas utiliser ce contenu sans autorisation explicite.
            </p>

            <h2>6. Limitation de Responsabilité</h2>
            <p>
              La FEGUIESPORT ne peut être tenue responsable des dommages directs ou indirects résultant de l'utilisation 
              ou de l'impossibilité d'utiliser nos services.
            </p>

            <h2>7. Modifications des Conditions</h2>
            <p>
              Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entrent en vigueur 
              dès leur publication sur le site.
            </p>

            <h2>8. Contact</h2>
            <p>
              Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter à l'adresse suivante : 
              contact@feguiesport.org
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;