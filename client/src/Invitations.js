import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';


const Invitations = () => {
  const { user } = useContext(UserContext);
  const [invitations, setInvitations] = useState([]);
  const [error, setError] = useState(null);

  //get the invitations of current user
  useEffect(() => {
    console.log("Current user invitations:", user);
    const getInvitations = async () => {
      if (!user || !user.userId) {
        setError('User not logged in.');
        return;
      }
      try {
        const response = await fetch(`http://localhost:3000/invitations/${user.userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch invitations');
        }
        const data = await response.json();
        setInvitations(data.invitations);
      } catch (err) {
        console.error('Error fetching invitations:', err);
        setError('Error fetching invitations.');
      }
    };
    getInvitations();
  }, [user]);

  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div>
      <h2>View your invitations here</h2>
      <ul>
        {invitations.map((invitation, index) => (
          <li key={index}>{invitation.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Invitations;