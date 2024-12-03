import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { UserProvider } from './UserContext';
import MyCalendar from './MyCalendar';
import CreateEvent from './CreateEvent';
import Invitations from './Invitations';
import MyEvents from './MyEvents';
import RegisterLogin from './RegisterLogin';
import pic from './planpallogo.png';
import './App.css';


function App () {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="App">
        <header className="banner">
            <img src={pic} className="banner-logo" />
            <h1>PlanPal</h1>
            <nav>
              <h2><Link to="/calendar" className="nav-link">Google Calendar</Link></h2>  
              <h2><Link to="/create" className="nav-link">Create Event</Link></h2>
              <h2><Link to="/myevents" className="nav-link">My Events</Link></h2>
              <h2><Link to="/invitations" className="nav-link">Invitations</Link></h2>
            </nav>
          </header>

          <Routes>
            <Route path="/" element={<RegisterLogin />} /> 
            <Route path="/calendar" element={<MyCalendar />} />
            <Route path="/create" element={<CreateEvent />} />
            <Route path="/myevents" element={<MyEvents />} />
            <Route path="/invitations" element={<Invitations />} />
          </Routes>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
