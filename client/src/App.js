import React from 'react';
import RegisterLogin from './RegisterLogin';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './UserContext';
import Home from './Home';

const App = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <div>
          <Routes>
              <Route path="/" element={<RegisterLogin />}/>
              <Route path="/home" element={<Home />}/>
          </Routes>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
