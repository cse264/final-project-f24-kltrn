import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';


const Invitations = () => {
  const { user } = useContext(UserContext);
  const [invitations, setInvitations] = useState([]);
  const [error, setError] = useState(null);

  //get the invitations of current user
  useEffect(() => {
    const getInvitations = async () => {
      if (!user) {
        setError('User not logged in.');
        return;
      }
      try {
        const response = await fetch(`http://localhost:3000/invitations/${user.id}`);
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
    <div className="invitations-container">
      <h2>View your invitations here</h2>
      <div className="invitations-list">
        {invitations.length > 0 ? (
          invitations.map((invitation) => (
            <div key={invitation.invitationId} className="invitation-card">
              <h3>{invitation.event.title}</h3>
              <p><strong>Description:</strong> {invitation.event.description || ''}</p>
              <p><strong>Location:</strong> {invitation.event.location || ''}</p>
              <p><strong>Start Time:</strong> {new Date(invitation.event.startTime || '').toLocaleString()}</p>
              <p><strong>End Time:</strong> {new Date(invitation.event.endTime || '').toLocaleString()}</p>
              <p className="status"><strong>Status:</strong> {invitation.status || ''}</p>
            </div>
          ))
        ) : (
          <p>No invitations available.</p>
        )}
      </div>
    </div>
  );
};

export default Invitations;