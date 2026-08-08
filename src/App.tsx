import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import GroupPage from "./pages/GroupPage";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg text-text-main font-sans selection:bg-primary/20 selection:text-primary">
        <Navbar />
        <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/group/:id" element={<GroupPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
