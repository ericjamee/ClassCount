import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import TeacherPage from './pages/TeacherPage';
import SchoolsPage from './pages/SchoolsPage';
import AdminDashboard from './pages/AdminDashboard';

/**
 * Main App component with routing
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/teacher" replace />} />
          <Route path="teacher" element={<TeacherPage />} />
          <Route path="schools" element={<SchoolsPage />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
