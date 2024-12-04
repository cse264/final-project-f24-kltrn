import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';
import { set } from 'mongoose';


const MyEvents = () => {
  const [response,setAnswer] = useState(undefined);
  const { user } = useContext(UserContext);
  const [hasEvents, setHasEvents] = useState(true);
   
  async function getEvents(){
    try{
      console.log(user.userId);
      const answer = await fetch(`http://localhost:8000/events/${user.userId}`);
      const data = await answer.json();
      setHasEvents(true);
      return data;
    }catch (error) {
      console.error('Error creating event:', error);
      setHasEvents(false);
    }
  }
  useEffect(() => {
    async function fetchData() {
      const events = await getEvents();
      setAnswer(events);
    }
    fetchData();
  }, [user.Id]);
  console.log(response);
  return (
    <div>
      <h2>View your events here</h2>

      {/* {response && hasEvents && (
      <div>
        {response.map((item,index)=>(
          <div key={index}>
            {item["title"]}
          </div>
        ))}
      </div>
      )}
      {!response && (
        <div>
          <h2>No events</h2>
        </div>
      )} */}
    </div>
  );
};

export default MyEvents;