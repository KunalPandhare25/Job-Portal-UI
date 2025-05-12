import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import Plans from './pages/Plans';
import JobDetails from './pages/JobDetails'; 

function App() {
  const [username, setUsername] = useState('');

  return (
    <Router>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, rgb(15, 23, 42), rgb(88, 28, 135), rgb(15, 23, 42))',
        color: '#fff',
      }}>
        <Navbar username={username} onLogout={() => {
          setUsername('');
          toast.success("You have successfully logged out!");
        }} />

        <Routes>
          <Route path="/register" element={<Register setUsername={setUsername} />} />
          <Route path="/login" element={<Login setUsername={setUsername} />} />
          <Route path="/" element={<Home username={username} />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/job/:id" element={<JobDetails />} /> {/* ✅ Add this line */}
        </Routes>

        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
