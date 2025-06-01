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
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import NewsAdminPage from './pages/admin/NewsAdminPage';
import EventsAdminPage from './pages/admin/EventsAdminPage';
import MembersAdminPage from './pages/admin/MembersAdminPage';
import PartnersAdminPage from './pages/admin/PartnersAdminPage';
import MessagesAdminPage from './pages/admin/MessagesAdminPage';

function App() {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <Toaster position="top-right" />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Admin routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="news" element={<NewsAdminPage />} />
              <Route path="events" element={<EventsAdminPage />} />
              <Route path="members" element={<MembersAdminPage />} />
              <Route path="partners" element={<PartnersAdminPage />} />
              <Route path="messages" element={<MessagesAdminPage />} />
            </Route>

            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsArticlePage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/membership/community" element={<CommunityPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/events/:id" element={<EventPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;