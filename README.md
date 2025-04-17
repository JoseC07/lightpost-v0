
*   **Project Name:** Light-Post
*   **Core Idea:** A real-time, local-first inspired community message board application.
*   **Technology Stack:**
    *   Backend: Node.js, Express.js
    *   Real-time Communication: Socket.IO
    *   Database: SQLite (using `sqlite3` library)
    *   Authentication: JWT (JSON Web Tokens) using `jsonwebtoken`, stored in HTTP Cookies (`cookie-parser`). Password hashing with `bcryptjs`.
    *   Configuration: Environment variables (using `dotenv` for local development).
*   **Key Features:**
    *   User registration and login with secure password handling.
    *   JWT-based authentication for protected routes and WebSocket actions.
    *   Ability for authenticated users to post ("pin") messages with text and location.
    *   Ability for authenticated users to reply to existing messages.
    *   Real-time broadcasting of new posts and replies to all connected clients via Socket.IO.
    *   Retrieval of all posts with associated usernames.
*   **Architectural Style:** Emphasis on simplicity and direct control, using raw SQL queries wrapped in Promises for database interaction. Focus on building a stable core before introducing heavy abstractions.
*   **Current Status:** Under active development, focusing on core feature implementation and preparing for initial deployment.
