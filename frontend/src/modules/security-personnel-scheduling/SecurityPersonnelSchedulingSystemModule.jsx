```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'tailwindcss/tailwind.css';

toast.configure();

const SecurityPersonnelSchedulingSystemModule = () => {
  const [shifts, setShifts] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    fetchShifts();
    fetchPersonnel();
  }, []);

  const fetchShifts = async () => {
    const res = await axios.get('/api/shifts');
    setShifts(res.data);
  };

  const fetchPersonnel = async () => {
    const res = await axios.get('/api/personnel');
    setPersonnel(res.data);
  };

  const checkForConflicts = () => {
    const conflicts = shifts.filter((shift, index, self) =>
      self.findIndex(
        t => t.personnelId === shift.personnelId && t.time === shift.time
      ) !== index
    );
    setConflicts(conflicts);
  };

  const sendShiftReminders = () => {
    personnel.forEach(person => {
      const personShifts = shifts.filter(shift => shift.personnelId === person.id);
      if (personShifts.length > 0) {
        toast.info(`Reminder: You have a shift coming up at ${personShifts[0].time}`);
      }
    });
  };

  useEffect(() => {
    checkForConflicts();
    sendShiftReminders();
  }, [shifts, personnel]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Security Personnel Scheduling System</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <h2 className="text-xl font-bold mb-2">Shifts</h2>
          {shifts.map(shift => (
            <div key={shift.id} className="border p-2 mb-2">
              <p><strong>Personnel ID:</strong> {shift.personnelId}</p>
              <p><strong>Time:</strong> {shift.time}</p>
            </div>
          ))}
        </div>
        <div className="col-span-1">
          <h2 className="text-xl font-bold mb-2">Personnel</h2>
          {personnel.map(person => (
            <div key={person.id} className="border p-2 mb-2">
              <p><strong>ID:</strong> {person.id}</p>
              <p><strong>Name:</strong> {person.name}</p>
            </div>
          ))}
        </div>
        <div className="col-span-1">
          <h2 className="text-xl font-bold mb-2">Conflicts</h2>
          {conflicts.map(conflict => (
            <div key={conflict.id} className="border p-2 mb-2">
              <p><strong>Personnel ID:</strong> {conflict.personnelId}</p>
              <p><strong>Time:</strong> {conflict.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecurityPersonnelSchedulingSystemModule;
```

Please note that this is a simplified version of a security personnel scheduling system. In a real-world application, you would need to handle more complex scenarios, such as handling different types of shifts, managing personnel availability, integrating with a payroll system, and providing more detailed reporting and analytics. You would also need to handle errors and edge cases, and ensure that your application is secure and performant.