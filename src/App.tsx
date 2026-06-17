import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import NewsPage from './pages/NewsPage';
import NewsArticlePage from './pages/NewsArticlePage';
import MembershipPage from './pages/MembershipPage';
import CommunityPage from './pages/CommunityPage';
import ResourcesPage from './pages/ResourcesPage';
import PartnersPage from './pages/PartnersPage';
import ContactPage from './pages/ContactPage';
import EventPage from './pages/EventPage';
import EventsListPage from './pages/EventsListPage';
import CardPage from './pages/CardPage';
import DirectPage from './pages/DirectPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';
import DownloadBackupPage from './pages/DownloadBackupPage';
import LEGPage from './pages/LEGPage';
import PressKitPage from './pages/PressKitPage';
import FederationGuineenneEsportPage from './pages/FederationGuineenneEsportPage';
import HistoireEsportGuineePage from './pages/HistoireEsportGuineePage';
import EsportGuineePage from './pages/EsportGuineePage';
import AdminGuard from './components/admin/AdminGuard';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import LoginPage from './pages/admin/LoginPage';
import PasswordResetHelper from './pages/admin/PasswordResetHelper';
import DashboardPage from './pages/admin/DashboardPage';
import HomePageManagerPage from './pages/admin/HomePageManagerPage';
import DiagnosticPage from './pages/admin/DiagnosticPage';
import TestDatabasePage from './pages/admin/TestDatabasePage';
import PagesAdminPage from './pages/admin/PagesAdminPage';
import NewsAdminPage from './pages/admin/NewsAdminPage';
import EventsAdminPage from './pages/admin/EventsAdminPage';
import UpcomingEventsAdminPage from './pages/admin/UpcomingEventsAdminPage';
import MembersAdminPage from './pages/admin/MembersAdminPage';
import MembershipTypesAdminPage from './pages/admin/MembershipTypesAdminPage';
import LeadershipAdminPage from './pages/admin/LeadershipAdminPage';
import PartnersAdminPage from './pages/admin/PartnersAdminPage';
import MessagesAdminPage from './pages/admin/MessagesAdminPage';
import FilesAdminPage from './pages/admin/FilesAdminPage';
import ResourcesAdminPage from './pages/admin/ResourcesAdminPage';
import CardsAdminPage from './pages/admin/CardsAdminPage';
import SlideshowAdminPage from './pages/admin/SlideshowAdminPage';
import StreamsAdminPage from './pages/admin/StreamsAdminPage';
import NewsletterAdminPage from './pages/admin/NewsletterAdminPage';
import EventRegistrationsAdminPage from './pages/admin/EventRegistrationsAdminPage';
import SiteSettingsAdminPage from './pages/admin/SiteSettingsAdminPage';
import SocialMediaAdminPage from './pages/admin/SocialMediaAdminPage';
import EmailAdminPage from './pages/admin/EmailAdminPage';
import EmailTestDiagnosticPage from './pages/admin/EmailTestDiagnosticPage';
import LEGAdminPage from './pages/admin/LEGAdminPage';
import SponsorsAdminPage from './pages/admin/SponsorsAdminPage';
import MenuAdminPage from './pages/admin/MenuAdminPage';
import FooterAdminPage from './pages/admin/FooterAdminPage';
import HistoryAdminPage from './pages/admin/HistoryAdminPage';
import DocumentsAdminPage from './pages/admin/DocumentsAdminPage';
import EventsUpdateTestPage from './pages/admin/EventsUpdateTestPage';
import AnalyticsAdminPage from './pages/admin/AnalyticsAdminPage';
import MediaDashboardPage from './pages/admin/media/MediaDashboardPage';
import MediaEventFormPage from './pages/admin/media/MediaEventFormPage';
import MediaDraftsPage from './pages/admin/media/MediaDraftsPage';
import MediaReviewPage from './pages/admin/media/MediaReviewPage';
import MediaArticlesPage from './pages/admin/media/MediaArticlesPage';
import MediaWatchPage from './pages/admin/media/MediaWatchPage';
import MediaSourcesPage from './pages/admin/media/MediaSourcesPage';
import MediaNewslettersPage from './pages/admin/media/MediaNewslettersPage';
import MediaStatsPage from './pages/admin/media/MediaStatsPage';
import MediaGrowthPage from './pages/admin/media/MediaGrowthPage';

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <Toaster position="top-right" />
        <Routes>
          {/* Admin routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/reset-password-helper" element={<PasswordResetHelper />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="homepage" element={<HomePageManagerPage />} />
            <Route path="analytics" element={<AnalyticsAdminPage />} />
            <Route path="diagnostic" element={<DiagnosticPage />} />
            <Route path="test-database" element={<TestDatabasePage />} />
            <Route path="pages" element={<PagesAdminPage />} />
            <Route path="menu" element={<MenuAdminPage />} />
            <Route path="footer" element={<FooterAdminPage />} />
            <Route path="history" element={<HistoryAdminPage />} />
            <Route path="documents" element={<DocumentsAdminPage />} />
            <Route path="news" element={<NewsAdminPage />} />
            <Route path="events" element={<EventsAdminPage />} />
            <Route path="upcoming-events" element={<UpcomingEventsAdminPage />} />
            <Route path="leg" element={<LEGAdminPage />} />
            <Route path="sponsors" element={<SponsorsAdminPage />} />
            <Route path="members" element={<MembersAdminPage />} />
            <Route path="membership-types" element={<MembershipTypesAdminPage />} />
            <Route path="leadership" element={<LeadershipAdminPage />} />
            <Route path="partners" element={<PartnersAdminPage />} />
            <Route path="messages" element={<MessagesAdminPage />} />
            <Route path="files" element={<FilesAdminPage />} />
            <Route path="resources" element={<ResourcesAdminPage />} />
            <Route path="cards" element={<CardsAdminPage />} />
            <Route path="slideshow" element={<SlideshowAdminPage />} />
            <Route path="streams" element={<StreamsAdminPage />} />
            <Route path="newsletter" element={<NewsletterAdminPage />} />
            <Route path="registrations" element={<EventRegistrationsAdminPage />} />
            <Route path="settings" element={<SiteSettingsAdminPage />} />
            <Route path="social-media" element={<SocialMediaAdminPage />} />
            <Route path="emails" element={<EmailAdminPage />} />
            <Route path="email-test" element={<EmailTestDiagnosticPage />} />
            <Route path="events-test" element={<EventsUpdateTestPage />} />
            {/* Centre Média IA */}
            <Route path="media" element={<MediaDashboardPage />} />
            <Route path="media/new" element={<MediaEventFormPage />} />
            <Route path="media/events/:id/edit" element={<MediaEventFormPage />} />
            <Route path="media/events/:id/review" element={<MediaReviewPage />} />
            <Route path="media/drafts" element={<MediaDraftsPage />} />
            <Route path="media/articles" element={<MediaArticlesPage />} />
            <Route path="media/watch" element={<MediaWatchPage />} />
            <Route path="media/sources" element={<MediaSourcesPage />} />
            <Route path="media/newsletters" element={<MediaNewslettersPage />} />
            <Route path="media/stats" element={<MediaStatsPage />} />
            <Route path="media/growth" element={<MediaGrowthPage />} />
          </Route>

          {/* Public routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/federation-guineenne-esport" element={<PublicLayout><FederationGuineenneEsportPage /></PublicLayout>} />
          <Route path="/histoire-esport-guinee" element={<PublicLayout><HistoireEsportGuineePage /></PublicLayout>} />
          <Route path="/esport-guinee" element={<PublicLayout><EsportGuineePage /></PublicLayout>} />
          <Route path="/news" element={<PublicLayout><NewsPage /></PublicLayout>} />
          <Route path="/news/:id" element={<PublicLayout><NewsArticlePage /></PublicLayout>} />
          <Route path="/membership" element={<PublicLayout><MembershipPage /></PublicLayout>} />
          <Route path="/membership/community" element={<PublicLayout><CommunityPage /></PublicLayout>} />
          {/* /resources is now a private (gated) area — requires admin auth.
              See public/llms.txt, public/robots.txt and public/_headers for
              search engine and AI-bot exclusion. */}
          <Route
            path="/resources"
            element={
              <PublicLayout>
                <AdminGuard>
                  <ResourcesPage />
                </AdminGuard>
              </PublicLayout>
            }
          />
          <Route path="/partners" element={<PublicLayout><PartnersPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/press-kit" element={<PublicLayout><PressKitPage /></PublicLayout>} />
          <Route path="/presse" element={<PublicLayout><PressKitPage /></PublicLayout>} />
          <Route path="/events" element={<PublicLayout><EventsListPage /></PublicLayout>} />
          <Route path="/events/:id" element={<PublicLayout><EventPage /></PublicLayout>} />
          <Route path="/card/:id" element={<PublicLayout><CardPage /></PublicLayout>} />
          <Route path="/direct" element={<PublicLayout><DirectPage /></PublicLayout>} />
          <Route path="/leg" element={<LEGPage />} />
          <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
          <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
          <Route path="/download-backup" element={<DownloadBackupPage />} />
          <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;