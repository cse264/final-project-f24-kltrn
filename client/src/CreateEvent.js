import React, { useContext } from 'react';

const CreateEvent = () => {
  const handleCreateEvent = () => {
    //create event functionality
  }
  return (
    <div>
      <h2>Create events here</h2>
      <button onClick={handleCreateEvent} className="create-event-button">
        Create New Event
      </button>
    </div>
  );
};

export default CreateEvent;