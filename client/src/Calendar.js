import React, { useContext } from 'react';
import { UserContext } from './UserContext';

const Calendar = () => {
  const { userEmail } = useContext(UserContext);

  return (
    <div>
      <h2>This is your calendar</h2>
      <p>User: {userEmail}</p>
    </div>
  );
};

export default Calendar;