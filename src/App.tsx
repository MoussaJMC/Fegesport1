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
import DirectPage from './pages/DirectPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import DiagnosticPage from './pages/admin/DiagnosticPage';
import TestDatabasePage from './pages/admin/TestDatabasePage';
import PagesAdminPage from './pages/admin/PagesAdminPage';
import NewsAdminPage from './pages/admin/NewsAdminPage';
import EventsAdminPage from './pages/admin/EventsAdminPage';
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
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="diagnostic" element={<DiagnosticPage />} />
            <Route path="test-database" element={<TestDatabasePage />} />
            <Route path="pages" element={<PagesAdminPage />} />
            <Route path="news" element={<NewsAdminPage />} />
            <Route path="events" element={<EventsAdminPage />} />
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
          </Route>

          {/* Public routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/news" element={<PublicLayout><NewsPage /></PublicLayout>} />
          <Route path="/news/:id" element={<PublicLayout><NewsArticlePage /></PublicLayout>} />
          <Route path="/membership" element={<PublicLayout><MembershipPage /></PublicLayout>} />
          <Route path="/membership/community" element={<PublicLayout><CommunityPage /></PublicLayout>} />
          <Route path="/resources" element={<PublicLayout><ResourcesPage /></PublicLayout>} />
          <Route path="/partners" element={<PublicLayout><PartnersPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/events/:id" element={<PublicLayout><EventPage /></PublicLayout>} />
          <Route path="/direct" element={<PublicLayout><DirectPage /></PublicLayout>} />
          <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
          <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
          <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;