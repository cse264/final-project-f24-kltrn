import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState('');
  const [role, setRole] = useState('');

  return (
    <UserContext.Provider value={{ userEmail, setUserEmail, role, setRole }}>
      {children}
    </UserContext.Provider>
  );
};
