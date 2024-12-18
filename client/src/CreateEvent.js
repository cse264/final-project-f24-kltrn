import React, { useState, useContext } from 'react';
import { UserContext } from './UserContext';
import './App.css';

const CreateEvent = () => {
  const { user } = useContext(UserContext);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [invitees, setInvitees] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!title || !startTime || !endTime) {
      alert('Please fill in all required fields');
      return;
    }

    if (!user.userId) {
      alert('Please log in to create an event');
      return;
    }

    const event = {
      title: title,
      description: description,
      location: location,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      organizerId: user.userId, 
      invitees: invitees.split(',').map(email => email.trim()),
    };

    try {
      const response = await fetch('http://localhost:8000/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error creating event');
      }

      const result = await response.json();
      console.log('Event created:', result);
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    }
  };

  return (
    <div>
      <h2>Create an Event</h2>
      <div className="form-container">
      {user.userId ? (
        <form onSubmit={handleCreateEvent} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="desc">Description:</label>
            <input
              type="text"
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="loc">Location:</label>
            <input
              type="text"
              id="loc"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="startTime">Event Start Time:</label>
            <input
              type="datetime-local"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="endTime">Event End Time:</label>
            <input
              type="datetime-local"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
          <div className="form-group invitees-group">
            <label htmlFor="invitees">Invitees (comma-separated emails):</label>
            <input
              type="text"
              id="invitees"
              value={invitees}
              onChange={(e) => setInvitees(e.target.value)}
            />
          </div>
          <button id="authorize_button" type="submit">Create Event</button>
        </form>
      ) : (
        <p>You must be logged in to create an event.</p>
      )}
      </div>
    </div>
  );
};

export default CreateEvent;
