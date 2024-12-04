import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';
import './MyOrganizerEvents.css';

const MyOrganizerEvents = () => {
  const [response, setAnswer] = useState([]); 
  const { user } = useContext(UserContext);
  const [hasEvents, setHasEvents] = useState(true);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [invitees, setInvitees] = useState('');


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
    const event = response.find((item) => item._id === eventId);
  
    if (!event) {
      console.error('Event not found for editing');
      return;
    }
  
    // Helper function to format date
    const formatDate = (date) => {
      const d = new Date(date);
      return d.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
    };
  
    setEditingEvent(event);
    setTitle(event.title || '');
    setDescription(event.description || '');
    setLocation(event.location || '');
    setStartTime(formatDate(event.startTime) || ''); // Ensure correct format
    setEndTime(formatDate(event.endTime) || ''); // Ensure correct format
    setInvitees(event.invitees && Array.isArray(event.invitees) ? event.invitees.join(', ') : '');
    setEditModalVisible(true);
  };
  
  const handleSaveEdit = async () => {
    const updatedEvent = {
      title,
      description,
      location,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      invitees: invitees.split(',').map((email) => email.trim()), // Ensure invitees are formatted correctly
    };
  
    try {
      const response = await fetch(`http://localhost:8000/events/${editingEvent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });
  
      if (!response.ok) throw new Error('Error updating event');
  
      const updatedEventData = await response.json(); // Parse the JSON response
  
      // Update the state to reflect the changes
      setAnswer((prevEvents) =>
        prevEvents.map((event) =>
          event._id === updatedEventData.event._id
            ? { ...event, ...updatedEventData.event }
            : event
        )
      );
      alert('Event updated successfully!');
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error updating event. Please try again.');
    }
  
    setEditModalVisible(false);
  };
  
  const handleDelete = async (eventId) => {
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
      setAnswer((prevEvents) => prevEvents.filter((event) => event._id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  };
  
  useEffect(() => {
    getEvents();
  }, []);
  
  return (
    <div className="container">
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
              <div className="form-container">
                <button onClick={() => handleEdit(item._id)} className="btn">Edit</button>
                <button onClick={() => handleDelete(item._id)} className="btn">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-events">
          <h2>No events</h2>
        </div>
      )}
      {isEditModalVisible && (
        <div className="modal">
          <form className="event-form">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            <button className="btn" type="button" onClick={handleSaveEdit}>
              Save
            </button>
            <button className="btn" type="button" onClick={() => setEditModalVisible(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
  };
  
  export default MyOrganizerEvents;
  