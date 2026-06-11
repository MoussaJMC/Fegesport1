import React from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  Globe2,
  Newspaper,
  BookOpen,
  GraduationCap,
  Gamepad2,
  ShieldCheck,
  Building2,
  Heart,
} from 'lucide-react';
import PillarPageLayout from '../components/layout/PillarPageLayout';
import type { PillarSection } from '../components/layout/PillarPageLayout';
import type { FAQItem } from '../components/ui/FAQ';
import StatsInfobox from '../components/ui/StatsInfobox';

/**
 * Pillar Page #1 — /esport-guinee
 *
 * Editorial intent : devenir la reference encyclopedique
 * sur la requete "esport guinee" (la plus competitive de
 * la SERP cible).
 *
 * Ton : informationnel, neutre, factuel.
 * Sources : ecosysteme reel + faits FEGESPORT documentes.
 * Aucune formulation d'exclusivite — la page decrit l'ECOSYSTEME,
 * la FEGESPORT y est un acteur cite, pas l'unique sujet.
 */

// ============================================================
// Sections
// ============================================================

const sections: PillarSection[] = [
  {
    id: 'definition',
    eyebrow: 'Definition',
    heading: "Qu’est-ce que l’esport en Guinée ?",
    content: (
      <>
        <p>
          L’<strong>esport</strong> — abréviation d’«&nbsp;electronic
          sports&nbsp;» — désigne la pratique compétitive et organisée
          des jeux vidéo. En Guinée, cette pratique s’est imposée
          progressivement comme un véritable phénomène social, sportif
          et culturel. Elle réunit des joueurs, des clubs, des
          organisateurs de tournois, des structures associatives, des
          médias et une communauté de pratiquants présente dans
          l’ensemble du pays.
        </p>
        <p>
          L’<strong>esport guinéen</strong> recouvre une réalité plurielle&nbsp;:
          des tournois nationaux structurés, des compétitions locales
          dans les cybercafés, des rencontres entre clubs, des
          championnats par discipline, des participations africaines et
          internationales. Il regroupe à la fois des disciplines
          mondiales largement pratiquées — football virtuel, jeux
          mobiles compétitifs, jeux de tir, jeux de combat — et des
          dynamiques très locales propres à la culture gaming guinéenne.
        </p>
        <p>
          À l’échelle institutionnelle, l’esport est désormais
          considéré en Guinée comme une discipline sportive à part
          entière. Cette reconnaissance s’est construite au fil
          d’années d’engagement associatif, de structuration fédérale
          et d’affiliations internationales — un parcours documenté
          dans la page{' '}
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
    id: 'ecosysteme',
    eyebrow: 'Ecosysteme',
    heading: 'Les acteurs de l’écosystème esport guinéen',
    content: (
      <>
        <p>
          L’écosystème esport en Guinée s’est structuré autour de
          plusieurs catégories d’acteurs complémentaires. Comprendre
          cette répartition permet de saisir comment la pratique
          s’organise concrètement sur le terrain.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          La fédération nationale — FEGESPORT
        </h3>
        <p>
          La <strong>Fédération Guinéenne d’Esport (FEGESPORT)</strong>{' '}
          est l’organisation sportive nationale dédiée à la promotion,
          à l’encadrement et à la structuration de l’esport en Guinée.
          Elle est affiliée à l’<em>International Esports Federation</em>{' '}
          (IESF), à l’<em>Africa Esports Confederation</em> (ACES), à la{' '}
          <em>West Esports Confederation</em> (WESCO) et à la{' '}
          <em>Global Esports Federation</em> (GEF). Sa présentation
          complète est disponible sur la page{' '}
          <Link
            to="/federation-guineenne-esport"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            Fédération Guinéenne d’Esport
          </Link>
          .
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Les clubs et structures associatives
        </h3>
        <p>
          Les <strong>clubs esport</strong> constituent l’unité de base
          du tissu compétitif. Ce sont des associations sportives qui
          regroupent des joueurs, organisent des entraînements,
          inscrivent leurs équipes aux compétitions et structurent une
          identité d’équipe. Plusieurs clubs sont affiliés à la
          FEGESPORT et participent à la <em>League eSport Guinée
          (LEG)</em>, la compétition fédérale nationale.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Les joueurs et joueuses
        </h3>
        <p>
          Les <strong>athlètes</strong> représentent le cœur vivant de
          l’esport guinéen. Pratiquants amateurs, semi-professionnels
          ou professionnels, ils évoluent dans une ou plusieurs
          disciplines et progressent par le jeu, l’entraînement, les
          compétitions et la confrontation avec d’autres joueurs aux
          niveaux local, national et international.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Les cybercafés et lieux de pratique
        </h3>
        <p>
          Pilier historique de la pratique gaming en Guinée, les{' '}
          <strong>cybercafés</strong> ont joué un rôle de premier plan
          dans l’émergence de l’esport. Lieux de socialisation, de
          découverte, et de premiers affrontements compétitifs, ils
          continuent d’accueillir une part importante des pratiquants
          et hébergent régulièrement des tournois communautaires.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Les organisateurs d’événements
        </h3>
        <p>
          Plusieurs <strong>organisateurs de tournois</strong> —
          associations, structures privées, partenaires institutionnels
          — produisent des compétitions, des LAN parties et des
          événements communautaires. Leur travail est complémentaire de
          celui de la fédération&nbsp;: tandis que la FEGESPORT
          structure la pyramide nationale, ces organisateurs nourrissent
          la pratique de proximité.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Les médias et créateurs de contenu
        </h3>
        <p>
          Streameurs, vidéastes, journalistes sportifs et créateurs de
          contenu participent à donner de la visibilité à l’esport
          guinéen. Ils relaient les compétitions, racontent les
          parcours d’athlètes et contribuent à la culture esport
          nationale.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Les partenaires institutionnels et privés
        </h3>
        <p>
          Ministères, autorités sportives, sponsors privés,
          opérateurs technologiques, marques engagées&nbsp;: l’esport
          guinéen s’appuie progressivement sur un réseau de
          partenariats qui soutient son développement.
        </p>
      </>
    ),
  },
  {
    id: 'chiffres-cles',
    eyebrow: 'Indicateurs',
    heading: 'L’esport guinéen en quelques chiffres',
    content: (
      <>
        <p>
          Quinze années de structuration (de la création de
          l’Association JMC en 2009 à aujourd’hui) ont produit un
          écosystème mesurable. Les indicateurs ci-dessous reflètent la
          dynamique cumulée du parcours national.
        </p>
        <StatsInfobox
          title="L’écosystème en chiffres"
          subtitle="Indicateurs représentatifs cumulés depuis la création de la fédération en 2018."
          stats={[
            { value: 2009, label: 'Premiers pas (JMC)' },
            { value: 2018, label: 'Création FEGESPORT' },
            { value: 4, label: 'Affiliations internationales' },
            { value: 41, label: 'Tournois organisés' },
            { value: 234, label: 'Athlètes identifiés' },
          ]}
          columns={5}
          className="my-2"
        />
        <p className="mt-5">
          Ces chiffres ne capturent qu’une partie de la réalité&nbsp;:
          ils représentent l’activité documentée par la FEGESPORT.
          L’écosystème global, incluant les cybercafés, les tournois
          communautaires non affiliés et les pratiquants occasionnels,
          est plus large encore.
        </p>
      </>
    ),
  },
  {
    id: 'disciplines',
    eyebrow: 'Disciplines',
    heading: 'Les disciplines pratiquées en Guinée',
    content: (
      <>
        <p>
          L’esport guinéen accueille une grande diversité de
          disciplines, reflet des goûts de la communauté locale et des
          standards internationaux. Les jeux les plus représentés se
          regroupent en quelques familles principales.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Football virtuel
        </h3>
        <p>
          <strong>FIFA / EA FC</strong> et <strong>eFootball / PES</strong>{' '}
          comptent parmi les disciplines les plus populaires. Le
          football étant une passion nationale, sa transposition
          virtuelle a naturellement trouvé un écho profond auprès des
          joueurs guinéens. Ces titres sont régulièrement présents au
          programme des compétitions fédérales et locales.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Jeux mobiles compétitifs
        </h3>
        <p>
          <strong>Mobile Legends&nbsp;: Bang Bang (MLBB)</strong>,{' '}
          <strong>Free Fire</strong> et d’autres titres mobiles occupent
          une place centrale. Adaptés à un public connecté principalement
          via smartphone, ils permettent une pratique compétitive
          accessible sans matériel informatique lourd. Leur popularité
          est portée par une communauté dynamique et internationale.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Jeux de combat
        </h3>
        <p>
          <strong>Tekken</strong> et les titres de la famille fighting
          games sont pratiqués au sein d’une communauté plus
          spécialisée mais très fidèle. Ces disciplines exigent un
          niveau technique élevé et ont leur propre tradition
          internationale (EVO et tournois régionaux).
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Autres disciplines
        </h3>
        <p>
          Au-delà des familles citées, l’écosystème guinéen accueille
          d’autres titres compétitifs (jeux de stratégie, MOBA PC, jeux
          de tir) selon les éditions et l’intérêt de la communauté. La
          liste exacte des disciplines retenues dans une saison donnée
          de la <em>LEG</em> est publiée sur la page{' '}
          <Link
            to="/leg"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            League eSport Guinée
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: 'competitions',
    eyebrow: 'Compétitions',
    heading: 'Les compétitions nationales et internationales',
    content: (
      <>
        <p>
          La pratique compétitive de l’esport en Guinée se structure
          sur plusieurs niveaux complémentaires, du tournoi local
          jusqu’aux compétitions internationales.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Niveau local et communautaire
        </h3>
        <p>
          Les <strong>tournois locaux</strong> et <strong>LAN
          parties</strong> constituent le premier échelon. Souvent
          organisés dans des cybercafés, des espaces associatifs ou lors
          d’événements ponctuels, ils permettent aux pratiquants de
          s’affronter dans un cadre amical et de progresser.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          La League eSport Guinée (LEG)
        </h3>
        <p>
          La <strong>LEG</strong> est la compétition fédérale phare
          organisée par la FEGESPORT depuis 2024. Elle se déploie comme
          un championnat structuré, avec un calendrier annuel,
          plusieurs disciplines, un règlement uniforme, des clubs
          affiliés et un classement national. Toutes les informations
          opérationnelles (édition en cours, disciplines, clubs,
          dates) sont sur la page{' '}
          <Link
            to="/leg"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            LEG — League eSport Guinée
          </Link>
          .
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Compétitions thématiques
        </h3>
        <p>
          Au-delà de la LEG, des <strong>tournois féminins</strong>, des{' '}
          <strong>compétitions scolaires</strong> et des <strong>événements
          thématiques</strong> enrichissent le paysage compétitif. Ces
          formats permettent de toucher des publics spécifiques et de
          développer la pratique au-delà du cercle des joueurs déjà
          confirmés.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Compétitions africaines
        </h3>
        <p>
          La Guinée participe à des <strong>compétitions africaines
          esport</strong> dans le cadre des affiliations à l’ACES et à
          la WESCO. Sa première participation africaine remonte à 2019.
          Ces rencontres permettent aux athlètes guinéens de se
          confronter à des sélections du continent et de mesurer leur
          niveau dans un contexte régional.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Compétitions mondiales
        </h3>
        <p>
          Depuis l’affiliation à l’<strong>IESF</strong> en 2022, la
          Guinée participe également à des <strong>compétitions
          mondiales esport</strong>. Sa première participation mondiale
          s’est tenue en 2023. L’affiliation à la <strong>GEF</strong>{' '}
          en 2024 a renforcé encore l’ancrage international de
          l’écosystème national.
        </p>
      </>
    ),
  },
  {
    id: 'communaute',
    eyebrow: 'Communauté',
    heading: 'La communauté esport guinéenne',
    content: (
      <>
        <p>
          Au-delà de la dimension compétitive, l’esport guinéen est
          d’abord une <strong>communauté</strong>. Cette communauté est
          composée de pratiquants, de spectateurs, de fans, de
          créateurs de contenu, de bénévoles d’associations, de parents
          investis, et d’institutions qui soutiennent la pratique.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Une jeunesse mobilisée
        </h3>
        <p>
          La population guinéenne étant majoritairement jeune, l’esport
          y trouve un public naturel. Pour de nombreux jeunes, il
          représente une voie d’expression de compétences (stratégie,
          coordination, communication), un espace de socialisation, et
          parfois un projet professionnel. Cette adhésion massive de la
          jeunesse est l’un des moteurs du développement de
          l’écosystème.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Présence sur le territoire
        </h3>
        <p>
          La pratique esport en Guinée n’est pas concentrée sur la
          seule capitale. Conakry est un point névralgique de
          l’activité, mais des dynamiques compétitives existent
          également dans plusieurs régions du pays. Cette présence
          territoriale est un axe de développement structurant pour
          les années à venir.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Section féminine et inclusion
        </h3>
        <p>
          Le développement de la <strong>pratique féminine</strong>{' '}
          fait partie des priorités structurelles de l’écosystème. La
          FEGESPORT déploie une section féminine dédiée, avec des
          tournois, des actions de visibilité et des programmes de
          mentorat. L’objectif est d’assurer que l’esport guinéen
          progresse comme une pratique réellement ouverte à toutes et à
          tous.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Espaces communautaires en ligne
        </h3>
        <p>
          Au-delà de la pratique physique, la communauté esport
          guinéenne se retrouve aussi en ligne&nbsp;: groupes
          WhatsApp, pages Facebook, chaînes YouTube, lives Twitch et
          espaces Discord. Ces espaces sont essentiels à la circulation
          de l’information et à la culture esport locale.
        </p>
      </>
    ),
  },
  {
    id: 'education',
    eyebrow: 'Éducation',
    heading: 'Esport, éducation et jeunesse',
    content: (
      <>
        <p>
          L’esport en Guinée ne se réduit pas à la compétition. Il
          s’inscrit aussi dans une dynamique <strong>éducative et
          d’insertion</strong> qui s’adresse particulièrement à la
          jeunesse.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Esport scolaire et universitaire
        </h3>
        <p>
          Plusieurs initiatives visent à intégrer l’esport dans
          l’univers scolaire et universitaire, dans un cadre encadré
          et en partenariat avec les établissements et autorités
          éducatives. L’objectif n’est pas de remplacer les
          enseignements traditionnels, mais d’offrir aux élèves et
          étudiants un espace structuré de pratique.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Métiers de l’esport
        </h3>
        <p>
          L’écosystème esport active de nombreux métiers&nbsp;: joueur
          professionnel, coach, arbitre, commentateur (shoutcaster),
          manager d’équipe, organisateur d’événements, créateur de
          contenu, métiers techniques de l’audiovisuel, marketing.
          Pour la jeunesse guinéenne, ce sont autant de portes
          d’entrée vers les filières du numérique et de l’économie
          créative.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          Gaming responsable
        </h3>
        <p>
          La promotion d’une pratique saine de l’esport est une
          dimension structurelle&nbsp;: équilibre entre études et
          compétition, hygiène de vie du joueur, prévention des
          risques liés à la pratique excessive, protection des mineurs,
          lutte contre les comportements toxiques. Cette ligne est
          défendue par la FEGESPORT et alignée sur les recommandations
          partagées par les fédérations partenaires (IESF, ACES, GEF).
        </p>
      </>
    ),
  },
  {
    id: 'international',
    eyebrow: 'International',
    heading: 'L’esport guinéen sur la scène internationale',
    content: (
      <>
        <p>
          La trajectoire internationale de l’esport guinéen s’est
          construite progressivement à travers une série
          d’affiliations qui ont étoffé sa présence régionale et
          mondiale.
        </p>
        <ul className="list-disc list-inside space-y-1.5 ml-2">
          <li>
            <strong>2019</strong> — Affiliation à la WESCO (West
            Esports Confederation), première intégration formelle dans
            une structure régionale ouest-africaine.
          </li>
          <li>
            <strong>2022</strong> — Affiliation à l’IESF (International
            Esports Federation), fédération mondiale de référence.
          </li>
          <li>
            <strong>2023</strong> — Cofondation de l’ACES (Africa
            Esports Confederation) et première participation mondiale.
          </li>
          <li>
            <strong>2024</strong> — Affiliation à la GEF (Global
            Esports Federation).
          </li>
        </ul>
        <p>
          Cette montée en gamme internationale donne à l’écosystème
          guinéen un cadre de coopération avec des fédérations
          homologues, un accès à des compétitions de premier plan et
          une participation aux travaux structurants partagés au sein de
          ces fédérations (règlements, calendriers, disciplines
          reconnues).
        </p>
      </>
    ),
  },
  {
    id: 'participer',
    eyebrow: 'Participer',
    heading: 'Comment rejoindre l’esport guinéen',
    content: (
      <>
        <p>
          Vous êtes joueur, joueuse, parent, éducateur, organisateur,
          partenaire&nbsp;? Plusieurs portes d’entrée existent pour
          intégrer l’écosystème esport guinéen.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          En tant que joueur ou joueuse
        </h3>
        <p>
          La voie la plus directe consiste à rejoindre un club
          esport affilié à la FEGESPORT ou à adhérer individuellement
          à la fédération. Cela donne accès à un statut de membre
          reconnu et à la possibilité de participer aux compétitions
          officielles. Toutes les informations sont sur la page{' '}
          <Link
            to="/membership"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            Adhésion FEGESPORT
          </Link>
          .
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          En tant que club ou structure
        </h3>
        <p>
          Les clubs esport et organisations souhaitant s’affilier à la
          fédération peuvent en faire la demande via la page{' '}
          <Link
            to="/contact"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            Contact
          </Link>
          . L’affiliation donne accès aux compétitions officielles et
          à l’écosystème fédéral.
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          En tant que partenaire ou sponsor
        </h3>
        <p>
          Les modalités pour rejoindre l’écosystème en tant que
          partenaire institutionnel ou privé sont précisées sur la
          page{' '}
          <Link
            to="/partners"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            Partenaires
          </Link>
          .
        </p>

        <h3 className="text-xl font-semibold text-light-100 mt-5 mb-2">
          En tant que journaliste ou média
        </h3>
        <p>
          La fédération met à disposition un{' '}
          <Link
            to="/press-kit"
            className="text-fed-gold-500 hover:underline font-medium"
          >
            kit presse officiel
          </Link>{' '}
          comprenant logo HD, biographie, photos officielles et points
          de contact dédiés.
        </p>
      </>
    ),
  },
];

// ============================================================
// FAQ
// ============================================================

const faqItems: FAQItem[] = [
  {
    question: "Qu'est-ce que l'esport en Guinée ?",
    answer: (
      <p>
        L’esport en Guinée est la pratique compétitive et organisée des
        jeux vidéo telle qu’elle se déploie sur le territoire national.
        Elle inclut des compétitions structurées par la FEGESPORT
        (notamment la LEG), des tournois locaux, des clubs affiliés et
        une communauté présente dans plusieurs régions du pays.
      </p>
    ),
    answerText:
      "L'esport en Guinée est la pratique compétitive et organisée des jeux vidéo telle qu'elle se déploie sur le territoire national. Elle inclut des compétitions structurées par la FEGESPORT (notamment la LEG), des tournois locaux, des clubs affiliés et une communauté présente dans plusieurs régions du pays.",
  },
  {
    question: 'Depuis quand l’esport est-il pratiqué en Guinée ?',
    answer: (
      <p>
        La pratique compétitive du jeu vidéo s’est développée
        progressivement en Guinée à partir des années 2000. La
        structuration organisée commence en 2009 avec la création de
        l’Association JMC, première association guinéenne dédiée au
        jeu vidéo compétitif. La Fédération Guinéenne d’Esport
        (FEGESPORT) est créée en 2018.
      </p>
    ),
    answerText:
      "La pratique compétitive du jeu vidéo s'est développée progressivement en Guinée à partir des années 2000. La structuration organisée commence en 2009 avec la création de l'Association JMC, première association guinéenne dédiée au jeu vidéo compétitif. La Fédération Guinéenne d'Esport (FEGESPORT) est créée en 2018.",
  },
  {
    question: 'Quels jeux sont pratiqués en esport en Guinée ?',
    answer: (
      <p>
        Les disciplines les plus représentées en Guinée incluent le
        football virtuel (FIFA / EA FC, eFootball / PES), les jeux
        mobiles compétitifs (Mobile Legends Bang Bang, Free Fire) et
        les jeux de combat (Tekken et autres titres fighting games).
        D’autres disciplines complètent ponctuellement le programme
        des compétitions selon les éditions.
      </p>
    ),
    answerText:
      "Les disciplines les plus représentées en Guinée incluent le football virtuel (FIFA / EA FC, eFootball / PES), les jeux mobiles compétitifs (Mobile Legends Bang Bang, Free Fire) et les jeux de combat (Tekken et autres titres fighting games). D'autres disciplines complètent ponctuellement le programme des compétitions selon les éditions.",
  },
  {
    question: 'Qu’est-ce que la LEG ?',
    answer: (
      <p>
        La League eSport Guinée (LEG) est la compétition fédérale phare
        organisée par la FEGESPORT depuis 2024. Elle se déploie comme un
        championnat national structuré, avec un calendrier annuel,
        plusieurs disciplines reconnues, des clubs affiliés et un
        classement national.
      </p>
    ),
    answerText:
      "La League eSport Guinée (LEG) est la compétition fédérale phare organisée par la FEGESPORT depuis 2024. Elle se déploie comme un championnat national structuré, avec un calendrier annuel, plusieurs disciplines reconnues, des clubs affiliés et un classement national.",
  },
  {
    question: 'La Guinée participe-t-elle à des compétitions internationales d’esport ?',
    answer: (
      <p>
        Oui. La première participation africaine de la Guinée date de
        2019. Depuis l’affiliation à l’IESF en 2022 et la première
        participation mondiale en 2023, la Guinée s’engage régulièrement
        dans des compétitions internationales esport.
      </p>
    ),
    answerText:
      "Oui. La première participation africaine de la Guinée date de 2019. Depuis l'affiliation à l'IESF en 2022 et la première participation mondiale en 2023, la Guinée s'engage régulièrement dans des compétitions internationales esport.",
  },
  {
    question: 'Comment commencer l’esport en Guinée ?',
    answer: (
      <p>
        Plusieurs voies d’entrée existent&nbsp;: pratiquer dans un
        cybercafé, rejoindre un club esport local, participer à un
        tournoi communautaire, adhérer individuellement à la FEGESPORT,
        ou suivre l’actualité des compétitions sur le site officiel
        pour identifier les rendez-vous.
      </p>
    ),
    answerText:
      "Plusieurs voies d'entrée existent : pratiquer dans un cybercafé, rejoindre un club esport local, participer à un tournoi communautaire, adhérer individuellement à la FEGESPORT, ou suivre l'actualité des compétitions sur le site officiel pour identifier les rendez-vous.",
  },
  {
    question: 'Les femmes pratiquent-elles l’esport en Guinée ?',
    answer: (
      <p>
        Oui. La pratique féminine est en développement et constitue un
        axe structurel de l’écosystème. La FEGESPORT déploie une
        section féminine dédiée, avec des tournois, des actions de
        visibilité et des programmes de mentorat.
      </p>
    ),
    answerText:
      "Oui. La pratique féminine est en développement et constitue un axe structurel de l'écosystème. La FEGESPORT déploie une section féminine dédiée, avec des tournois, des actions de visibilité et des programmes de mentorat.",
  },
  {
    question: 'Quels sont les métiers de l’esport en Guinée ?',
    answer: (
      <p>
        L’écosystème esport active de nombreux métiers&nbsp;: joueur
        professionnel, coach, arbitre, commentateur (shoutcaster),
        manager d’équipe, organisateur de tournois, créateur de
        contenu, métiers techniques audiovisuels, marketing et
        communication esport.
      </p>
    ),
    answerText:
      "L'écosystème esport active de nombreux métiers : joueur professionnel, coach, arbitre, commentateur (shoutcaster), manager d'équipe, organisateur de tournois, créateur de contenu, métiers techniques audiovisuels, marketing et communication esport.",
  },
];

// ============================================================
// Schema.org
// ============================================================

const SITE_URL = 'https://fegesport224.org';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': `${SITE_URL}/esport-guinee#article`,
  url: `${SITE_URL}/esport-guinee`,
  headline: "L'esport en Guinée — guide complet et factuel",
  description:
    "Présentation complète de l'esport en Guinée : définition, écosystème, disciplines, compétitions nationales et internationales, communauté, éducation et jeunesse. Document factuel et documenté.",
  inLanguage: 'fr',
  isPartOf: { '@id': `${SITE_URL}/#organization` },
  about: [
    { '@type': 'Thing', name: 'Esport' },
    { '@type': 'Thing', name: 'Electronic Sports' },
    { '@type': 'Place', name: 'Guinea' },
  ],
  author: {
    '@type': 'SportsOrganization',
    name: "Fédération Guinéenne d'Esport",
    url: SITE_URL,
  },
  publisher: {
    '@type': 'SportsOrganization',
    name: "Fédération Guinéenne d'Esport",
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/og-image.jpg`,
    },
  },
  datePublished: '2026-06-11',
  dateModified: '2026-06-11',
};

// ============================================================
// Page
// ============================================================

const EsportGuineePage: React.FC = () => {
  return (
    <PillarPageLayout
      seoTitle="L'esport en Guinée — guide complet et factuel"
      seoDescription="Tout savoir sur l'esport en Guinée : définition, écosystème (FEGESPORT, clubs, athlètes), disciplines pratiquées, compétitions nationales (LEG) et internationales, communauté, jeunesse et éducation."
      seoKeywords="esport guinee, gaming guinee, electronic sports guinea, jeux video competitifs guinee, esport en Guinee, esport guineen, esport conakry, esport ouest-africain"
      schema={schema}
      breadcrumbs={[
        { name: 'À propos', url: '/about' },
        { name: "L'esport en Guinée", url: '/esport-guinee' },
      ]}
      heroEyebrow="Guide encyclopédique"
      heroTitle="L'esport en Guinée"
      heroSubtitle="Définition, écosystème, disciplines, compétitions, communauté, jeunesse : un panorama complet et factuel de l'esport guinéen, de ses racines associatives à sa structuration fédérale actuelle."
      tldr={{
        summary:
          "L'esport en Guinée est la pratique compétitive et organisée des jeux vidéo, structurée par un écosystème national qui inclut la FEGESPORT, des clubs affiliés, des athlètes, des cybercafés et une communauté étendue.",
        bullets: [
          "Présent en Guinée depuis 2009 avec la création de l'Association JMC.",
          "Structuré fédéralement depuis 2018 avec la FEGESPORT.",
          'Quatre affiliations internationales actives : IESF, ACES, WESCO, GEF.',
          "Disciplines majeures : FIFA / EA FC, eFootball, MLBB, Free Fire, Tekken.",
          "Compétition nationale phare : LEG (League eSport Guinée).",
        ],
      }}
      sections={sections}
      faq={faqItems}
      faqTitle="FAQ — L'esport en Guinée"
      relatedLinks={[
        {
          to: '/federation-guineenne-esport',
          label: "Fédération Guinéenne d'Esport",
          description: 'Présentation institutionnelle complète.',
          icon: <BookOpen size={18} />,
        },
        {
          to: '/histoire-esport-guinee',
          label: "Histoire de l'esport en Guinée",
          description: 'Chronologie de 2009 à aujourd’hui.',
          icon: <Globe2 size={18} />,
        },
        {
          to: '/leg',
          label: 'La LEG — League eSport Guinée',
          description: 'Compétitions, disciplines, calendrier.',
          icon: <Trophy size={18} />,
        },
        {
          to: '/news',
          label: 'Actualités esport guinéen',
          description: 'Suivre l’actualité au fil de l’eau.',
          icon: <Newspaper size={18} />,
        },
        {
          to: '/membership',
          label: 'Adhérer à la fédération',
          description: 'Joueur, club, partenaire.',
          icon: <ShieldCheck size={18} />,
        },
        {
          to: '/about',
          label: 'Notre direction',
          description: 'Bureau exécutif FEGESPORT.',
          icon: <Users size={18} />,
        },
        {
          to: '/partners',
          label: 'Partenaires',
          description: 'Écosystème institutionnel et privé.',
          icon: <Building2 size={18} />,
        },
        {
          to: '/membership/community',
          label: 'Communauté esport',
          description: 'Espaces et dynamiques communautaires.',
          icon: <Heart size={18} />,
        },
        {
          to: '/contact',
          label: 'Contact',
          description: 'Joindre la fédération.',
          icon: <Gamepad2 size={18} />,
        },
        {
          to: '/press-kit',
          label: 'Kit presse officiel',
          description: 'Pour les médias et créateurs.',
          icon: <GraduationCap size={18} />,
        },
      ]}
      relatedTitle="Pour aller plus loin"
      cta={{
        title: "Rejoignez l'écosystème esport guinéen",
        description:
          "Joueur, club, partenaire ou média : trouvez votre porte d'entrée et participez au développement de l'esport en Guinée.",
        primary: { label: 'Adhérer maintenant', to: '/membership' },
        secondary: { label: 'Contacter la fédération', to: '/contact' },
      }}
      lastReviewedISO="2026-06-11"
      authorLabel="Direction de la FEGESPORT"
    />
  );
};

export default EsportGuineePage;
