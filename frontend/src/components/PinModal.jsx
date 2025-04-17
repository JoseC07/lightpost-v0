import React, { useState } from 'react';
import PropTypes from 'prop-types';

function PinModal({ onClose, onPin }) {
  const [text, setText] = useState('');
  const [location, setLocation] = useState('Near Austin'); // Default as requested

  const handleSubmit = (event) => {
    event.preventDefault(); // Stop the default form submission bullshit
    if (!text.trim()) {
      alert('You need to write something, dumbass!'); // Friendly reminder
      return;
    }
    onPin({ text: text.trim(), location });
    // onClose(); // App.jsx now handles closing after emit
  };

  return (
    <div className="modal-overlay" onClick={onClose}> {/* Close on overlay click */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Stop click propagation */}
        <h2>Pin a New Board</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="What's your vibe?" // User-friendly placeholder
            value={text}
            onChange={(e) => setText(e.target.value)}
            required // Make it mandatory, no empty posts
            autoFocus // Focus this field when modal opens
          />
          <input
            type="text"
            placeholder="Location (e.g., Near Austin)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required // Location is important too
          />
          <div className="modal-actions">
            <button type="button" className="modal-button cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-button pin-button">
              Pin It!
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// More PropTypes for good measure
PinModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onPin: PropTypes.func.isRequired,
};

export default PinModal; 