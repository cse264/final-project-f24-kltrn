import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';

const MyInviteeEvents = () => {
  const [response, setAnswer] = useState([]); // Initialize as an empty array
  const { user } = useContext(UserContext);
  const [hasEvents, setHasEvents] = useState(true);

  async function getEvents() {
    try {
      console.log(user.userId);
      const answer = await fetch(`http://localhost:8000/events/invitee/${user.userId}`);
      const data = await answer.json();
      if (data.events && Array.isArray(data.events)) {
        setAnswer(data.events); 
      } else {
        setAnswer([]); 
        setHasEvents(false);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setHasEvents(false);
    }
  }

  useEffect(() => {
    async function fetchData() {
      await getEvents();
    }
    fetchData();
  }, []);

  return (
    <div className="event-container">
      <h2 className="event-header">Your events:</h2>
      {response.length > 0 && hasEvents ? (
        <div className="event-grid">
          {response.map((item, index) => (
            <div key={index} className="event-card">
              <h3 className="event-title">{item.title}</h3>
              <p className="event-description">{item.description}</p>
              <p className="event-location">{item.location}</p>
              <p className="event-time">
                <strong>Starts:</strong> {new Date(item.startTime).toLocaleString()} <br />
                <strong>Ends:</strong> {new Date(item.endTime).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-events">
          <h2>No events</h2>
        </div>
      )}
    </div>
  );
};

export default MyInviteeEvents;
