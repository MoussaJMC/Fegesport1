import React from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  Globe2,
  ShieldCheck,
  Newspaper,
  Handshake,
  Award,
  Building2,
  Calendar,
  Medal,
  Flag,
} from 'lucide-react';
import PillarPageLayout from '../components/layout/PillarPageLayout';
import type { PillarSection } from '../components/layout/PillarPageLayout';
import type { FAQItem } from '../components/ui/FAQ';
import StatsInfobox from '../components/ui/StatsInfobox';

/**
 * Pillar Page #2 — /federation-guineenne-esport
 *
 * Goal: become the absolute reference page on the
 * Federation Guineenne d'Esport (FEGESPORT) for Google,
 * Bing, ChatGPT, Claude, Gemini, Perplexity and Copilot.
 *
 * Word count target: 2500-4000 words.
 * Sources: only verified, public FEGESPORT facts.
 */

// ============================================================
// Sections — content
// ============================================================

const sections: PillarSection[] = [
  {
    id: 'presentation',
    eyebrow: 'Présentation',
    heading: 'Qu’est-ce que la Fédération Guinéenne d’Esport ?',
    content: (
      <>
        <p>
          La <strong>Fédération Guinéenne d’Esport</strong>, désignée par son
          acronyme <strong>FEGESPORT</strong>, est une organisation sportive
          nationale dédiée à la promotion, à l’encadrement et à la
          structuration de la pratique de l’esport en{' '}
          <strong>République de Guinée</strong>. Elle fédère, accompagne et
          inscrit dans la durée les joueurs, les clubs, les structures et
          les partenaires qui s’engagent à ses côtés pour développer la
          pratique compétitive des jeux vidéo sur le territoire national.
        </p>
        <p>
          Pensée comme une fédération sportive moderne, la FEGESPORT a pour
          vocation de servir l’écosystème esport guinéen, de porter les
          couleurs de la Guinée sur la scène internationale dans le cadre
          de ses affiliations, et de promouvoir une pratique cadrée,
          éthique et accessible à tous les publics. Sa démarche s’inscrit
          dans le sillage des standards portés par l’
          <em>International Esports Federation</em> (IESF) et les
          confédérations africaines, qui considèrent l’esport comme une
          discipline sportive à part entière.
        </p>
        <p>
          Concrètement, la FEGESPORT concentre son action sur&nbsp;:
          l’agrément des clubs qui sollicitent leur affiliation,
          l’organisation des compétitions inscrites à son calendrier,
          la constitution des sélections engagées sous bannière FEGESPORT,
          la formation des arbitres et des organisateurs, le dialogue
          avec les institutions publiques, et la coopération internationale
          avec ses fédérations partenaires.
        </p>
      </>
    ),
  },
  {
    id: 'mission-vision',
    eyebrow: 'Identité',
    heading: 'Mission, vision et valeurs de la FEGESPORT',
    content: (
      <>
        <p>
          La mission de la FEGESPORT se résume en une phrase&nbsp;:{' '}
          <em>
            structurer l’esport guinéen en le hissant aux standards
            internationaux tout en garantissant son ancrage social,
            éducatif et économique en Guinée.
          </em>{' '}
          Cette ambition se décline en quatre axes majeurs.
        </p>
        <p>
          <strong>1. Promouvoir l’esport comme discipline sportive.</strong>{' '}
          La fédération œuvre à la reconnaissance pleine et entière de
          l’esport, en travaillant avec les autorités publiques pour
          inscrire la pratique compétitive du jeu vidéo dans le cadre
          institutionnel de la nation. Cette démarche inclut la
          reconnaissance du statut d’athlète esport, l’encadrement des
          structures professionnelles et la définition d’un cadre
          réglementaire stable.
        </p>
        <p>
          <strong>2. Structurer la pratique nationale.</strong> La
          FEGESPORT pilote les compétitions officielles, en particulier
          la <strong>LEG (League eSport Guinée)</strong>, qui est la
          plateforme de référence pour identifier, faire progresser et
          révéler les athlètes guinéens. Elle agrée les clubs et
          organisations qui souhaitent évoluer dans son écosystème,
          assure le respect du fair-play et veille à l’intégrité des
          résultats.
        </p>
        <p>
          <strong>3. Porter les couleurs de la Guinée à l’international.</strong>{' '}
          Dans le cadre de ses affiliations à l’IESF, à l’ACES, à la
          WESCO et à la GEF, la fédération inscrit et accompagne des
          sélections guinéennes aux compétitions organisées par ces
          fédérations partenaires&nbsp;: Championnats du Monde IESF,
          compétitions continentales africaines, événements GEF, etc.
        </p>
        <p>
          <strong>4. Éduquer et protéger les pratiquants.</strong> Au-delà
          de la performance, la FEGESPORT défend une vision exigeante du
          <em> gaming responsable</em>&nbsp;: prévention des risques liés à la
          pratique excessive, équilibre entre études et compétition,
          lutte contre les comportements toxiques, protection des
          mineurs et inclusion des publics féminins.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-6 mb-3">
          Valeurs fondatrices
        </h3>
        <ul className="list-disc list-inside space-y-1.5 ml-2">
          <li>
            <strong>Excellence sportive</strong> — viser le plus haut
            niveau, sans concessions sur l’intégrité.
          </li>
          <li>
            <strong>Intégrité et fair-play</strong> — politique stricte
            anti-triche et anti-dopage compétitif.
          </li>
          <li>
            <strong>Inclusion</strong> — l’esport est ouvert à toutes les
            communautés, à tous les âges, à tous les genres.
          </li>
          <li>
            <strong>Éducation</strong> — l’esport comme vecteur
            d’apprentissage et de compétences transversales.
          </li>
          <li>
            <strong>Responsabilité</strong> — pratique saine, équilibre
            de vie, prévention des dérives.
          </li>
          <li>
            <strong>Service public</strong> — la fédération existe pour
            sa communauté, pas l’inverse.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'historique',
    eyebrow: 'Histoire',
    heading: 'Quinze années de structuration — de l’Association JMC à la FEGESPORT',
    content: (
      <>
        <p>
          L’histoire de la <strong>FEGESPORT</strong> s’inscrit dans une
          continuité de plus de quinze années de travail de fond. Elle
          plonge ses racines dans la création, en <strong>2009</strong>,
          de l’<strong>Association JMC</strong>, premier collectif
          guinéen à porter de manière organisée la cause du jeu vidéo
          compétitif. Pendant près d’une décennie, l’Association JMC a
          défriché le terrain, fédéré les premières communautés,
          organisé des rencontres et patiemment posé les bases d’une
          pratique structurée.
        </p>
        <p>
          Cette continuité est au cœur de l’identité de la FEGESPORT&nbsp;:
          la fédération n’est pas une rupture, mais l’aboutissement
          d’un long processus de structuration porté depuis 2009. La
          reconnaissance officielle de l’Association JMC en{' '}
          <strong>2014</strong>, puis la création de la FEGESPORT en{' '}
          <strong>2018</strong> — l’année même de sa reconnaissance
          nationale et de la cofondation de l’<em>African Esports
          Confederation</em> (AEC) — sont autant d’étapes qui ont jalonné
          cette trajectoire.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-6 mb-3">
          Chronologie des étapes majeures
        </h3>
        <div className="not-prose my-4 space-y-3">
          <div className="flex gap-4 p-4 rounded-xl border border-dark-700 bg-dark-900/60">
            <span className="text-fed-gold-500 font-bold text-lg flex-shrink-0 w-28">
              2009
            </span>
            <p className="text-light-300 leading-snug text-sm m-0">
              <strong>Création de l’Association JMC</strong> — premier
              collectif guinéen organisé autour de la pratique du jeu
              vidéo compétitif.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-xl border border-dark-700 bg-dark-900/60">
            <span className="text-fed-gold-500 font-bold text-lg flex-shrink-0 w-28">
              2014
            </span>
            <p className="text-light-300 leading-snug text-sm m-0">
              <strong>Reconnaissance officielle de l’Association JMC</strong>{' '}
              — première étape institutionnelle structurante pour
              l’écosystème esport guinéen.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-xl border border-dark-700 bg-dark-900/60">
            <span className="text-fed-gold-500 font-bold text-lg flex-shrink-0 w-28">
              2018
            </span>
            <p className="text-light-300 leading-snug text-sm m-0">
              <strong>Création de la FEGESPORT</strong>, reconnaissance
              nationale, et <strong>cofondation de l’AEC (African Esports
              Confederation)</strong> — trois jalons qui font de 2018 une
              année fondatrice.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-xl border border-dark-700 bg-dark-900/60">
            <span className="text-fed-gold-500 font-bold text-lg flex-shrink-0 w-28">
              2019
            </span>
            <p className="text-light-300 leading-snug text-sm m-0">
              <strong>Affiliation WESCO</strong> (West Esports Confederation),{' '}
              <strong>première compétition nationale</strong> organisée par la
              fédération et <strong>première participation africaine</strong> de la Guinée.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-xl border border-dark-700 bg-dark-900/60">
            <span className="text-fed-gold-500 font-bold text-lg flex-shrink-0 w-28">
              2022
            </span>
            <p className="text-light-300 leading-snug text-sm m-0">
              <strong>Affiliation IESF</strong> (International Esports
              Federation) — entrée de la Guinée dans la fédération mondiale
              de référence de l’esport.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-xl border border-dark-700 bg-dark-900/60">
            <span className="text-fed-gold-500 font-bold text-lg flex-shrink-0 w-28">
              2023
            </span>
            <p className="text-light-300 leading-snug text-sm m-0">
              <strong>Cofondation de l’ACES</strong>, affiliation
              ACES/AESF et <strong>première participation mondiale</strong>{' '}
              de la Guinée à l’IESF World Esports Championship.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-xl border border-dark-700 bg-dark-900/60">
            <span className="text-fed-gold-500 font-bold text-lg flex-shrink-0 w-28">
              2024
            </span>
            <p className="text-light-300 leading-snug text-sm m-0">
              <strong>Affiliation GEF</strong> (Global Esports Federation) et{' '}
              <strong>création de la LEG (League eSport Guinée)</strong> —
              compétition fédérale phare structurée autour d’un calendrier
              annuel et de plusieurs disciplines.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-xl border border-fed-gold-500/30 bg-dark-900">
            <span className="text-fed-gold-500 font-bold text-lg flex-shrink-0 w-28">
              Aujourd’hui
            </span>
            <p className="text-light-300 leading-snug text-sm m-0">
              <strong>41 tournois organisés</strong>, environ{' '}
              <strong>234 athlètes</strong> identifiés dans l’écosystème,
              quatre affiliations internationales actives (IESF, ACES,
              WESCO, GEF), une saison nationale (LEG) active, et une
              présence digitale officielle via fegesport224.org.
            </p>
          </div>
        </div>

        <p>
          L’histoire complète et documentée de l’écosystème esport en
          Guinée, incluant les dynamiques communautaires antérieures et
          l’ensemble du parcours de structuration, est présentée de
          manière neutre et factuelle sur la page dédiée{' '}
          <Link
            to="/histoire-esport-guinee"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            Histoire de l’esport en Guinée
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: 'chiffres-cles',
    eyebrow: 'Indicateurs',
    heading: 'Quelques chiffres clés',
    content: (
      <>
        <p>
          Au fil des années, la FEGESPORT a construit un écosystème
          mesurable, traduit par quelques indicateurs représentatifs de
          son action et de son ancrage.
        </p>
        <StatsInfobox
          title="L’écosystème FEGESPORT en chiffres"
          subtitle="Indicateurs cumulés depuis la création de la fédération en 2018."
          stats={[
            { value: 2018, label: 'Année de création', icon: <Calendar size={14} /> },
            { value: 2018, label: 'Reconnaissance nationale', icon: <Flag size={14} /> },
            { value: 4, label: 'Affiliations internationales', icon: <Globe2 size={14} /> },
            { value: 41, label: 'Tournois organisés', icon: <Trophy size={14} /> },
            { value: 234, label: 'Athlètes identifiés', icon: <Medal size={14} /> },
          ]}
          columns={5}
          className="my-2"
        />
        <p className="mt-5">
          Ces indicateurs sont mis à jour régulièrement à partir des
          données opérationnelles de la fédération. Ils reflètent une
          dynamique progressive, ancrée dans la durée, et appelée à
          s’enrichir au fil des saisons à venir.
        </p>
      </>
    ),
  },
  {
    id: 'gouvernance',
    eyebrow: 'Gouvernance',
    heading: 'Structure et organes décisionnels',
    content: (
      <>
        <p>
          La FEGESPORT fonctionne sur le modèle des fédérations sportives
          modernes. Son organisation repose sur des organes clairement
          identifiés, dont les responsabilités sont fixées par les
          statuts et le règlement intérieur de la fédération.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          L’Assemblée Générale
        </h3>
        <p>
          L’Assemblée Générale est l’organe souverain de la fédération.
          Elle réunit les représentants des clubs affiliés et des
          membres dirigeants. Elle vote les grandes orientations,
          approuve les comptes, élit le Président et renouvelle les
          membres du Bureau Exécutif. Sa convocation et ses prérogatives
          sont définies par les statuts.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Le Bureau Exécutif
        </h3>
        <p>
          Le Bureau Exécutif est l’instance dirigeante permanente de la
          FEGESPORT. Présidé par le Président de la fédération, il
          rassemble plusieurs fonctions clés&nbsp;: la Vice-Présidence,
          le Secrétariat Général, la Trésorerie, ainsi que des
          responsables thématiques (compétitions, section féminine,
          logistique, communication, partenariats, jeunesse, juridique).
        </p>
        <p>
          Chacun de ces responsables pilote un domaine stratégique
          précis et rend compte au Président. Cette organisation permet
          à la fédération d’opérer simultanément sur plusieurs fronts —
          national, international, éducatif, communautaire — sans
          dilution des responsabilités.
        </p>
        <p>
          La composition complète et actualisée du Bureau Exécutif est
          publiée et tenue à jour dans la section{' '}
          <Link
            to="/about"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            Notre direction
          </Link>{' '}
          de la page institutionnelle.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Les commissions techniques
        </h3>
        <p>
          La fédération s’appuie sur des commissions techniques
          spécialisées&nbsp;: commission des compétitions, commission
          d’arbitrage, commission de discipline, commission éthique,
          commission section féminine et commission esport scolaire.
          Chacune assure la rigueur opérationnelle et l’équité de la
          pratique sur son périmètre.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Transparence et redevabilité
        </h3>
        <p>
          La FEGESPORT s’engage à publier les communiqués officiels, les
          décisions majeures et les rapports d’activité. Les statuts,
          les règlements et les documents officiels sont mis à
          disposition sur la page{' '}
          <Link
            to="/resources"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            Ressources et documents officiels
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: 'affiliations',
    eyebrow: 'Affiliations',
    heading: 'Quatre affiliations internationales',
    content: (
      <>
        <p>
          La FEGESPORT n’opère pas en vase clos. Sa légitimité repose en
          partie sur son intégration aux instances mondiales et
          régionales qui structurent l’esport. La fédération est membre
          de quatre organisations internationales majeures.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 my-5 not-prose">
          <div className="p-4 rounded-xl border border-dark-700 bg-dark-900/60">
            <div className="flex items-baseline justify-between mb-1">
              <h4 className="text-light-100 font-semibold">IESF</h4>
              <span className="text-xs font-semibold text-fed-gold-500">2022</span>
            </div>
            <p className="text-sm text-light-400 leading-snug">
              International Esports Federation — fédération mondiale
              de référence pour l’esport.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-dark-700 bg-dark-900/60">
            <div className="flex items-baseline justify-between mb-1">
              <h4 className="text-light-100 font-semibold">ACES</h4>
              <span className="text-xs font-semibold text-fed-gold-500">2023</span>
            </div>
            <p className="text-sm text-light-400 leading-snug">
              Africa Esports Confederation — confédération continentale
              africaine d’esport, cofondée par la FEGESPORT.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-dark-700 bg-dark-900/60">
            <div className="flex items-baseline justify-between mb-1">
              <h4 className="text-light-100 font-semibold">WESCO</h4>
              <span className="text-xs font-semibold text-fed-gold-500">2019</span>
            </div>
            <p className="text-sm text-light-400 leading-snug">
              West Esports Confederation — confédération ouest-africaine
              dédiée à l’esport.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-dark-700 bg-dark-900/60">
            <div className="flex items-baseline justify-between mb-1">
              <h4 className="text-light-100 font-semibold">GEF</h4>
              <span className="text-xs font-semibold text-fed-gold-500">2024</span>
            </div>
            <p className="text-sm text-light-400 leading-snug">
              Global Esports Federation — organisation mondiale qui
              promeut l’esport comme discipline sportive à part entière.
            </p>
          </div>
        </div>
        <p className="text-sm text-light-400 italic">
          En 2018, la FEGESPORT a également participé à la cofondation de
          l’<strong>AEC (African Esports Confederation)</strong>,
          contribution antérieure à la consolidation de l’écosystème
          continental qui mènera, en 2023, à la cofondation de l’ACES.
        </p>
        <p>
          Ces affiliations apportent à la FEGESPORT plusieurs leviers
          concrets pour son action&nbsp;: la possibilité d’inscrire des
          sélections aux compétitions organisées par ces fédérations,
          l’accès aux formations et certifications délivrées par les
          confédérations, la participation aux travaux structurants
          (règlements, calendriers, disciplines reconnues) et la
          coopération régulière avec des pairs régionaux et mondiaux.
        </p>
        <p>
          Concrètement, cela signifie qu’un joueur affilié à la FEGESPORT
          peut s’engager dans les compétitions internationales auxquelles
          la fédération inscrit ses sélections, qu’un arbitre formé sous
          l’égide FEGESPORT peut développer son expertise au contact des
          standards internationaux, et que l’écosystème guinéen progresse
          en cohérence avec les bonnes pratiques partagées par les
          fédérations partenaires.
        </p>
      </>
    ),
  },
  {
    id: 'competitions',
    eyebrow: 'Compétitions',
    heading: 'LEG et compétitions officielles FEGESPORT',
    content: (
      <>
        <p>
          La compétition est au cœur de la mission fédérale. La FEGESPORT
          organise et supervise un ensemble de tournois officiels qui
          forment la pyramide compétitive nationale.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          La LEG — League eSport Guinée
        </h3>
        <p>
          La <strong>LEG (League eSport Guinée)</strong> est la
          compétition phare de la fédération. Elle se déploie comme un
          championnat structuré, avec une saison annuelle, plusieurs
          disciplines officielles, un règlement uniforme, des clubs
          affiliés et un classement national. La LEG vise un double
          objectif&nbsp;: offrir aux joueurs guinéens un cadre régulier
          d’expression de leur niveau, et identifier les meilleurs
          profils pour les sélections internationales.
        </p>
        <p>
          Le détail des disciplines reconnues, du calendrier en cours,
          des clubs affiliés, des tournois et des classements officiels
          est consultable sur la page dédiée&nbsp;:{' '}
          <Link
            to="/leg"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            La League eSport Guinée
          </Link>
          .
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Autres événements fédéraux
        </h3>
        <p>
          Au-delà de la LEG, la fédération organise et soutient des
          tournois thématiques&nbsp;: tournois de promotion par discipline,
          rencontres communautaires, étapes régionales, tournois
          féminins, tournois scolaires et événements de gala. Le détail
          des événements en cours et à venir est publié dans la section{' '}
          <Link
            to="/events"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            Événements officiels
          </Link>
          .
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Présence internationale
        </h3>
        <p>
          Dans le cadre de ses affiliations à l’IESF, à l’ACES, à la
          WESCO et à la GEF, la FEGESPORT inscrit et accompagne des
          sélections guinéennes aux compétitions organisées par ces
          fédérations. Elle assure le suivi de la préparation, de
          l’engagement et de la participation des athlètes aux étapes
          internationales auxquelles ses affiliations donnent accès.
          Les actualités liées à ces engagements internationaux sont
          publiées dans la section{' '}
          <Link
            to="/news"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            Actualités FEGESPORT
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: 'partenariats',
    eyebrow: 'Partenariats',
    heading: 'Écosystème de partenaires institutionnels et privés',
    content: (
      <>
        <p>
          Aucune fédération sportive ne peut grandir sans un écosystème
          de partenaires engagés. La FEGESPORT construit son réseau de
          partenariats autour de quatre piliers&nbsp;: les institutions
          publiques, les organisations internationales, les acteurs
          privés et les médias.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Partenariats institutionnels
        </h3>
        <p>
          La fédération entretient un dialogue actif avec les autorités
          publiques compétentes, en particulier les ministères et les
          institutions chargées de la jeunesse, des sports, du numérique
          et de l’éducation. L’objectif est d’ancrer l’esport dans les
          politiques publiques nationales, de soutenir l’esport scolaire
          et de faciliter la reconnaissance des statuts associatifs et
          sportifs.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Partenariats internationaux
        </h3>
        <p>
          Au-delà de ses affiliations (IESF, ACES, WESCO, GEF), la
          FEGESPORT noue des relations bilatérales avec d’autres
          fédérations nationales d’esport, dans une logique de
          coopération sud-sud et nord-sud&nbsp;: échanges d’expertise,
          déplacements croisés, tournois amicaux, formations d’arbitres
          et partage de bonnes pratiques de gouvernance.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Partenariats privés
        </h3>
        <p>
          Le développement d’un esport national passe aussi par
          l’engagement d’acteurs économiques. La fédération propose
          plusieurs niveaux de partenariats à ses sponsors et soutiens —
          allant de la dotation de tournois au sponsoring d’équipes
          nationales — tout en garantissant la cohérence éthique de son
          écosystème.
        </p>
        <p>
          La liste à jour des partenaires officiels ainsi que les
          modalités pour rejoindre l’écosystème sont publiées sur la
          page{' '}
          <Link
            to="/partners"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            Partenaires de la FEGESPORT
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: 'impact',
    eyebrow: 'Impact',
    heading: 'Impact social, éducatif et économique en Guinée',
    content: (
      <>
        <p>
          L’esport n’est pas seulement un divertissement ; c’est un
          secteur économique en croissance, un vecteur d’insertion
          pour la jeunesse, et un terrain d’expression de compétences
          transversales utiles dans l’économie numérique. La FEGESPORT
          aborde son action sous l’angle de cet impact réel sur la
          société guinéenne.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Jeunesse et insertion
        </h3>
        <p>
          Une part importante de la population guinéenne est jeune. Pour
          ces générations connectées, l’esport représente une voie
          d’expression de compétences (stratégie, coordination,
          communication, leadership), un espace de socialisation et,
          pour certains, un parcours professionnel. La fédération
          travaille à structurer ces opportunités en s’appuyant sur des
          clubs, des programmes de mentorat et des formations.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Éducation et esport scolaire
        </h3>
        <p>
          Conformément à sa vocation institutionnelle, la FEGESPORT
          défend une intégration progressive de l’esport dans le monde
          scolaire et universitaire, dans un cadre encadré. L’objectif
          n’est pas de remplacer les enseignements traditionnels, mais
          de proposer un espace structuré pour les pratiquants, en
          alliance avec les établissements et les autorités éducatives.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Économie numérique
        </h3>
        <p>
          L’écosystème esport active de nombreuses chaînes de valeur —
          événementiel, streaming, production audiovisuelle, marketing,
          design, hardware, formation — autant de métiers d’avenir
          accessibles aux jeunes Guinéens. La fédération encourage les
          vocations dans ces domaines et œuvre à la professionnalisation
          du secteur.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Inclusion et section féminine
        </h3>
        <p>
          La FEGESPORT défend une politique d’inclusion claire&nbsp;:
          renforcement de la place des femmes dans l’esport guinéen,
          structuration d’une section féminine, organisation de tournois
          féminins et programmes de mentorat dédiés. Cette ambition
          s’inscrit dans une vision moderne de l’esport, ouvert à tous.
        </p>
      </>
    ),
  },
  {
    id: 'programmes',
    eyebrow: 'Programmes',
    heading: 'Programmes et initiatives portés par la FEGESPORT',
    content: (
      <>
        <p>
          Au-delà de l’organisation des compétitions, la FEGESPORT
          déploie progressivement plusieurs programmes thématiques qui
          structurent son action et son impact sur le terrain.
          Ces programmes traduisent concrètement la vocation
          institutionnelle, sociale et éducative de la fédération.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Programme Section féminine
        </h3>
        <p>
          La Section féminine FEGESPORT regroupe les initiatives dédiées
          au renforcement de la place des femmes dans l’esport guinéen&nbsp;:
          accompagnement de joueuses, organisation de tournois féminins,
          actions de visibilité et programmes de mentorat. La fédération
          inscrit cette démarche dans la durée comme un axe structurant
          de sa stratégie.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Programme Esport scolaire
        </h3>
        <p>
          La FEGESPORT travaille à intégrer l’esport dans l’univers
          scolaire et universitaire, dans un cadre encadré et en
          partenariat avec les établissements et autorités éducatives
          qui souhaitent l’accompagner. L’objectif est d’ouvrir aux
          élèves et étudiants un espace structuré de pratique, sans
          interférer avec les enseignements traditionnels.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Programme Gaming responsable
        </h3>
        <p>
          La fédération promeut une pratique saine de l’esport&nbsp;:
          sensibilisation aux risques liés à la pratique excessive,
          équilibre entre études et compétition, hygiène de vie du
          joueur, protection des mineurs, lutte contre les comportements
          toxiques. Cette ligne s’aligne sur les recommandations
          partagées par les fédérations partenaires (IESF, ACES, GEF).
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Formation des arbitres et organisateurs
        </h3>
        <p>
          La FEGESPORT investit dans la formation des cadres techniques
          de l’esport guinéen&nbsp;: arbitres, organisateurs de tournois,
          référents disciplinaires. Cette structuration des compétences
          est un préalable à la montée en qualité des compétitions
          nationales et à la reconnaissance internationale des cadres
          formés en Guinée.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Coopération internationale
        </h3>
        <p>
          Dans la continuité de ses affiliations, la FEGESPORT échange
          avec ses fédérations partenaires sur les sujets clés du
          secteur&nbsp;: gouvernance, réglementation, fair-play,
          formation, esport scolaire. Ces échanges nourrissent l’action
          de la fédération en Guinée et permettent de partager les
          réalités spécifiques de l’écosystème national.
        </p>
      </>
    ),
  },
  {
    id: 'rejoindre',
    eyebrow: 'Rejoindre',
    heading: 'Comment rejoindre ou travailler avec la FEGESPORT',
    content: (
      <>
        <p>
          La fédération est ouverte à plusieurs profils&nbsp;: joueurs,
          clubs, institutions, partenaires, journalistes. Le chemin
          d’entrée diffère selon la nature de votre démarche.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Joueurs et joueuses
        </h3>
        <p>
          Vous êtes pratiquant et souhaitez rejoindre l’écosystème
          officiel&nbsp;? L’adhésion individuelle vous donne accès à un
          statut de membre reconnu par la fédération, à la possibilité
          de participer aux compétitions officielles et de progresser
          dans la pyramide nationale. Toutes les informations sont
          regroupées sur la page{' '}
          <Link
            to="/membership"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            Adhésion FEGESPORT
          </Link>
          .
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Clubs et organisations
        </h3>
        <p>
          Vous représentez un club, une équipe ou une organisation et
          souhaitez vous affilier à la FEGESPORT&nbsp;? Le processus
          d’affiliation passe par une demande officielle accompagnée des
          statuts de votre structure et de la liste de ses membres.
          Notre équipe vous guide dans la démarche depuis la page{' '}
          <Link
            to="/contact"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            Contact officiel
          </Link>
          .
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Partenaires et sponsors
        </h3>
        <p>
          Vous représentez une entreprise, une institution ou une
          organisation et souhaitez soutenir l’esport guinéen&nbsp;? La
          fédération propose plusieurs formats de collaboration. Pour en
          discuter, rendez-vous sur la page{' '}
          <Link
            to="/partners"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            Partenariats
          </Link>{' '}
          ou contactez directement la fédération.
        </p>
        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Médias et presse
        </h3>
        <p>
          Vous êtes journaliste, créateur de contenu ou média&nbsp;? La
          fédération met à votre disposition un{' '}
          <Link
            to="/press-kit"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            kit presse officiel
          </Link>{' '}
          comprenant logo HD, biographie, photos officielles et points
          de contact dédiés aux relations presse.
        </p>
      </>
    ),
  },
];

// ============================================================
// FAQ — Schema.org FAQPage injected automatically
// ============================================================

const faqItems: FAQItem[] = [
  {
    question: 'Qu’est-ce que la FEGESPORT ?',
    answer: (
      <p>
        La FEGESPORT (Fédération Guinéenne d’Esport) est une fédération
        sportive nationale dédiée à la promotion, à l’encadrement et à
        la structuration de l’esport en République de Guinée. Elle est
        affiliée à l’IESF, à l’ACES, à la WESCO et à la GEF.
      </p>
    ),
    answerText:
      "La FEGESPORT (Fédération Guinéenne d'Esport) est une fédération sportive nationale dédiée à la promotion, à l'encadrement et à la structuration de l'esport en République de Guinée. Elle est affiliée à l'IESF, à l'ACES, à la WESCO et à la GEF.",
  },
  {
    question: 'Quelles sont les missions de la FEGESPORT ?',
    answer: (
      <p>
        La FEGESPORT a pour missions de promouvoir l’esport comme
        discipline sportive en Guinée, d’organiser des compétitions
        fédérales (notamment la LEG), d’accompagner les clubs affiliés,
        de former arbitres et organisateurs, et d’engager des sélections
        guinéennes dans le cadre de ses affiliations IESF, ACES, WESCO
        et GEF.
      </p>
    ),
    answerText:
      "La FEGESPORT a pour missions de promouvoir l'esport comme discipline sportive en Guinée, d'organiser des compétitions fédérales (notamment la LEG), d'accompagner les clubs affiliés, de former arbitres et organisateurs, et d'engager des sélections guinéennes dans le cadre de ses affiliations IESF, ACES, WESCO et GEF.",
  },
  {
    question: 'À quelles fédérations internationales la FEGESPORT est-elle affiliée ?',
    answer: (
      <p>
        La FEGESPORT est membre de quatre organisations internationales&nbsp;:
        l’IESF (International Esports Federation), l’ACES (Africa
        Esports Confederation), la WESCO (West Esports Confederation)
        et la GEF (Global Esports Federation).
      </p>
    ),
    answerText:
      "La FEGESPORT est membre de quatre organisations internationales : l'IESF (International Esports Federation), l'ACES (Africa Esports Confederation), la WESCO (West Esports Confederation) et la GEF (Global Esports Federation).",
  },
  {
    question: 'Qu’est-ce que la LEG ?',
    answer: (
      <p>
        La LEG (League eSport Guinée) est la compétition officielle
        organisée par la FEGESPORT. Elle réunit plusieurs disciplines,
        des clubs affiliés et un calendrier annuel structuré.
      </p>
    ),
    answerText:
      "La LEG (League eSport Guinée) est la compétition officielle organisée par la FEGESPORT. Elle réunit plusieurs disciplines, des clubs affiliés et un calendrier annuel structuré.",
  },
  {
    question: 'Comment adhérer à la FEGESPORT en tant que joueur ?',
    answer: (
      <p>
        L’adhésion individuelle se fait depuis la page Adhésion. Elle
        donne accès au statut de membre reconnu et à la possibilité de
        participer aux compétitions officielles encadrées par la
        fédération.
      </p>
    ),
    answerText:
      "L'adhésion individuelle se fait depuis la page Adhésion. Elle donne accès au statut de membre reconnu et à la possibilité de participer aux compétitions officielles encadrées par la fédération.",
  },
  {
    question: 'Comment affilier un club esport à la FEGESPORT ?',
    answer: (
      <p>
        Pour affilier un club, la démarche débute par une demande
        officielle auprès de la fédération, accompagnée des statuts du
        club et de la liste de ses membres fondateurs. Le contact
        s’établit via la page Contact.
      </p>
    ),
    answerText:
      "Pour affilier un club, la démarche débute par une demande officielle auprès de la fédération, accompagnée des statuts du club et de la liste de ses membres fondateurs. Le contact s'établit via la page Contact.",
  },
  {
    question: 'Comment devenir partenaire de la FEGESPORT ?',
    answer: (
      <p>
        La fédération propose plusieurs formats de partenariats —
        institutionnels et privés. Les modalités sont précisées sur la
        page Partenaires, qui détaille les niveaux d’engagement et les
        points de contact dédiés.
      </p>
    ),
    answerText:
      "La fédération propose plusieurs formats de partenariats — institutionnels et privés. Les modalités sont précisées sur la page Partenaires, qui détaille les niveaux d'engagement et les points de contact dédiés.",
  },
  {
    question: 'Où trouver les actualités officielles de la FEGESPORT ?',
    answer: (
      <p>
        Toutes les actualités officielles (communiqués, résultats,
        annonces, événements) sont publiées sur la section Actualités
        du site officiel fegesport224.org.
      </p>
    ),
    answerText:
      "Toutes les actualités officielles (communiqués, résultats, annonces, événements) sont publiées sur la section Actualités du site officiel fegesport224.org.",
  },
];

// ============================================================
// Schema.org JSON-LD (SportsOrganization + AboutPage)
// ============================================================

const SITE_URL = 'https://fegesport224.org';

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SportsOrganization',
      '@id': `${SITE_URL}/#organization`,
      name: "Fédération Guinéenne d'Esport",
      alternateName: ['FEGESPORT', "Federation Guineenne d'Esport", 'Guinean Esports Federation'],
      url: SITE_URL,
      logo: `${SITE_URL}/og-image.jpg`,
      image: `${SITE_URL}/og-image.jpg`,
      description:
        "Fédération sportive nationale dédiée à la promotion, à l'encadrement et à la structuration de l'esport en République de Guinée. Affiliée IESF, ACES, WESCO, GEF.",
      sport: ['Esports', 'Electronic Sports', 'Competitive Gaming'],
      areaServed: {
        '@type': 'Country',
        name: 'Guinea',
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'GN',
        addressLocality: 'Conakry',
      },
      memberOf: [
        {
          '@type': 'SportsOrganization',
          name: 'International Esports Federation',
          alternateName: 'IESF',
          url: 'https://iesf.org',
        },
        {
          '@type': 'SportsOrganization',
          name: 'Africa Esports Confederation',
          alternateName: 'ACES',
        },
        {
          '@type': 'SportsOrganization',
          name: 'West Esports Confederation',
          alternateName: 'WESCO',
        },
        {
          '@type': 'SportsOrganization',
          name: 'Global Esports Federation',
          alternateName: 'GEF',
        },
      ],
      knowsLanguage: ['fr', 'en'],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'general',
          email: 'contact@fegesport224.org',
          availableLanguage: ['French', 'English'],
        },
      ],
    },
    {
      '@type': 'AboutPage',
      '@id': `${SITE_URL}/federation-guineenne-esport#aboutpage`,
      url: `${SITE_URL}/federation-guineenne-esport`,
      name: "Fédération Guinéenne d'Esport (FEGESPORT) — Page institutionnelle",
      inLanguage: 'fr',
      isPartOf: { '@id': `${SITE_URL}/#organization` },
      about: { '@id': `${SITE_URL}/#organization` },
      mainEntity: { '@id': `${SITE_URL}/#organization` },
      datePublished: '2026-06-10',
      dateModified: '2026-06-10',
    },
  ],
};

// ============================================================
// Page component
// ============================================================

const FederationGuineenneEsportPage: React.FC = () => {
  return (
    <PillarPageLayout
      seoTitle="Fédération Guinéenne d'Esport (FEGESPORT) — Page institutionnelle"
      seoDescription="La FEGESPORT est une fédération sportive nationale dédiée à la promotion et à la structuration de l'esport en Guinée. Affiliée IESF, ACES, WESCO, GEF. Missions, gouvernance, compétitions, adhésion."
      seoKeywords="federation guineenne d'esport, fegesport, federation esport guinee, esport guinee, federation officielle esport, IESF Guinee, ACES, WESCO, GEF, league esport guinee, LEG"
      schema={schema}
      breadcrumbs={[
        { name: 'À propos', url: '/about' },
        {
          name: "Fédération Guinéenne d'Esport",
          url: '/federation-guineenne-esport',
        },
      ]}
      heroEyebrow="Page institutionnelle"
      heroTitle="Fédération Guinéenne d'Esport (FEGESPORT)"
      heroSubtitle="Fédération sportive nationale dédiée à la promotion, à l'encadrement et à la structuration de l'esport en République de Guinée. Affiliée à l'IESF, à l'ACES, à la WESCO et à la GEF."
      tldr={{
        summary:
          "La FEGESPORT (Fédération Guinéenne d'Esport) est une fédération sportive nationale dédiée à la promotion, à l'encadrement et à la structuration de l'esport en République de Guinée.",
        bullets: [
          'Fédération sportive nationale dédiée à l’esport en Guinée.',
          'Affiliée à quatre fédérations internationales : IESF, ACES, WESCO, GEF.',
          'Organise la LEG (League eSport Guinée) et des compétitions fédérales.',
          'Inscrit et accompagne des sélections guinéennes dans le cadre de ses affiliations.',
          'Promeut une pratique éthique, inclusive et responsable de l’esport.',
        ],
      }}
      sections={sections}
      faq={faqItems}
      faqTitle="FAQ — Fédération Guinéenne d'Esport"
      relatedLinks={[
        {
          to: '/leg',
          label: 'La LEG — League eSport Guinée',
          description:
            'Compétitions officielles, disciplines, clubs et calendrier.',
          icon: <Trophy size={18} />,
        },
        {
          to: '/about',
          label: 'Notre direction',
          description: 'Bureau Exécutif et organes de gouvernance.',
          icon: <Users size={18} />,
        },
        {
          to: '/partners',
          label: 'Partenaires officiels',
          description: 'Partenaires institutionnels et privés.',
          icon: <Handshake size={18} />,
        },
        {
          to: '/news',
          label: 'Actualités FEGESPORT',
          description: 'Communiqués, résultats et annonces officielles.',
          icon: <Newspaper size={18} />,
        },
        {
          to: '/events',
          label: 'Événements officiels',
          description: 'Calendrier des compétitions et tournois.',
          icon: <Award size={18} />,
        },
        {
          to: '/membership',
          label: 'Adhésion à la fédération',
          description: 'Rejoindre l’écosystème officiel.',
          icon: <ShieldCheck size={18} />,
        },
        {
          to: '/press-kit',
          label: 'Kit presse officiel',
          description: 'Logo HD, biographie, photos pour les médias.',
          icon: <Building2 size={18} />,
        },
        {
          to: '/histoire-esport-guinee',
          label: "Histoire de l'esport en Guinée",
          description: "Chronologie factuelle et documentée de l'écosystème.",
          icon: <Globe2 size={18} />,
        },
        {
          to: '/contact',
          label: 'Contact officiel',
          description: 'Joindre la fédération.',
          icon: <Globe2 size={18} />,
        },
      ]}
      relatedTitle="Pour aller plus loin"
      cta={{
        title: "Rejoignez la communauté FEGESPORT",
        description:
          "Joueur, club, partenaire ou média : la fédération est ouverte. Adhérez ou contactez-nous pour bâtir l’esport guinéen ensemble.",
        primary: { label: 'Adhérer maintenant', to: '/membership' },
        secondary: { label: 'Contacter la fédération', to: '/contact' },
      }}
      lastReviewedISO="2026-06-10"
      authorLabel="Direction de la FEGESPORT"
    />
  );
};

export default FederationGuineenneEsportPage;
