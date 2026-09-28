import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ConfigMissing } from '@/components/layout/ConfigMissing';
import { FullPageLoader } from '@/components/layout/FullPageLoader';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/hooks/useToast';
import { isSupabaseConfigured } from '@/lib/supabase';
import Login from '@/pages/Login';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Weekly = lazy(() => import('@/pages/Weekly'));
const Taskboard = lazy(() => import('@/pages/Taskboard'));
const SprintBacklog = lazy(() => import('@/pages/SprintBacklog'));
const Remarques = lazy(() => import('@/pages/Remarques'));
const Performances = lazy(() => import('@/pages/Performances'));
const DesignSystem = lazy(() => import('@/pages/DesignSystem'));

export default function App() {
  if (!isSupabaseConfigured) return <ConfigMissing />;

  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<FullPageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="weekly" element={<Weekly />} />
                <Route path="taskboard" element={<Taskboard />} />
                <Route path="sprints" element={<SprintBacklog />} />
                <Route path="remarques" element={<Remarques />} />
                <Route path="performances" element={<Performances />} />
                <Route path="design" element={<DesignSystem />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
