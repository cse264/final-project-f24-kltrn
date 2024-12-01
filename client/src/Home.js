import React, { useContext } from 'react';
import { UserContext } from './UserContext';
import './Home.css';

const Home = () => {
  const { userEmail } = useContext(UserContext);

  return (
    <div>
      <h2>Welcome!</h2>
      <p>User: {userEmail}</p>
    </div>
  );
};

export default Home;