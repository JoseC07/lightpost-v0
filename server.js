require('dotenv').config();

// Import all the required dependencies
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Password hashing
const jwt = require('jsonwebtoken'); // JWTs
const cookieParser = require('cookie-parser'); // Cookie parsing
const authRoutes = require('./auth/routes');

// --- CONFIGURATION --- PLEASE CHANGE THIS IN PRODUCTION ---
// const JWT_SECRET = 'your_super_secret_jwt_key_change_this_immediately';

// --- DATABASE SETUP ---
// Set up SQLite
const db = new sqlite3.Database('./boards.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, -- User who posted this
    text TEXT NOT NULL,
    location TEXT,
    replies TEXT,
    meetup TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) -- Link it to the users table
  )`);
  // Add the users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  console.log('Database is ready');
});

// --- EXPRESS SETUP ---
// Get that Express app fired up
const app = express();
app.use(express.json()); // Parse JSON bodies
app.use(cors({ // Allow the frontend to communicate
  origin: true, // Reflect the request origin, fine for dev
  credentials: true // Allow cookies
}));
app.use(cookieParser()); // Parse cookies

// --- AUTH UTILITIES ---
// Generate JWT tokens, keep 'em short and sweet
const generateTokens = (userid) => {
  // Check if the secret key is defined
  if(!process.env.JWT_SECRET) {
    console.error('\x1b[31m%s\x1b[0m', 'CRITICAL SECURITY ERROR: JWT_SECRET is not defined or invalid. Token generation failed. This is a severe security risk - the application cannot securely authenticate users without a valid JWT_SECRET.');
    // Depending on your setup, you might want to throw an error to halt startup
    // throw new Error('JWT_SECRET is not configured.');
    // For now, we'll return null or an empty object to signal failure clearly
    return {
      accessToken: null,
      refreshToken: null,
      error: 'JWT_SECRET not configured',
      timestamp: new Date().toISOString()
    };
  }

  console.log(`Generating tokens for userId: ${userid}`); // Log intent
  try {
    //use core function from jsonwebtoken - jwt.sign(payload,secret,options), creates an object literal {}
    //used to create objects like the payload, userId or the returned items , accessToken, refreshToken
    const accessToken = jwt.sign({ userId: userid }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' });
    const refreshToken = jwt.sign({ userId: userid }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }); // Make this one last longer, obviously
    //So, accessToken contains the 15-minute token string, and refreshToken contains the 7-day token string.
    console.log(`Tokens generated successfully for userId: ${userid}`); // Log success
    return { accessToken: accessToken, refreshToken: refreshToken };
    //this entire return call is an object literal defined by generateTokens
  } catch (error) {
    // Log the error with more context
    console.error(`[Token Generation Error] Failed for userId ${userid}:`, error.message || error);

    // Return a structured error object instead of just null
    return {
        accessToken: null,
        refreshToken: null,
        error: `Token generation failed: ${error.message || 'Unknown error'}`, // Include the specific error message
        timestamp: new Date().toISOString() // Add a timestamp for debugging
    };
  }
};

// Verify JWT token, make sure it's valid
const verifyToken = (token) => {
  // First, handle the edge case of a missing token explicitly
  if (!token) {
    console.warn('[Token Verification] Attempted to verify an empty or null token.');
    return { error: true, reason: 'No token provided' };
  }
  // Also check the secret key here, like in generateTokens
  if (!process.env.JWT_SECRET) {
     console.error('[Token Verification Error] CRITICAL: JWT_SECRET is not defined. Cannot verify tokens.');
     // Return a specific error for this critical configuration issue
     return { error: true, reason: 'Server configuration error: JWT_SECRET missing', critical: true };
  }

  try {
    // Attempt to verify the token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // If successful, return the decoded payload
    return payload; // Contains { userId: ..., iat: ..., exp: ... }

  } catch (e) {
    // Log the specific error encountered during verification
    console.warn(`[Token Verification Error] Failed to verify token: ${e.name} - ${e.message}`);

    // Return a structured error object detailing the failure
    return {
      error: true, // Clear flag indicating verification failed
      reason: e.message, // The message from the error object (e.g., "jwt expired", "invalid signature")
      name: e.name // The type of error (e.g., "TokenExpiredError", "JsonWebTokenError")
    };
  }
};

// --- USER FUNCTIONS (adapted from old-auth) ---
// Find a user by their email
const findUserByEmail = (email) => {
 return new Promise((resolve,reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        console.error('Database error finding user by email:', err);
        return reject(err);
      }
      resolve(row); // Returns the user row or undefined if not found
    });
  });
};

// Create a new user, hash their password
const createUser = ({ username, email, password }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const password_hash = await bcrypt.hash(password, 12); // Hash the password
      db.run(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, password_hash],
        function (err) {
          if (err) {
            console.error('Database error creating user:', err);
            // Handle specific errors like UNIQUE constraint violation
            if (err.message.includes('UNIQUE constraint failed: users.email')) {
              return reject(new Error('Email already exists'));
            }
            if (err.message.includes('UNIQUE constraint failed: users.username')) {
              return reject(new Error('Username already exists, please choose another'));
            }
            return reject(err);
          }
          // Return the new user's ID, useful sometimes
          resolve({ id: this.lastID, username, email });
        }
      );
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      reject(hashError);
    }
  });
};

// Validate login, check email and password
const validateLogin = async (email, password) => {
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      console.log(`Login attempt failed: No user found for email ${email}`);
      return null; // Indicate user not found
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      console.log(`Login attempt failed: Invalid password for email ${email}`);
      return null; // Indicate invalid password
    }

    console.log(`Login successful for email ${email}`);
    return user; // Return the user object on success
  } catch (error) {
    console.error('Error validating login:', error);
    throw error; // Rethrow for the route handler
  }
};

// --- AUTH MIDDLEWARE ---
// Check if the user is authenticated
const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  console.log("Middleware: Checking token:", token); // Log token check

  if (!token) {
    console.log("Middleware: No token found, access denied.");
    return res.status(401).send('Access Denied: No token provided'); // Unauthorized
  }

  const userData = verifyToken(token);
  if (!userData) {
    console.log("Middleware: Invalid token, access forbidden.");
    return res.status(403).send('Access Forbidden: Invalid token'); // Forbidden
  }

  console.log("Middleware: Token verified, user:", userData);
  req.user = userData; // Attach user data (contains userId) to the request
  next(); // Move on, you're good
};

// --- EXPRESS ROUTES ---

// --- AUTH ROUTES ---
// POST /register - Create a new user, what a concept
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).send('Username, email, and password are required');
  }

  try {
    const newUser = await createUser({ username, email, password });
    // Don't send the password hash back, obviously.
    res.status(201).json({ message: 'User registered successfully!', userId: newUser.id });
  } catch (error) {
    console.error('Registration error:', error);
    // Send specific error messages from createUser
    if (error.message.includes('already exists')) {
        return res.status(409).send(error.message); // 409 Conflict
    }
    res.status(500).send('Server error during registration');
  }
});

// POST /login - Handle user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password required');
  }

  try {
    const user = await validateLogin(email, password);
    if (!user) {
      return res.status(401).send('Invalid credentials, please try again');
    }

    // Generate tokens and set cookies, the real prize
    const tokens = generateTokens(user.id);
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in prod
      sameSite: 'strict',
      maxAge: 900000 // 15 minutes, keep it tight
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 604800000 // 7 days, a bit longer
    });

    res.json({ message: 'Logged in successfully, welcome!' });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Server error during login.');
  }
});

// POST /logout - Clear auth cookies and log the user out
app.post('/logout', (req, res) => {
  res.clearCookie('accessToken', { httpOnly: true, sameSite: 'strict' });
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
  res.status(200).json({ message: 'Logged out successfully!' });
});

// --- BOARD ROUTES (Existing) ---
// GET all boards
app.get('/boards', (req, res) => {
  // Fetch boards and join with users table to get the username
  const query = `
    SELECT b.*, u.username 
    FROM boards b
    JOIN users u ON b.user_id = u.id
    ORDER BY b.id DESC -- Or however you want to order them
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send("Database error");
    }
    const boards = rows.map(row => ({
      ...row,
      replies: JSON.parse(row.replies) // Parse that JSON string into an array
    }));
    res.json(boards); // Send the boards back
  });
});

// POST a new board (AUTH REQUIRED)
app.post('/pin', authenticateToken, (req, res) => { // Added authenticateToken middleware
  const { text, location } = req.body;
  const userId = req.user.userId; // Get user ID from middleware

  if (!text || !location) {
    return res.status(400).send('Missing text or location');
  }
  if (!userId) {
      console.error('/pin Error: userId is missing after authentication.');
      return res.status(500).send('Authentication error, server issue');
  }

  db.run(
    'INSERT INTO boards (user_id, text, location, replies, meetup) VALUES (?, ?, ?, ?, ?)', // Added user_id
    [userId, text, location, '[]', ''], // Pass userId
    function (err) {
      if (err) {
        console.error('Database error on insert:', err);
        return res.status(500).send('Database error');
      }
      res.send('Board pinned successfully');
    }
  );
});

// POST a reply (AUTH REQUIRED)
app.post('/reply', authenticateToken, (req, res) => { // Added authenticateToken middleware
  const { id, reply } = req.body;
  const userId = req.user.userId; // Get user ID

  if (!id || !reply) {
    return res.status(400).send('Missing id or reply');
  }
  db.get('SELECT replies FROM boards WHERE id = ?', [id], (err, row) => {
    if (err || !row) {
      console.error(err || 'Board not found');
      return res.status(404).send('Board not found');
    }
    const replies = JSON.parse(row.replies); // Parse current replies
    replies.push(reply); // Add the new reply
    db.run(
      'UPDATE boards SET replies = ? WHERE id = ?',
      [JSON.stringify(replies), id],
      (err) => {
        if (err) {
          console.error('Update error:', err);
          return res.status(500).send('Database error');
        }
        res.send("Reply added successfully");
      }
    );
  });
});

// --- SOCKET.IO SETUP ---
// Set up the HTTP server and Socket.IO for real-time communication
const server = http.createServer(app);
// Explicitly configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Explicitly allow the frontend origin
    methods: ["GET", "POST"], // Specify allowed methods
    credentials: true // Allow cookies/credentials to be sent
  }
});

// --- SOCKET.IO AUTH MIDDLEWARE ---
// Check the user's token before allowing socket connection
io.use((socket, next) => {
  // Manually parse cookies because Socket.IO handshake doesn't use Express middleware directly
  const cookies = socket.handshake.headers.cookie;
  const parsedCookies = cookies ? require('cookie').parse(cookies) : {}; 
  const token = parsedCookies.accessToken;
  console.log('[Socket Middleware] Checking token:', token);

  if (!token) {
    console.log('[Socket Middleware] No token found, connection rejected.');
    return next(new Error('Authentication error: No token provided')); 
  }

  const userData = verifyToken(token);
  if (!userData) {
    console.log('[Socket Middleware] Invalid token, connection rejected.');
    return next(new Error('Authentication error: Invalid token'));
  }

  console.log('[Socket Middleware] Token verified, user:', userData);
  socket.user = userData; // Attach user data to the socket object
  next(); // All good, proceed with connection
});

// Handle connections and real-time events
io.on('connection', (socket) => {
  console.log('User connected');

  // Pin a board in real-time, broadcast the update (AUTH REQUIRED)
  socket.on('pinBoard', (data) => {
    // User should be authenticated by the middleware, otherwise connection wouldn't happen
    if (!socket.user || !socket.user.userId) {
        console.error('[Socket pinBoard] Error: No user data found on authenticated socket.');
        // Optionally emit an error back to the client
        socket.emit('error', { message: 'Authentication error, please login again.'});
        return; 
    }
    
    console.log(`[Socket Backend] User ${socket.user.userId} attempting to pin board. Data:`, data);
    const { text, location } = data;
    const userId = socket.user.userId; // Get user ID from socket 

    if (!text || !location) {
      console.log('[Socket Backend] Pin rejected: Missing text or location.');
      return; // Reject if data is incomplete
    }
    db.run(
      'INSERT INTO boards (user_id, text, location, replies, meetup) VALUES (?, ?, ?, ?, ?)', // Include user_id
      [userId, text, location, '[]', ''], // Pass userId
      function (err) {
        if (err) {
          console.error('Database error on insert:', err);
          return; // Stop if insert fails
        }
        const id = this.lastID; // Grab the new board's ID
        console.log(`[Socket Backend] Insert successful. New board ID: ${id} by user ${userId}`);
        // Fetch the newly created board WITH the username
        db.get(`
          SELECT b.*, u.username 
          FROM boards b 
          JOIN users u ON b.user_id = u.id 
          WHERE b.id = ?
        `, [id], (err, row) => {
          if (err) {
            console.error('[Socket Backend] Fetch error after insert:', err);
            return; // Stop if fetch fails
          }
          if (!row) {
             console.error(`[Socket Backend] Fetch error: Row not found after insert? ID: ${id}`);
             return; // Stop if row not found
          }
          console.log('[Socket Backend] Fetch successful. Row data:', row);
          const board = { ...row, replies: JSON.parse(row.replies) };
          console.log('[Socket Backend] Emitting boardUpdate (add) with board:', board);
          io.emit('boardUpdate', { action: 'add', data: board }); // Blast it to everyone
        });
      }
    );
  });

  // Add a reply in real-time, broadcast the update (AUTH REQUIRED)
  socket.on('addReply', (data) => {
    // User should be authenticated by the middleware
    if (!socket.user || !socket.user.userId) {
        console.error('[Socket addReply] Error: No user data found on authenticated socket.');
        socket.emit('error', { message: 'Authentication error, please login again.'});
        return; 
    }

    const { id, reply } = data;
    const userId = socket.user.userId;
    console.log(`[Socket Backend] User ${userId} adding reply to board ${id}. Reply: ${reply}`);

    if (!id || !reply) return; // Ignore if data is incomplete
    db.get('SELECT replies FROM boards WHERE id = ?', [id], (err, row) => {
      if (err || !row) return console.error(err || 'Board not found');
      const replies = JSON.parse(row.replies);
      replies.push(reply);
      db.run(
        'UPDATE boards SET replies = ? WHERE id = ?',
        [JSON.stringify(replies), id],
        (err) => {
          if (err) return console.error('Update error:', err);
          // Fetch the updated board WITH the username
          db.get(`
            SELECT b.*, u.username 
            FROM boards b 
            JOIN users u ON b.user_id = u.id 
            WHERE b.id = ?
          `, [id], (err, row) => {
            if (err) return console.error('Fetch error:', err);
            const board = { ...row, replies: JSON.parse(row.replies) };
            io.emit('boardUpdate', { action: 'reply', data: board }); // Send the updated board
          });
        }
      );
    });
  });
});

// --- START THE SERVER ---
server.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.use('/auth', authRoutes);