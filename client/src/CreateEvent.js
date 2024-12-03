import React, { useState } from 'react';
import { useAuth } from './Authentication';

const CreateEvent = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [invitees, setInvitees] = useState('');
  const { isLoggedIn, userEmail } = useAuth();  // Get email from context

  const createEvent = async (e) => {
    e.preventDefault();

    if (!title || !date) {
      alert('Please fill in all required fields');
      return;
    }

    const event = {
      title: title,
      date: new Date(date).toISOString(),
      invitees: invitees.split(',').map(email => email.trim()),  // Process invitees as an array of emails
      creator: userEmail,  // Use logged-in user's email
    };

    if (!userEmail) {
      alert('Please log in to create an event');
      return;
    }

    try {
      // Replace with your MongoDB API URL
      const response = await fetch('https://your-api-url.com/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
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
      {isLoggedIn ? (
        <form onSubmit={createEvent}>
          <div>
            <label htmlFor="title">Event Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="date">Event Date and Time:</label>
            <input
              type="datetime-local"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="invitees">Invitees (comma-separated emails):</label>
            <input
              type="text"
              id="invitees"
              value={invitees}
              onChange={(e) => setInvitees(e.target.value)}
            />
          </div>
          <button type="submit">Create Event</button>
        </form>
      ) : (
        <p>You must be logged in to create an event.</p>
      )}
    </div>
  );
};

export default CreateEvent;
