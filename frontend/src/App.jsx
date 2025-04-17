import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import BoardCard from './components/BoardCard';
import PinModal from './components/PinModal';
import Register from './components/Register';
import Login from './components/Login';
import './index.css';

// Connect to the backend socket server
// We need to pass credentials for the cookie-based authentication
const socket = io('http://localhost:3000', { 
  withCredentials: true 
});

function App() {
  const [boards, setBoards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedBoardId, setExpandedBoardId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // TODO: Add a check for existing session/cookie on initial load?

  // Fetch initial boards if logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://localhost:3000/boards', { credentials: 'include' })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => setBoards(data))
        .catch(err => console.error('Failed to fetch boards:', err));

      // Socket listeners (only if logged in)
      socket.on('boardUpdate', (update) => {
        console.log('Board update received:', update);
        setBoards(currentBoards => {
          if (update.action === 'add') {
            if (!currentBoards.some(b => b.id === update.data.id)) {
              return [...currentBoards, update.data];
            } else {
              return currentBoards; 
            }
          } else if (update.action === 'reply') {
            return currentBoards.map(board =>
              board.id === update.data.id ? update.data : board
            );
          }
          return currentBoards;
        });
      });

      // Clean up the socket connection
      return () => {
        socket.off('boardUpdate');
      };
    } else {
        // If not logged in, clear boards and remove listeners
        setBoards([]);
        socket.off('boardUpdate');
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = (userData) => {
    console.log("Login successful in App:", userData);
    setIsLoggedIn(true);
    setCurrentUser(userData);
    if (!socket.connected) {
      socket.connect();
    } 
  };

  const handleLogout = () => {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setBoards([]);
      socket.disconnect();
      console.log("Logged out");
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handlePinBoard = (newBoardData) => {
    if (!isLoggedIn) {
        console.error("Cannot pin board: User not logged in.");
        return; 
    }
    console.log('Pinning board via socket:', newBoardData);
    socket.emit('pinBoard', newBoardData);
    handleCloseModal(); 
  };

  const handleAddReply = useCallback((boardId, replyText) => {
    if (!isLoggedIn) {
        console.error("Cannot add reply: User not logged in.");
        return; 
    }
    console.log(`Adding reply to board ${boardId} via socket:`, replyText);
    socket.emit('addReply', { id: boardId, reply: replyText });
  }, [isLoggedIn]);

  const toggleExpandBoard = (boardId) => {
    setExpandedBoardId(currentId => (currentId === boardId ? null : boardId));
  };

  const toggleAuthMode = () => setShowLogin(!showLogin);

  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        {showLogin ? (
          <> 
            <Login onLoginSuccess={handleLoginSuccess} />
            <p>Don't have an account? <button onClick={toggleAuthMode}>Register</button></p>
          </>
        ) : (
          <>
            <Register />
            <p>Already have an account? <button onClick={toggleAuthMode}>Login</button></p>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">Lightpost</h1>
          <div className="user-info">
            {currentUser && <span>Welcome, {currentUser.username}!</span>}
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {boards.map(board => (
          <BoardCard
            key={board.id}
            board={board}
            isExpanded={expandedBoardId === board.id}
            onExpand={() => toggleExpandBoard(board.id)}
            onReply={handleAddReply}
          />
        ))}
      </main>

      <button className="fab" onClick={handleOpenModal}>+</button>

      {isModalOpen && (
        <PinModal
          onClose={handleCloseModal}
          onPin={handlePinBoard}
        />
      )}
    </>
  );
}

export default App; 