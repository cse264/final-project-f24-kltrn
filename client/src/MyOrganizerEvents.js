import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';
import './App.css';

const MyOrganizerEvents = () => {
  const [response, setAnswer] = useState([]); // Initialize as an empty array
  const { user } = useContext(UserContext);
  const [hasEvents, setHasEvents] = useState(true);

  async function getEvents() {
    try {
      console.log(user.userId);
      const answer = await fetch(`http://localhost:8000/events/organizer/${user.userId}`);
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

  const handleEdit = (eventId) => {
    // Logic to edit the event (e.g., open an edit form or modal)
    console.log('Edit event', eventId);
  };

  const handleDelete =  async (eventId) => {
    try {
      const response = await fetch(`http://localhost:8000/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error deleting event');
      }

      const result = await response.json();
      console.log('Event deleted:', result);
      alert('Event deleted successfully!');
      setAnswer(prevEvents => prevEvents.filter(event => event._id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  };

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
          <div className="event-container">
          {response.map((item, index) => (
            <div key={index}>
              <h3>{item.title}</h3>
              <p>Description: {item.description}</p>
              <p>Location: {item.location}</p>
              <p>Start: {new Date(item.startTime).toLocaleString()}</p>
              <p>End: {new Date(item.endTime).toLocaleString()}</p>

              <div className="event-actions">
                  <button onClick={() => handleEdit(item._id)} className="edit-btn">
                    <i className="fas fa-pencil-alt"></i> Edit
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="delete-btn">
                    <i className="fas fa-trash-alt"></i> Delete
                  </button>
                </div>
            </div>
          ))}
          </div>
        </div>
      ) : (
        <div>
          <h2>No events</h2>
        </div>
      )}
    </div>
  );
};

export default MyOrganizerEvents;
