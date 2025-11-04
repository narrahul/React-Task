import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login.jsx';
import UsersPage from './pages/Users.jsx';
import UserDetailPage from './pages/UserDetail.jsx';
import { useAuth } from './context/AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/users"
        element={(
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/users/:userName"
        element={(
          <ProtectedRoute>
            <UserDetailPage />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
