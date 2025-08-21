import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import JudgeLoginPage from './pages/JudgeLoginPage';
import JudgeDashboardPage from './pages/JudgeDashboardPage';
import { Background } from './components/Background';

function App() {
  return (
    <>
      <Background />
      <div className="min-h-screen font-sans relative z-10">
        <Routes>
          <Route path="/" element={<JudgeLoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/judge/:secretId" element={<JudgeDashboardPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;