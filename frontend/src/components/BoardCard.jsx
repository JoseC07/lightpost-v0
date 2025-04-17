import React, { useState } from 'react';
import PropTypes from 'prop-types';

function BoardCard({ board, isExpanded, onExpand, onReply }) {
  const [replyText, setReplyText] = useState('');

  // Handle input change for the reply
  const handleInputChange = (event) => {
    setReplyText(event.target.value);
  };

  // Handle submitting the reply (e.g., on Enter key press)
  const handleReplySubmit = (event) => {
    if (event.key === 'Enter' && replyText.trim()) {
      onReply(board.id, replyText.trim());
      setReplyText(''); // Clear the input field like a clean freak
    }
  };

  return (
    <div className="board-card" onClick={!isExpanded ? onExpand : undefined}>
      <div className="board-text">{board.text}</div>
      <div className="board-location">{board.location}</div>

      {/* Only show replies section if expanded */}
      {isExpanded && (
        <div className="replies-section">
          {board.replies && board.replies.length > 0 ? (
            board.replies.map((reply, index) => (
              <div key={index} className="reply">{reply}</div>
            ))
          ) : (
            <div className="reply" style={{ fontStyle: 'italic', color: '#888' }}>No replies yet. Start the fucking conversation.</div>
          )}
          <input
            type="text"
            className="reply-input"
            placeholder="Drop your reply here... (Hit Enter)"
            value={replyText}
            onChange={handleInputChange}
            onKeyDown={handleReplySubmit}
            onClick={(e) => e.stopPropagation()} // Stop click from closing the card
          />
        </div>
      )}

      {/* Show reply count or prompt to expand */}
      <div className="reply-info" onClick={isExpanded ? onExpand : undefined}>
        <span className="reply-count">
          {board.replies ? `${board.replies.length} replies` : '0 replies'}
        </span>
        <span>{isExpanded ? 'Click to collapse' : 'Click to see replies'}</span>
      </div>
    </div>
  );
}

// Prop validation like a pro
BoardCard.propTypes = {
  board: PropTypes.shape({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    location: PropTypes.string,
    replies: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onExpand: PropTypes.func.isRequired,
  onReply: PropTypes.func.isRequired,
};

export default BoardCard; 