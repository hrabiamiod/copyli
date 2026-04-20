import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import AuthGuard from "./components/AuthGuard";
import HomePage from "./pages/HomePage";
import CityPage from "./pages/CityPage";
import VoivodeshipPage from "./pages/VoivodeshipPage";
import CalendarPage from "./pages/CalendarPage";
import PlantPage from "./pages/PlantPage";
import ComparePage from "./pages/ComparePage";
import PlantsIndexPage from "./pages/PlantsIndexPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ProfilePage from "./pages/ProfilePage";
import DiaryPage from "./pages/DiaryPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import AdminMfaPage from "./pages/AdminMfaPage";
import AdminMfaSetupPage from "./pages/AdminMfaSetupPage";
import AdminGuard from "./components/AdminGuard";
import GAPageTracker from "./components/GAPageTracker";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GAPageTracker />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/* Auth — publiczne */}
            <Route path="/logowanie" element={<LoginPage />} />
            <Route path="/rejestracja" element={<RegisterPage />} />
            <Route path="/zapomnialem-hasla" element={<ForgotPasswordPage />} />
            <Route path="/resetuj-haslo" element={<ResetPasswordPage />} />
            <Route path="/weryfikacja-email" element={<VerifyEmailPage />} />

            {/* Auth — chronione (placeholder do Fazy 4) */}
            <Route path="/profil" element={<AuthGuard><ProfilePage /></AuthGuard>} />
            <Route path="/dziennik" element={<AuthGuard><DiaryPage /></AuthGuard>} />
            <Route path="/ustawienia" element={<AuthGuard><SettingsPage /></AuthGuard>} />
            <Route path="/admin" element={<AdminGuard><AdminPage /></AdminGuard>} />
            <Route path="/admin/mfa" element={<AdminGuard><AdminMfaPage /></AdminGuard>} />
            <Route path="/admin/mfa-setup" element={<AdminGuard><AdminMfaSetupPage /></AdminGuard>} />

            {/* Mapa i treści */}
            <Route path="/pylek/rosliny" element={<PlantsIndexPage />} />
            <Route path="/pylek/roslina/:roslina" element={<PlantPage />} />
            <Route path="/pylek/woj/:wojewodztwo" element={<VoivodeshipPage />} />
            <Route path="/pylek/:miasto" element={<CityPage />} />
            <Route path="/porownaj/:miasto1/:miasto2" element={<ComparePage />} />
            <Route path="/kalendarz-pylenia" element={<CalendarPage />} />
            <Route path="/regulamin" element={<TermsPage />} />
            <Route path="/polityka-prywatnosci" element={<PrivacyPage />} />

            <Route path="*" element={
              <div className="max-w-xl mx-auto px-4 py-16 text-center">
                <p className="text-5xl mb-4">🌿</p>
                <h1 className="text-xl font-bold text-gray-800 mb-2">Strona nie znaleziona</h1>
                <a href="/" className="text-green-700 underline">Wróć do mapy</a>
              </div>
            } />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
