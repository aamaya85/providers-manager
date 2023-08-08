import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginScreen from './components/Login';
import Dashboard from './components/Dashboard';

const App = () => {
  return (
      <Router>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/providers" element={<Dashboard />} />
            <Route path="*" element={<LoginScreen />} />
          </Routes>
      </Router>
  );
}

export default App;
