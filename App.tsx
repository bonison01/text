// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './page/HomePage';
import SupabaseContactsPage from './page/SupabaseContactsPage'; // You'll need to create this

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/supabase-contacts" element={<SupabaseContactsPage />} />
      </Routes>
    </Router>
  );
}
