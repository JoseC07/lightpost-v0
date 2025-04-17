# Lightpost - The Gathering Game: Core Requirements

## 1. Overview

A real-time, minimalist web application allowing users to anonymously pin short messages ("boards") associated with a location, view existing boards, and reply to them. The application features a Node.js/Express backend with SQLite persistence and a React frontend, utilizing Socket.IO for real-time communication.

## 2. Core Features

*   **Pinning Boards:** Users can create and "pin" new boards with text content and a location.
*   **Viewing Boards:** All existing boards are displayed to users upon loading the application.
*   **Replying to Boards:** Users can add replies to existing boards.
*   **Real-time Updates:** New boards and replies appear for all connected users instantly without requiring a page refresh.

## 3. Backend Requirements (`server.js`)

### 3.1. Technology Stack
*   Node.js
*   Express.js
*   SQLite3 (`sqlite3`)
*   Socket.IO (`socket.io`)
*   CORS (`cors`)

### 3.2. Database (`boards.db`)
*   **Table:** `boards`
*   **Schema:**
    *   `id`: INTEGER PRIMARY KEY AUTOINCREMENT
    *   `text`: TEXT NOT NULL (The main content of the board)
    *   `location`: TEXT (User-provided location string)
    *   `replies`: TEXT (Stored as a JSON string array, e.g., `["reply1", "reply2"]`)
    *   `meetup`: TEXT (Currently unused, intended for future features)

### 3.3. API Endpoints
*   **`GET /boards`**
    *   **Description:** Retrieve all boards from the database.
    *   **Response:** JSON array of board objects. Each board object includes `id`, `text`, `location`, `meetup`, and `replies` (parsed from JSON string into an array).
*   **`POST /pin`**
    *   **Description:** Create a new board.
    *   **Request Body:** JSON `{ "text": "string", "location": "string" }`
    *   **Action:** Inserts a new record into the `boards` table with empty `replies` (`'[]'`) and `meetup` (`''`).
    *   **Response:** Success/error message.
*   **`POST /reply`**
    *   **Description:** Add a reply to an existing board.
    *   **Request Body:** JSON `{ "id": number, "reply": "string" }`
    *   **Action:** Fetches the board by `id`, parses its `replies` JSON, adds the new reply string, updates the `replies` JSON string in the database.
    *   **Response:** Success/error message.

### 3.4. Real-time Communication (Socket.IO)
*   **Connection:** Listens for client connections.
*   **Event Listener: `pinBoard`**
    *   **Payload:** `{ text: "string", location: "string" }`
    *   **Action:** Inserts the new board into the database (same logic as `POST /pin` but triggered via socket). Fetches the newly created board (including its `id`).
    *   **Emit:** Emits a `boardUpdate` event to *all* clients.
*   **Event Listener: `addReply`**
    *   **Payload:** `{ id: number, reply: "string" }`
    *   **Action:** Adds the reply to the specified board in the database (same logic as `POST /reply` but triggered via socket). Fetches the updated board data.
    *   **Emit:** Emits a `boardUpdate` event to *all* clients.
*   **Event Emitter: `boardUpdate`**
    *   **Payload:** `{ action: "add" | "reply", data: boardObject }`
        *   `action: "add"`: Sent after a successful `pinBoard` event. `data` is the newly created board object.
        *   `action: "reply"`: Sent after a successful `addReply` event. `data` is the full, updated board object (including the new reply).
    *   **Target:** All connected clients (`io.emit`).

### 3.5. Configuration
*   **CORS:** Configured for both the Express app (`app.use(cors())`) and the Socket.IO server (`socketIo(server, { cors: {...} })`) to allow requests from the frontend origin.
*   **Port:** Runs on port 3000.

## 4. Frontend Requirements (React App)

### 4.1. Technology Stack
*   React
*   Vite (Build tool)
*   `socket.io-client`

### 4.2. Core Components
*   **`App.jsx`:**
    *   Manages main application state (`boards`, modal visibility, expanded board ID).
    *   Fetches initial boards using `GET /boards` on mount.
    *   Establishes Socket.IO connection to `http://localhost:3000`.
    *   Listens for `boardUpdate` socket events and updates the `boards` state accordingly (adds new boards, updates existing boards with new replies).
    *   Renders the Header, `BoardCard` list, and FAB.
    *   Handles opening/closing the `PinModal`.
    *   Provides `handlePinBoard` (emits `pinBoard` via socket) and `handleAddReply` (emits `addReply` via socket) callbacks to child components.
*   **`BoardCard.jsx`:**
    *   Receives a `board` object as a prop.
    *   Displays `board.text` and `board.location`.
    *   Displays reply count.
    *   Is clickable to expand/collapse the replies section.
    *   When expanded:
        *   Displays existing `board.replies`.
        *   Shows an input field for adding a new reply.
        *   Calls `onReply` prop (passed from `App.jsx`) when the user submits a reply (e.g., pressing Enter).
*   **`PinModal.jsx`:**
    *   A modal dialog triggered by the FAB.
    *   Contains a form with inputs for "text" and "location".
    *   Location input defaults to "Near Austin".
    *   On submission, calls the `onPin` prop (passed from `App.jsx`) with the `{ text, location }` object.
*   **Floating Action Button (FAB):**
    *   Positioned fixed at the bottom-right.
    *   Displays a '+' icon.
    *   On click, opens the `PinModal`.

### 4.3. Styling & UX (`index.css`)
*   **Theme:** Minimalist, light background, white cards, orange interactive elements (#FF9800).
*   **Layout:** Responsive grid layout for boards (multi-column on desktop, single-column on mobile).
*   **Font:** `Inter`.
*   **Interactions:**
    *   Cards scale slightly on hover.
    *   FAB has a bounce animation on hover.
    *   Replies section expands/collapses smoothly within cards.
    *   Modal appears/disappears.
*   **Real-time Feedback:** Board list updates instantly when new boards/replies are added via Socket.IO.

### 4.4. Configuration
*   Connects to backend API and Socket.IO server at `http://localhost:3000`.
*   Typically runs on `http://localhost:5173` (Vite default).

## 5. Key User Flows

1.  **View Boards:** User loads app -> Frontend fetches `GET /boards` -> Boards displayed as cards.
2.  **Pin New Board:** User clicks FAB -> Modal opens -> User enters text/location -> User clicks "Pin It!" -> Frontend emits `pinBoard` -> Backend receives, saves, emits `boardUpdate` -> Frontend receives update, adds new card.
3.  **Add Reply:** User clicks board card -> Replies section expands -> User types reply, hits Enter -> Frontend emits `addReply` -> Backend receives, saves, emits `boardUpdate` -> Frontend receives update, updates the specific card's replies.
