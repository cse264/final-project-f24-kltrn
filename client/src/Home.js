import React, { useContext } from 'react';
import { UserContext } from './UserContext';

const Home = () => {
  const { userEmail } = useContext(UserContext);

  return (
    <div>
      <h2>Home page</h2>
      <p>User: {userEmail}</p>
    </div>
  );
};

export default Home;