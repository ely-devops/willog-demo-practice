import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { JourneyDetailPage } from '@/pages/journey/JourneyDetailPage';
import { RegisterPage } from '@/pages/register/RegisterPage';
import { ManagementPage } from '@/pages/management/ManagementPage';
import { IntelligencePage } from '@/pages/intelligence/IntelligencePage';
import { HistoryPage } from '@/pages/history/HistoryPage';

// Legacy journey redirect components
const LegacyJourneyRedirect = () => {
  const { journeyId } = useParams<{ journeyId: string }>();
  // Determine domain based on journeyId pattern
  // Bio journeys: ID-SC05, ID-SC06, ID-SC07, ID-SC08, ID-SC09
  // Semicon journeys: All others (ID-SC01, ID-SC02, ID-SC03, ID-SC04)
  const isBioJourney = journeyId?.match(/^ID-SC0[5-9]$/);
  const domain = isBioJourney ? 'lifesciences' : 'hightech';
  return <Navigate to={`/journey/${domain}/${journeyId}`} replace />;
};

const HighTechJourneyRedirect = () => {
  const { journeyId } = useParams<{ journeyId: string }>();
  return <Navigate to={`/journey/hightech/${journeyId}`} replace />;
};

const LifeSciencesJourneyRedirect = () => {
  const { journeyId } = useParams<{ journeyId: string }>();
  return <Navigate to={`/journey/lifesciences/${journeyId}`} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes with Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Root redirect to hightech dashboard */}
          <Route index element={<Navigate to="/dashboard/hightech" replace />} />

          {/* Dashboard routes */}
          <Route path="dashboard/hightech" element={<DashboardPage bizCase="semicon" />} />
          <Route path="dashboard/lifesciences" element={<DashboardPage bizCase="bio" />} />

          {/* Journey detail routes */}
          <Route path="journey/hightech/:journeyId" element={<JourneyDetailPage bizCase="semicon" />} />
          <Route path="journey/lifesciences/:journeyId" element={<JourneyDetailPage bizCase="bio" />} />

          {/* Legacy redirects */}
          <Route path="dashboard" element={<Navigate to="/dashboard/hightech" replace />} />
          <Route path="hightech" element={<Navigate to="/dashboard/hightech" replace />} />
          <Route path="hightech/journey/:journeyId" element={<HighTechJourneyRedirect />} />
          <Route path="lifesciences" element={<Navigate to="/dashboard/lifesciences" replace />} />
          <Route path="lifesciences/journey/:journeyId" element={<LifeSciencesJourneyRedirect />} />
          <Route path="journey/:journeyId" element={<LegacyJourneyRedirect />} />

          {/* Other routes */}
          <Route path="register" element={<RegisterPage />} />
          <Route path="management" element={<ManagementPage />} />
          <Route path="intelligence" element={<IntelligencePage />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
