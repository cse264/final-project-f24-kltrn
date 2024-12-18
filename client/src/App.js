import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { UserProvider, UserContext } from './UserContext'; // Ensure to import UserContext
import MyCalendar from './MyCalendar';
import CreateEvent from './CreateEvent';
import Invitations from './Invitations';
import MyOrganizerEvents from './MyOrganizerEvents';
import MyInviteeEvents from './MyInviteeEvents';
import RegisterLogin from './RegisterLogin';
import pic from './planpallogo.png';
import './App.css';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="App">
          <header className="banner">
            <img src={pic} className="banner-logo" alt="PlanPal Logo" />
            <h1>PlanPal</h1>
            <nav>
              {/* Only render RoleBasedNav once role is available */}
              <RoleBasedNav />
            </nav>
          </header>

          <Routes>
            <Route path="/" element={<RegisterLogin />} /> 
            <Route path="/calendar" element={<MyCalendar />} />
            <Route path="/create" element={<CreateEvent />} />
            <Route path="/myorganizerevents" element={<MyOrganizerEvents />} />
            <Route path="/myinviteeevents" element={<MyInviteeEvents />} />
            <Route path="/invitations" element={<Invitations />} />
          </Routes>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
};

const RoleBasedNav = () => {
  const { user, logOut } = useContext(UserContext);
  const navigate = useNavigate(); 

  const handleLogout = () => {
    logOut(); 
    navigate('/');
  };

  if (!user || !user.role) {
    return <h2></h2>;
  }
  const { role } = user; 
  return (
    <>
      {role === 'Event Organizer' && (
        <>
          <h2><Link to="/calendar" className="nav-link">Google Calendar</Link></h2>
          <h2><Link to="/create" className="nav-link">Create Event</Link></h2>
          <h2><Link to="/myorganizerevents" className="nav-link">My Events</Link></h2>
          <h2><button onClick={handleLogout} className="nav-link">Log Out</button></h2>
        </>
      )}

      {role === 'Invitee' && (
        <>
          <h2><Link to="/calendar" className="nav-link">Google Calendar</Link></h2>
          <h2><Link to="/invitations" className="nav-link">Invitations</Link></h2>
          <h2><Link to="/myinviteeevents" className="nav-link">My Events</Link></h2>
          <h2><button onClick={handleLogout} className="nav-link">Log Out</button></h2>
        </>
      )}
    </>
  );
};

export default App;