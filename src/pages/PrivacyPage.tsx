import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-20">
      <section className="bg-primary-700 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Politique de Confidentialité</h1>
            <p className="text-xl">
              Protection de vos données personnelles et respect de votre vie privée.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2>1. Collecte des Données</h2>
            <p>
              La FEGUIESPORT collecte les données personnelles suivantes :
            </p>
            <ul>
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Date de naissance</li>
              <li>Adresse postale</li>
              <li>Informations de paiement (traitées de manière sécurisée par nos prestataires de paiement)</li>
            </ul>

            <h2>2. Utilisation des Données</h2>
            <p>
              Nous utilisons vos données personnelles pour :
            </p>
            <ul>
              <li>Gérer votre compte et votre adhésion</li>
              <li>Vous permettre de participer aux événements</li>
              <li>Vous envoyer des informations importantes</li>
              <li>Améliorer nos services</li>
              <li>Respecter nos obligations légales</li>
            </ul>

            <h2>3. Protection des Données</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre 
              tout accès non autorisé, modification, divulgation ou destruction.
            </p>

            <h2>4. Partage des Données</h2>
            <p>
              Nous ne partageons vos données personnelles qu'avec :
            </p>
            <ul>
              <li>Nos prestataires de services (hébergement, paiement)</li>
              <li>Les autorités compétentes lorsque la loi l'exige</li>
              <li>Les partenaires avec votre consentement explicite</li>
            </ul>

            <h2>5. Vos Droits</h2>
            <p>
              Conformément à la réglementation en vigueur, vous disposez des droits suivants :
            </p>
            <ul>
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d'opposition</li>
            </ul>

            <h2>6. Cookies</h2>
            <p>
              Notre site utilise des cookies pour améliorer votre expérience de navigation. Vous pouvez configurer 
              votre navigateur pour refuser les cookies, mais certaines fonctionnalités pourraient ne pas fonctionner correctement.
            </p>

            <h2>7. Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications 
              entrent en vigueur dès leur publication sur le site.
            </p>

            <h2>8. Contact</h2>
            <p>
              Pour toute question concernant notre politique de confidentialité ou pour exercer vos droits, 
              veuillez nous contacter à l'adresse suivante : privacy@fegesport.org
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;