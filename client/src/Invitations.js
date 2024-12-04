import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';
import './Invitations.css';

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
        const response = await fetch(`http://localhost:8000/invitations/${user.userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch invitations');
        }
        const data = await response.json();
        setInvitations(data.invitations);
      } catch (err) {
        console.log('Error fetching invitations');
      }
    };
    getInvitations();
  }, [user]);

  // Update status to "accepted" or "declined"
  const updateInvitationStatus = async(invitationId, status) => {
    try{
      const response = await fetch(`http://localhost:8000/invitations/${invitationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update invitation status');
      }

      const updatedInvitation = await response.json();
      setInvitations((prev) =>
        prev.map((invitation) =>
          invitation.invitationId === invitationId ? updatedInvitation.invitation : invitation
        )
      );
    } catch (err) {
      console.log('Error updating invitation status: ', err);
      setError('Error updating invitation status.');
    }
  }

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
              <p className="status"><strong>Status:</strong> {invitation.status ? invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1) : ''}</p>
              <div className="invitation-status-buttons">
                <button onClick={() => updateInvitationStatus(invitation.invitationId, 'accepted')}>Accept</button>
                <button onClick={() => updateInvitationStatus(invitation.invitationId, 'declined')}>Decline</button>
              </div>
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