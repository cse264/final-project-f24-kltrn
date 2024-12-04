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
    <div>
      <h2>Your events:</h2>

      {response.length > 0 && hasEvents ? (
        <div>
          {response.map((item, index) => (
            <div key={index}>
              <h3>{item.title}</h3>
              <p>Description: {item.description}</p>
              <p>Location: {item.location}</p>
              <p>Start: {new Date(item.startTime).toLocaleString()}</p>
              <p>End: {new Date(item.endTime).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h2>No events</h2>
        </div>
      )}
    </div>
  );
};

export default MyInviteeEvents;
