import React from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  Globe2,
  Newspaper,
  BookOpen,
  Calendar,
  Medal,
  Flag,
} from 'lucide-react';
import PillarPageLayout from '../components/layout/PillarPageLayout';
import type { PillarSection } from '../components/layout/PillarPageLayout';
import type { FAQItem } from '../components/ui/FAQ';
import StatsInfobox from '../components/ui/StatsInfobox';

/**
 * Pillar Page #8 — /histoire-esport-guinee
 *
 * Editorial intent: present the history of esport in Guinea
 * in a factual, documented, neutral way — with a real narrative
 * arc that values the JMC → FEGESPORT continuity from 2009 to today.
 *
 * Tone: institutional, descriptive, never comparative.
 * Sources: only verified, public facts and FEGESPORT-documented milestones.
 */

// ============================================================
// Visual chronology — reusable card style
// ============================================================

interface TimelineEntry {
  year: string;
  highlights: React.ReactNode;
}

const TimelineList: React.FC<{ entries: TimelineEntry[] }> = ({ entries }) => (
  <div className="not-prose my-6 space-y-3">
    {entries.map((e, i) => (
      <div
        key={i}
        className="flex gap-4 p-4 rounded-xl border border-dark-700 bg-dark-900/60"
      >
        <span className="text-fed-gold-500 font-bold text-lg flex-shrink-0 w-28">
          {e.year}
        </span>
        <div className="text-light-200 leading-snug text-sm m-0">
          {e.highlights}
        </div>
      </div>
    ))}
  </div>
);

// ============================================================
// Sections
// ============================================================

const sections: PillarSection[] = [
  {
    id: 'introduction',
    eyebrow: 'Introduction',
    heading: "Une histoire qui se construit depuis 2009",
    content: (
      <>
        <p>
          L’histoire de l’esport en Guinée n’a pas commencé en 2018 avec
          la naissance de la <strong>FEGESPORT</strong>. Elle s’écrit
          depuis <strong>2009</strong>, l’année où un premier collectif
          de passionnés s’organise sous la forme de l’
          <strong>Association JMC</strong>. Cette association a posé,
          année après année, les premières pierres d’un écosystème
          encore embryonnaire à l’époque.
        </p>
        <p>
          Documenter cette histoire, c’est restituer une trajectoire
          longue, faite d’engagement, d’apprentissages, et de progrès
          patients. C’est aussi rendre justice à toutes celles et ceux
          qui, dès la première heure, ont cru au potentiel du jeu vidéo
          compétitif en Guinée. La présente page propose cette
          restitution de manière <strong>factuelle, neutre et
          documentée</strong>.
        </p>
        <p>
          Cette page est un document vivant. Toute personne, association
          ou structure souhaitant contribuer à compléter cette chronologie
          avec des éléments datés et vérifiables peut prendre contact
          avec la FEGESPORT.
        </p>
      </>
    ),
  },
  {
    id: 'racines',
    eyebrow: 'Racines',
    heading: "2009 — La naissance de l’Association JMC",
    content: (
      <>
        <p>
          L’année <strong>2009</strong> marque l’acte de naissance de
          l’<strong>Association JMC</strong>, un collectif guinéen
          structuré autour de la pratique du jeu vidéo compétitif. Dans
          un contexte où l’esport n’est pas encore identifié comme
          discipline à part entière dans la plupart des pays d’Afrique
          de l’Ouest, la création de l’Association JMC traduit une
          vision pionnière&nbsp;: faire émerger une communauté organisée
          de joueurs, capable de porter une pratique sportive nouvelle.
        </p>
        <p>
          Pendant plusieurs années, l’Association JMC œuvre à
          fédérer la communauté, à organiser des rencontres et à
          installer durablement le jeu compétitif dans le paysage
          associatif guinéen. Cette première décennie sera la fondation
          sur laquelle reposera ensuite la FEGESPORT.
        </p>
      </>
    ),
  },
  {
    id: 'reconnaissance',
    eyebrow: 'Reconnaissance',
    heading: "2014 — Reconnaissance officielle de l’Association JMC",
    content: (
      <>
        <p>
          En <strong>2014</strong>, après cinq années de travail de fond,
          l’Association JMC obtient sa <strong>reconnaissance
          officielle</strong>. Cette étape institutionnelle est
          essentielle&nbsp;: elle valide la légitimité d’un acteur
          organisé autour du jeu vidéo compétitif et ouvre la voie à un
          dialogue plus structuré avec les institutions publiques.
        </p>
        <p>
          La reconnaissance de 2014 donne à l’Association JMC les moyens
          de monter en ambition. C’est cette dynamique de
          professionnalisation qui, quelques années plus tard,
          conduira à la création de la FEGESPORT.
        </p>
      </>
    ),
  },
  {
    id: 'naissance-fegesport',
    eyebrow: 'Création',
    heading: "2018 — Année fondatrice de la FEGESPORT",
    content: (
      <>
        <p>
          L’année <strong>2018</strong> est probablement l’année la plus
          dense de cette histoire. Trois événements majeurs s’y
          concentrent et s’y articulent.
        </p>
        <p>
          <strong>D’abord, la création de la FEGESPORT.</strong> La
          Fédération Guinéenne d’Esport est constituée dans le
          prolongement direct du travail mené par l’Association JMC
          depuis 2009. Cette filiation n’est pas symbolique&nbsp;: elle
          traduit une continuité humaine, organisationnelle et de
          vision. La FEGESPORT prend le relais et la suite, en élevant
          l’ambition au niveau d’une fédération nationale.
        </p>
        <p>
          <strong>Ensuite, la reconnaissance nationale.</strong> Dès
          2018, la FEGESPORT bénéficie d’une reconnaissance nationale
          qui lui donne le cadre institutionnel pour structurer son
          action sur l’ensemble du territoire.
        </p>
        <p>
          <strong>Enfin, la cofondation de l’AEC (African Esports
          Confederation).</strong> Toujours en 2018, la FEGESPORT
          participe à la cofondation de l’AEC, marquant son engagement
          panafricain dès la première heure. Cette dimension continentale
          est, dès l’origine, indissociable du projet FEGESPORT.
        </p>
      </>
    ),
  },
  {
    id: 'premieres-etapes',
    eyebrow: 'Premiers pas',
    heading: '2019 — Les premiers rendez-vous compétitifs',
    content: (
      <>
        <p>
          L’année <strong>2019</strong> est celle des premières
          réalisations concrètes. Elle est marquée par trois jalons
          étroitement liés.
        </p>
        <p>
          <strong>Affiliation à la WESCO</strong> (West Esports
          Confederation) — la FEGESPORT rejoint la confédération
          ouest-africaine, première intégration formelle dans une
          structure régionale.
        </p>
        <p>
          <strong>Première compétition nationale</strong> — la
          fédération organise sa première compétition nationale,
          marquant le passage de l’idée à l’action sur le terrain
          guinéen.
        </p>
        <p>
          <strong>Première participation africaine</strong> — la Guinée
          est représentée pour la première fois dans une compétition
          esport africaine. C’est le premier engagement international,
          ouvrant un cycle qui se poursuivra avec les participations
          suivantes.
        </p>
      </>
    ),
  },
  {
    id: 'reconnaissance-mondiale',
    eyebrow: 'IESF',
    heading: "2022 — Entrée dans la fédération mondiale (IESF)",
    content: (
      <>
        <p>
          En <strong>2022</strong>, la FEGESPORT obtient son{' '}
          <strong>affiliation à l’IESF (International Esports
          Federation)</strong>. Cette étape constitue un tournant majeur&nbsp;:
          l’IESF est la fédération mondiale de référence de l’esport,
          et l’entrée d’une fédération nationale en son sein implique
          un alignement sur des standards internationaux exigeants en
          matière de gouvernance, de fair-play et de cadre compétitif.
        </p>
        <p>
          Cette affiliation ouvre à la Guinée la perspective d’une
          participation à l’IESF World Esports Championship, principale
          compétition mondiale annuelle organisée par l’IESF.
        </p>
      </>
    ),
  },
  {
    id: 'premieres-mondiales',
    eyebrow: 'Mondial',
    heading: '2023 — Cofondation de l’ACES et première participation mondiale',
    content: (
      <>
        <p>
          L’année <strong>2023</strong> est marquée par trois
          réalisations qui s’inscrivent dans le prolongement direct
          des affiliations précédentes.
        </p>
        <p>
          <strong>Cofondation de l’ACES (Africa Esports Confederation).</strong>{' '}
          La FEGESPORT participe à la cofondation de cette
          confédération africaine, contribuant à structurer le paysage
          continental.
        </p>
        <p>
          <strong>Affiliation ACES / AESF.</strong> La fédération
          formalise son adhésion au cadre africain consolidé.
        </p>
        <p>
          <strong>Première participation mondiale.</strong> La Guinée
          est représentée pour la première fois dans une compétition
          esport mondiale. Cette étape constitue un point d’étape
          symbolique pour un écosystème né, quinze ans plus tôt, dans
          l’élan associatif de 2009.
        </p>
      </>
    ),
  },
  {
    id: 'leg-et-gef',
    eyebrow: 'LEG',
    heading: '2024 — Affiliation GEF et lancement de la LEG',
    content: (
      <>
        <p>
          En <strong>2024</strong>, la FEGESPORT franchit deux nouveaux
          paliers.
        </p>
        <p>
          <strong>Affiliation GEF (Global Esports Federation).</strong>{' '}
          La fédération rejoint cette organisation mondiale qui promeut
          l’esport comme discipline sportive à part entière. La Guinée
          dispose désormais de <strong>quatre affiliations
          internationales</strong> actives&nbsp;: IESF, ACES, WESCO et GEF.
        </p>
        <p>
          <strong>Création de la LEG (League eSport Guinée).</strong> La
          fédération lance sa compétition fédérale phare, structurée
          autour d’un calendrier annuel, de plusieurs disciplines
          reconnues, de clubs affiliés et d’un classement national. La
          LEG marque la maturation d’un projet entamé en 2018 et
          installe une saison nationale stable, lisible et durable.
        </p>
      </>
    ),
  },
  {
    id: 'frise-complete',
    eyebrow: 'Vue d’ensemble',
    heading: 'Chronologie visuelle complète',
    content: (
      <>
        <p>
          Pour une lecture rapide, voici l’ensemble des étapes clés
          présentées sous forme de chronologie unifiée.
        </p>
        <TimelineList
          entries={[
            {
              year: '2009',
              highlights: (
                <p className="m-0">
                  Création de l’<strong>Association JMC</strong>, premier
                  collectif guinéen structuré autour du jeu vidéo compétitif.
                </p>
              ),
            },
            {
              year: '2014',
              highlights: (
                <p className="m-0">
                  <strong>Reconnaissance officielle</strong> de l’Association JMC.
                </p>
              ),
            },
            {
              year: '2018',
              highlights: (
                <p className="m-0">
                  <strong>Création de la FEGESPORT</strong>, reconnaissance
                  nationale et <strong>cofondation de l’AEC</strong> (African
                  Esports Confederation).
                </p>
              ),
            },
            {
              year: '2019',
              highlights: (
                <p className="m-0">
                  <strong>Affiliation WESCO</strong>, première{' '}
                  <strong>compétition nationale</strong> et première{' '}
                  <strong>participation africaine</strong>.
                </p>
              ),
            },
            {
              year: '2022',
              highlights: (
                <p className="m-0">
                  <strong>Affiliation IESF</strong> (International Esports
                  Federation).
                </p>
              ),
            },
            {
              year: '2023',
              highlights: (
                <p className="m-0">
                  <strong>Cofondation de l’ACES</strong>, affiliation
                  ACES/AESF et première <strong>participation mondiale</strong>.
                </p>
              ),
            },
            {
              year: '2024',
              highlights: (
                <p className="m-0">
                  <strong>Affiliation GEF</strong> et <strong>création
                  de la LEG</strong> (League eSport Guinée).
                </p>
              ),
            },
            {
              year: 'Aujourd’hui',
              highlights: (
                <p className="m-0">
                  <strong>41 tournois organisés</strong>, environ{' '}
                  <strong>234 athlètes identifiés</strong>, quatre
                  affiliations internationales actives et une saison
                  nationale (LEG) structurée.
                </p>
              ),
            },
          ]}
        />
      </>
    ),
  },
  {
    id: 'chiffres-cles',
    eyebrow: 'Indicateurs',
    heading: 'Quelques chiffres clés de l’écosystème',
    content: (
      <>
        <p>
          Au fil de ces quinze années de structuration, l’écosystème
          esport guinéen porté par la FEGESPORT (et avant elle par
          l’Association JMC) a produit des résultats mesurables.
        </p>
        <StatsInfobox
          title="L’écosystème en chiffres"
          subtitle="Indicateurs représentatifs cumulés depuis la création de la fédération en 2018."
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
          Ces indicateurs reflètent une dynamique constante&nbsp;: une
          montée en gamme progressive des compétitions, un nombre
          croissant d’athlètes identifiés et accompagnés, et une
          présence internationale élargie au fil des affiliations.
        </p>
      </>
    ),
  },
  {
    id: 'continuite',
    eyebrow: 'Continuité',
    heading: 'De l’Association JMC à la FEGESPORT — une seule trajectoire',
    content: (
      <>
        <p>
          La lecture de cette chronologie met en évidence un trait
          essentiel de l’histoire de l’esport en Guinée&nbsp;: la{' '}
          <strong>continuité</strong>. Il n’y a pas, en réalité, deux
          histoires parallèles — celle de l’Association JMC d’un côté,
          celle de la FEGESPORT de l’autre — mais une seule et même
          trajectoire, qui s’étire de 2009 à aujourd’hui.
        </p>
        <p>
          L’Association JMC a posé les fondations. La FEGESPORT en a
          pris le relais en élevant l’ambition au niveau d’une
          fédération nationale, en obtenant la reconnaissance des
          autorités, en s’engageant à l’international, et en
          structurant la saison nationale avec la LEG.
        </p>
        <p>
          Cette continuité n’est pas anodine&nbsp;: elle confère à la
          FEGESPORT une profondeur historique précieuse. Près de quinze
          années de travail collectif, d’apprentissages, d’engagements
          de bénévoles et de pratiquants ont précédé la photo que
          l’écosystème offre aujourd’hui. C’est cette épaisseur qui
          donne au projet sa solidité.
        </p>
      </>
    ),
  },
  {
    id: 'futur',
    eyebrow: 'Perspectives',
    heading: 'Une histoire en construction',
    content: (
      <>
        <p>
          L’histoire de l’esport en Guinée est une histoire qui s’écrit
          encore. Chaque saison de la LEG, chaque participation
          internationale, chaque nouveau club affilié, chaque programme
          déployé constitue une nouvelle page de cette chronologie
          collective.
        </p>
        <p>
          La FEGESPORT continuera de documenter les étapes marquantes
          de cette évolution et de mettre à jour la présente page au
          fil des éditions et des engagements à venir.
        </p>
        <p>
          Pour suivre cette histoire au fil de l’eau, rendez-vous sur la
          section{' '}
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
];

// ============================================================
// FAQ
// ============================================================

const faqItems: FAQItem[] = [
  {
    question: "Quand a commencé l'histoire de l'esport organisé en Guinée ?",
    answer: (
      <p>
        L’histoire de l’esport organisé en Guinée commence en 2009 avec
        la création de l’Association JMC, premier collectif guinéen
        structuré autour du jeu vidéo compétitif. Cette dynamique
        aboutira en 2018 à la création de la FEGESPORT.
      </p>
    ),
    answerText:
      "L'histoire de l'esport organisé en Guinée commence en 2009 avec la création de l'Association JMC, premier collectif guinéen structuré autour du jeu vidéo compétitif. Cette dynamique aboutira en 2018 à la création de la FEGESPORT.",
  },
  {
    question: 'Quand la FEGESPORT a-t-elle été créée ?',
    answer: (
      <p>
        La FEGESPORT a été créée en 2018, dans le prolongement direct du
        travail mené depuis 2009 par l’Association JMC. La même année,
        elle obtient sa reconnaissance nationale et participe à la
        cofondation de l’AEC (African Esports Confederation).
      </p>
    ),
    answerText:
      "La FEGESPORT a été créée en 2018, dans le prolongement direct du travail mené depuis 2009 par l'Association JMC. La même année, elle obtient sa reconnaissance nationale et participe à la cofondation de l'AEC (African Esports Confederation).",
  },
  {
    question: 'Quelles sont les affiliations internationales de la FEGESPORT ?',
    answer: (
      <p>
        La FEGESPORT compte quatre affiliations internationales
        actives&nbsp;: WESCO (2019), IESF (2022), ACES (2023) et GEF
        (2024). Elle a également participé à la cofondation de l’AEC
        en 2018.
      </p>
    ),
    answerText:
      "La FEGESPORT compte quatre affiliations internationales actives : WESCO (2019), IESF (2022), ACES (2023) et GEF (2024). Elle a également participé à la cofondation de l'AEC en 2018.",
  },
  {
    question: 'Quand la Guinée a-t-elle participé pour la première fois à une compétition mondiale ?',
    answer: (
      <p>
        La première participation mondiale de la Guinée s’est tenue en
        2023, dans le sillage de l’affiliation IESF obtenue en 2022.
      </p>
    ),
    answerText:
      "La première participation mondiale de la Guinée s'est tenue en 2023, dans le sillage de l'affiliation IESF obtenue en 2022.",
  },
  {
    question: 'Quand la LEG a-t-elle été créée ?',
    answer: (
      <p>
        La League eSport Guinée (LEG) a été créée en 2024. C’est la
        compétition fédérale phare organisée par la FEGESPORT,
        structurée autour d’un calendrier annuel et de plusieurs
        disciplines.
      </p>
    ),
    answerText:
      "La League eSport Guinée (LEG) a été créée en 2024. C'est la compétition fédérale phare organisée par la FEGESPORT, structurée autour d'un calendrier annuel et de plusieurs disciplines.",
  },
  {
    question: 'Comment contribuer à la documentation de cette histoire ?',
    answer: (
      <p>
        Les contributions documentées et datées sont les bienvenues.
        Toute personne, association ou structure souhaitant compléter
        cette chronologie peut prendre contact avec la fédération via
        la page Contact.
      </p>
    ),
    answerText:
      "Les contributions documentées et datées sont les bienvenues. Toute personne, association ou structure souhaitant compléter cette chronologie peut prendre contact avec la fédération via la page Contact.",
  },
];

// ============================================================
// Schema.org
// ============================================================

const SITE_URL = 'https://fegesport224.org';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': `${SITE_URL}/histoire-esport-guinee#article`,
  url: `${SITE_URL}/histoire-esport-guinee`,
  headline: "Histoire de l'esport en Guinée — chronologie 2009 à aujourd'hui",
  description:
    "Chronologie factuelle et documentée de l'esport en Guinée : Association JMC (2009), reconnaissance officielle (2014), création de la FEGESPORT (2018), affiliations internationales (WESCO 2019, IESF 2022, ACES 2023, GEF 2024), création de la LEG (2024).",
  inLanguage: 'fr',
  isPartOf: { '@id': `${SITE_URL}/#organization` },
  about: {
    '@type': 'Thing',
    name: "Esport en Guinée",
  },
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
  datePublished: '2026-06-10',
  dateModified: '2026-06-10',
};

// ============================================================
// Page
// ============================================================

const HistoireEsportGuineePage: React.FC = () => {
  return (
    <PillarPageLayout
      seoTitle="Histoire de l'esport en Guinée — chronologie 2009 à aujourd'hui"
      seoDescription="Chronologie factuelle et documentée : Association JMC (2009), reconnaissance officielle (2014), création de la FEGESPORT (2018), affiliations internationales (WESCO, IESF, ACES, GEF), création de la LEG (2024)."
      seoKeywords="histoire esport guinee, chronologie esport guinee, association JMC, debut esport guinee, evolution esport guineen, naissance fegesport, IESF Guinee, LEG"
      schema={schema}
      breadcrumbs={[
        { name: "À propos", url: '/about' },
        {
          name: "Histoire de l'esport en Guinée",
          url: '/histoire-esport-guinee',
        },
      ]}
      heroEyebrow="Documentation institutionnelle"
      heroTitle="Histoire de l'esport en Guinée"
      heroSubtitle="De la création de l'Association JMC en 2009 à la FEGESPORT d'aujourd'hui : quinze années de structuration d'un écosystème national."
      tldr={{
        summary:
          "L'esport guinéen s'est construit en continuité depuis 2009 : Association JMC, reconnaissance officielle en 2014, création de la FEGESPORT en 2018, affiliations internationales successives et lancement de la LEG en 2024.",
        bullets: [
          "2009 : création de l'Association JMC, première organisation guinéenne structurée.",
          "2014 : reconnaissance officielle de l'Association JMC.",
          "2018 : création de la FEGESPORT, reconnaissance nationale, cofondation de l'AEC.",
          "2019 : affiliation WESCO, première compétition nationale, première participation africaine.",
          "2022-2024 : affiliations IESF, ACES, GEF et création de la LEG.",
        ],
      }}
      sections={sections}
      faq={faqItems}
      faqTitle="FAQ — Histoire de l'esport en Guinée"
      relatedLinks={[
        {
          to: '/federation-guineenne-esport',
          label: "Fédération Guinéenne d'Esport",
          description: 'Présentation institutionnelle complète.',
          icon: <BookOpen size={18} />,
        },
        {
          to: '/leg',
          label: 'La LEG — League eSport Guinée',
          description: 'Compétition fédérale, disciplines et calendrier.',
          icon: <Trophy size={18} />,
        },
        {
          to: '/about',
          label: 'À propos de la FEGESPORT',
          description: 'Direction, mission et gouvernance.',
          icon: <Users size={18} />,
        },
        {
          to: '/news',
          label: 'Actualités FEGESPORT',
          description: 'Suivre l’histoire en train de s’écrire.',
          icon: <Newspaper size={18} />,
        },
      ]}
      relatedTitle="Pour aller plus loin"
      cta={{
        title: 'Contribuer à documenter cette histoire',
        description:
          "Vous disposez d'éléments datés et vérifiables sur l'histoire de l'esport en Guinée ? La fédération accueille toute contribution documentée.",
        primary: { label: 'Contacter la fédération', to: '/contact' },
        secondary: { label: 'Voir les actualités', to: '/news' },
      }}
      lastReviewedISO="2026-06-10"
      authorLabel="Direction de la FEGESPORT"
    />
  );
};

export default HistoireEsportGuineePage;
