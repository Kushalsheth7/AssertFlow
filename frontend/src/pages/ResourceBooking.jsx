import React, { useState, useEffect } from 'react';
import { getDB, initDB, saveDB, getCurrentUser } from '../store/dataStore';
import './ResourceBooking.css';

const ResourceBooking = () => {
  const [db, setDb] = useState(null);
  const [selectedResource, setSelectedResource] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [bookingError, setBookingError] = useState('');
  
  const currentUser = getCurrentUser();

  useEffect(() => {
    initDB().then(setDb);
  }, []);

  if (!db) return <div>Loading...</div>;

  const sharedResources = db.assets.filter(a => a.isShared);

  const handleBooking = (e) => {
    e.preventDefault();
    setBookingError('');

    if (!selectedResource) {
      setBookingError('Please select a resource.');
      return;
    }

    if (startTime >= endTime) {
      setBookingError('End time must be after start time.');
      return;
    }

    // Overlap validation
    const resourceBookings = db.bookings.filter(b => b.assetId === selectedResource && b.date === bookingDate && b.status !== 'Cancelled');
    
    const hasOverlap = resourceBookings.some(b => {
      // Check if new booking overlaps with existing booking
      // New booking starts before existing ends AND new booking ends after existing starts
      return (startTime < b.endTime && endTime > b.startTime);
    });

    if (hasOverlap) {
      setBookingError('This time slot overlaps with an existing booking. Please choose another time.');
      return;
    }

    const newBooking = {
      id: Date.now().toString(),
      assetId: selectedResource,
      userId: currentUser.id,
      date: bookingDate,
      startTime,
      endTime,
      status: 'Upcoming'
    };

    const updatedDb = { ...db };
    updatedDb.bookings.push(newBooking);
    updatedDb.notifications.push({
      id: Date.now().toString(),
      message: `Booking confirmed for ${sharedResources.find(r => r.id === selectedResource)?.name} on ${bookingDate} at ${startTime}`,
      date: new Date().toISOString()
    });

    setDb(updatedDb);
    saveDB(updatedDb);
  };

  const cancelBooking = (bookingId) => {
    const updatedDb = { ...db };
    const bookingIndex = updatedDb.bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
      updatedDb.bookings[bookingIndex].status = 'Cancelled';
      setDb(updatedDb);
      saveDB(updatedDb);
    }
  };

  // Generate time slots for display (08:00 to 18:00)
  const timeSlots = Array.from({length: 11}, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const getBookingsForResourceAndDate = () => {
    if (!selectedResource) return [];
    return db.bookings.filter(b => b.assetId === selectedResource && b.date === bookingDate && b.status !== 'Cancelled');
  };

  const currentBookings = getBookingsForResourceAndDate();

  return (
    <div className="resource-booking">
      <div className="page-header">
        <h1>Resource Booking</h1>
        <p>Book shared rooms, vehicles, and equipment.</p>
      </div>

      <div className="booking-container">
        <div className="panel booking-form-panel">
          <h2>New Booking</h2>
          {bookingError && <div className="error-message">{bookingError}</div>}
          
          <form onSubmit={handleBooking} className="booking-form">
            <div className="form-group">
              <label>Select Resource</label>
              <select value={selectedResource} onChange={e => setSelectedResource(e.target.value)} required>
                <option value="" disabled>-- Choose a shared resource --</option>
                {sharedResources.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn primary mt-2">Book Resource</button>
          </form>
        </div>

        <div className="panel schedule-panel">
          <div className="schedule-header">
            <h2>Schedule for {bookingDate}</h2>
            <span className="resource-name">
              {selectedResource ? sharedResources.find(r => r.id === selectedResource)?.name : 'Select a resource to view schedule'}
            </span>
          </div>

          <div className="calendar-view">
            {timeSlots.map(time => {
              // Very simple visual representation
              const bookingAtTime = currentBookings.find(b => b.startTime <= time && b.endTime > time);
              
              return (
                <div key={time} className={`time-slot ${bookingAtTime ? 'booked' : 'free'}`}>
                  <div className="time-label">{time}</div>
                  <div className="slot-content">
                    {bookingAtTime ? (
                      <div className="booking-block">
                        <span className="booking-user">Booked by {db.users.find(u => u.id === bookingAtTime.userId)?.name}</span>
                        <span className="booking-time">{bookingAtTime.startTime} - {bookingAtTime.endTime}</span>
                        {bookingAtTime.userId === currentUser.id && (
                          <button className="btn ghost cancel-btn" onClick={() => cancelBooking(bookingAtTime.id)}>Cancel</button>
                        )}
                      </div>
                    ) : (
                      <span className="free-text">Available</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>My Upcoming Bookings</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Resource</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {db.bookings.filter(b => b.userId === currentUser.id).map(b => {
              const resource = db.assets.find(a => a.id === b.assetId);
              return (
                <tr key={b.id}>
                  <td>{resource?.name}</td>
                  <td>{b.date}</td>
                  <td>{b.startTime} - {b.endTime}</td>
                  <td><span className={`badge ${b.status === 'Cancelled' ? 'danger' : 'info'}`}>{b.status}</span></td>
                  <td>
                    {b.status !== 'Cancelled' && (
                      <button className="btn-small danger" onClick={() => cancelBooking(b.id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              )
            })}
            {db.bookings.filter(b => b.userId === currentUser.id).length === 0 && (
              <tr>
                <td colSpan="5" className="text-center">You have no bookings.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceBooking;
