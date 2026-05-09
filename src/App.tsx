import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import PortfolioCategoryPage from './components/PortfolioCategoryPage';
import Services from './components/Services';
import Process from './components/Process';
import Team from './components/Team';
import Testimonials from './components/Testimonials';
import Booking from './components/Booking';
import Footer from './components/Footer';
import { ThemeProvider } from './components/ThemeContext';
import SEO from './components/SEO';

// Admin Pages
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminProjects from './admin/projects/AdminProjects';
import NewProject from './admin/projects/NewProject';
import AdminTeam from './admin/team/AdminTeam';
import NewTeamMember from './admin/team/NewTeamMember';
import AdminSettings from './admin/settings/AdminSettings';
import AdminTestimonials from './admin/testimonials/AdminTestimonials';
import NewTestimonial from './admin/testimonials/NewTestimonial';
import AdminServices from './admin/services/AdminServices';
import NewService from './admin/services/NewService';
import AdminProcess from './admin/process/AdminProcess';
import NewProcessStep from './admin/process/NewProcessStep';
import AdminTrustedBrands from './admin/trusted-brands/AdminTrustedBrands';
import AdminMessages from './admin/messages/AdminMessages';
import AdminAppointments from './admin/appointments/AdminAppointments';
import ScheduleManager from './admin/appointments/ScheduleManager';

function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Portfolio />
        <Services />
        <Process />
        <Team />
        <Testimonials />
        <Booking />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SEO />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/portfolio/:category" element={
            <>
              <Navbar />
              <PortfolioCategoryPage />
              <Footer />
            </>
          } />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            
            {/* Projects */}
            <Route path="projects" element={<AdminProjects />} />
            <Route path="projects/new" element={<NewProject />} />
            <Route path="projects/edit/:id" element={<NewProject />} />
            
            {/* Team */}
            <Route path="team" element={<AdminTeam />} />
            <Route path="team/new" element={<NewTeamMember />} />
            <Route path="team/edit/:id" element={<NewTeamMember />} />

            {/* Testimonials */}
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="testimonials/new" element={<NewTestimonial />} />
            <Route path="testimonials/edit/:id" element={<NewTestimonial />} />

            {/* Services */}
            <Route path="services" element={<AdminServices />} />
            <Route path="services/new" element={<NewService />} />
            <Route path="services/edit/:id" element={<NewService />} />

            {/* Process */}
            <Route path="process" element={<AdminProcess />} />
            <Route path="process/new" element={<NewProcessStep />} />
            <Route path="process/edit/:id" element={<NewProcessStep />} />

            {/* Trusted Brands */}
            <Route path="trusted-brands" element={<AdminTrustedBrands />} />

            {/* Messages/Inbox */}
            <Route path="messages" element={<AdminMessages />} />

            {/* Appointments */}
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="schedule" element={<ScheduleManager />} />

            {/* Settings */}
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
