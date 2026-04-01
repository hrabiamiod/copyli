import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CityPage from "./pages/CityPage";
import VoivodeshipPage from "./pages/VoivodeshipPage";
import CalendarPage from "./pages/CalendarPage";
import GAPageTracker from "./components/GAPageTracker";

export default function App() {
  return (
    <BrowserRouter>
      <GAPageTracker />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pylek/:miasto" element={<CityPage />} />
          <Route path="/pylek/woj/:wojewodztwo" element={<VoivodeshipPage />} />
          <Route path="/kalendarz-pylenia" element={<CalendarPage />} />
          <Route path="*" element={
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
              <p className="text-5xl mb-4">🌿</p>
              <h1 className="text-xl font-bold text-gray-800 mb-2">Strona nie znaleziona</h1>
              <a href="/" className="text-green-700 underline">Wróć do mapy</a>
            </div>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
