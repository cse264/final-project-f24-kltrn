// import React, { useState } from 'react';
// // import { useAuth } from './Authentication';

// const CreateEvent = () => {
//   const { userEmail, isLoggedIn } = useAuth(); // Assuming userEmail is part of the auth context
//   const [title, setTitle] = useState('');
//   const [startTime, setStartTime] = useState('');
//   const [endTime, setEndTime] = useState('');
//   const [invitees, setInvitees] = useState('');

//   const handleCreateEvent = async (e) => {
//     e.preventDefault(); // Prevent form submission

//     if (!title || !startTime || !endTime || !userEmail) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     if (!userEmail) {
//       alert('Please log in to create an event');
//       return;
//     }

//     const event = {
//       title: title,
//       startTime: new Date(startTime).toISOString(),
//       endTime: new Date(endTime).toISOString(),
//       userId: userEmail, 
//       invitees: invitees.split(',').map(email => email.trim()),
//     };

//     try {
//       // Replace with your MongoDB API URL
//       const response = await fetch('http://localhost:8000/events', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(event),
//         credentials: 'include',
//       });

//       if (!response.ok) {
//         throw new Error('Error creating event');
//       }

//       const result = await response.json();
//       console.log('Event created:', result);
//       alert('Event created successfully!');
//     } catch (error) {
//       console.error('Error creating event:', error);
//       alert('Error creating event. Please try again.');
//     }
//   };

//   return (
//     <div>
//       <h2>Create an Event</h2>
//       {isLoggedIn ? (
//         <form onSubmit={handleCreateEvent}>
//           <div>
//             <label htmlFor="title">Event Title:</label>
//             <input
//               type="text"
//               id="title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="startTime">Event Start Time:</label>
//             <input
//               type="datetime-local"
//               id="startTime"
//               value={startTime}
//               onChange={(e) => setStartTime(e.target.value)}
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="endTime">Event End Time:</label>
//             <input
//               type="datetime-local"
//               id="endTime"
//               value={endTime}
//               onChange={(e) => setEndTime(e.target.value)}
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="invitees">Invitees (comma-separated emails):</label>
//             <input
//               type="text"
//               id="invitees"
//               value={invitees}
//               onChange={(e) => setInvitees(e.target.value)}
//             />
//           </div>
//           <button type="submit">Create Event</button>
//         </form>
//       ) : (
//         <p>You must be logged in to create an event.</p>
//       )}
//     </div>
//   );
// };

// export default CreateEvent;

import React, { useState, useEffect } from 'react';

const CreateEvent = () => {
  const [email, setEmail] = useState(null); // Store user email
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Store login state
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [invitees, setInvitees] = useState('');

  // Check login state and email from local storage or cookies
  useEffect(() => {
    const storedEmail = localStorage.getItem('email'); // Retrieve email from localStorage
    const loggedInState = localStorage.getItem('isLoggedIn'); // Retrieve login state from localStorage

    if (storedEmail && loggedInState === 'true') {
      setEmail(storedEmail);
      setIsLoggedIn(true);
    }
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault(); // Prevent form submission

    if (!title || !startTime || !endTime || !email) {
      alert('Please fill in all required fields');
      return;
    }

    if (!email) {
      alert('Please log in to create an event');
      return;
    }

    const event = {
      title: title,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      userId: email, // Use email as user ID
      invitees: invitees.split(',').map(email => email.trim()), // Process invitees
    };

    try {
      // Replace with your API URL
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
      {isLoggedIn ? (
        <form onSubmit={handleCreateEvent}>
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
            <label htmlFor="startTime">Event Start Time:</label>
            <input
              type="datetime-local"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="endTime">Event End Time:</label>
            <input
              type="datetime-local"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
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
