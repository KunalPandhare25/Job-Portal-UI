import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import RecruiterDashboard from './recruiter/pages/RecruiterDashboard';
import RecruiterLayout from './recruiter/layouts/RecruiterLayout';
import ManageJobs from './recruiter/pages/ManageJobs';
import PostJob from './recruiter/pages/PostJob';
import Applicants from './recruiter/pages/Applicants';
import Interviews from './recruiter/pages/Interviews';
import CompanyProfile from './recruiter/pages/CompanyProfile';
import Analytics from './recruiter/pages/Analytics';
import Settings from './recruiter/pages/Settings';

import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import RegisterChoice from './pages/RegisterChoice';
import RecruiterRegister from './pages/RecruiterRegister';

import Navbar from './components/Navbar';
import Plans from './pages/Plans';
import Notifications from './pages/Notifications';
import { NotificationProvider } from './context/NotificationContext';
import JobDetails from './pages/JobDetails';
import PublicCompanyProfile from './pages/PublicCompanyProfile';
import ApplicationPage from './pages/ApplicationPage';
import MyApplications from './pages/MyApplications';
import About from "./pages/About";
import ContactUs from "./pages/ContactUs";

// Protect recruiter routes
function RequireRecruiter({ children }) {
  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (!token || !savedUser) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(savedUser);

    if (user.role !== 'recruiter') {
      return <Navigate to="/" replace />;
    }

    return children;

  } catch {
    return <Navigate to="/login" replace />;
  }
}

function AppContent() {
  const location = useLocation();

  const [username, setUsername] = useState(() => {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      try {
        return JSON.parse(savedUser).full_name || '';
      } catch {
        return '';
      }
    }

    return '';
  });

  // Hide the candidate navbar inside the recruiter portal
  const isRecruiterPage = location.pathname.startsWith('/recruiter');
  const isApplicationPage = location.pathname.includes('/apply');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, rgb(15, 23, 42), rgb(88, 28, 135), rgb(15, 23, 42))',
        color: '#fff',
      }}
    >
      {!isRecruiterPage && !isApplicationPage && (
        <>
          <Navbar
            username={username}
            onLogout={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUsername('');
              toast.success('You have successfully logged out!');
            }}
          />
          <div className="h-16" />
        </>
      )}

      <Routes>
        {/* Registration */}
        <Route path="/register" element={<RegisterChoice />} />

        <Route
          path="/register/job-seeker"
          element={<Register setUsername={setUsername} />}
        />

        <Route
          path="/register/recruiter"
          element={<RecruiterRegister />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login setUsername={setUsername} />}
        />

        {/* Candidate Pages */}
        <Route path="/" element={<Home username={username} />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/job/:id" element={<JobDetails />} />

        <Route
          path="/company/:recruiterId"
          element={<PublicCompanyProfile />}
        />

        <Route
          path="/jobs/:id/apply"
          element={<ApplicationPage />}
        />

        <Route
          path="/my-applications"
          element={
            localStorage.getItem('token') ? (
              <MyApplications />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/notifications"
          element={
            localStorage.getItem('token') &&
              JSON.parse(localStorage.getItem('user') || '{}').role === 'job_seeker' ? (
              <Notifications />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/about" element={<About />} />

        <Route path="/contact" element={<ContactUs />} />

        {/* Recruiter Portal */}
        <Route
          path="/recruiter"
          element={
            <RequireRecruiter>
              <RecruiterLayout />
            </RequireRecruiter>
          }
        >

          <Route
            path="dashboard"
            element={<RecruiterDashboard />}
          />

          <Route
            path="jobs"
            element={<ManageJobs />}
          />

          <Route
            path="jobs/new"
            element={<PostJob />}
          />

          <Route
            path="applicants"
            element={<Applicants />}
          />

          <Route
            path="interviews"
            element={<Interviews />}
          />

          <Route
            path="company"
            element={<CompanyProfile />}
          />

          <Route
            path="analytics"
            element={<Analytics />}
          />

          <Route
            path="settings"
            element={<Settings />}
          />

        </Route>

      </Routes>

      <ToastContainer />
    </div>
  );
}


function App() {
  return (
    <Router>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </Router>
  );
}

export default App;
