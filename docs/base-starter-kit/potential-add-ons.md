# Lightpost Starter Template: Features & Potential

## Project Overview

**Description:** A starter template for building geolocated, real-time collaboration applications. Based on a mini-game concept where users pin "boards" (messages/ideas) to locations, reply, and potentially organize meetups.

**Core Goals:**
*   Demonstrate real-time data synchronization between multiple clients and a server.
*   Provide a foundation for server-side data persistence (using SQLite).
*   Enable basic multiplayer/community interaction features.

**Target Use Case:** A starting point for developers building local community apps, event boards, collaborative idea platforms, or simple real-time games.

---

## Core Features (Included in Base Template - MVP)

These are the fundamental pieces included in the starter template, providing the essential real-time pinboard functionality.

1.  **Board Pinning:**
    *   **Functionality:** Allows users to create and post short messages (`text`) associated with a location (`location`) string.
    *   **Dependencies:** Database (SQLite), Real-time Sync (Socket.IO)
    *   **Priority:** High (Essential for MVP)

2.  **Real-time Replies:**
    *   **Functionality:** Users can add text replies to existing boards. New replies are broadcast instantly to all connected clients.
    *   **Dependencies:** Database (SQLite), Real-time Sync (Socket.IO)
    *   **Priority:** High (Essential for MVP)

3.  **Basic Backend & Database:**
    *   **Functionality:** Node.js/Express server with routes for fetching boards (`/boards`), pinning (`/pin`), and replying (`/reply`). SQLite database (`boards.db`) set up to persist board data (`id`, `text`, `location`, `replies` as JSON string).
    *   **Dependencies:** Node.js, Express, SQLite3
    *   **Priority:** High (Essential infrastructure)

4.  **Real-time Synchronization:**
    *   **Functionality:** Socket.IO integration for broadcasting board updates (`boardUpdate` event for 'add' and 'reply' actions) to all clients. Handles CORS configuration.
    *   **Dependencies:** Socket.IO
    *   **Priority:** High (Core real-time aspect)

5.  **Basic Frontend:**
    *   **Functionality:** React frontend (using Vite) displaying boards, handling user input for pinning and replying, connecting to Socket.IO, and updating the UI in real-time. Includes basic styling and component structure (`App`, `BoardCard`, `PinModal`).
    *   **Dependencies:** React, Socket.IO Client
    *   **Priority:** High (Essential for user interaction)

---

## Optional Modular Features (Potential Add-ons)

These features can be integrated into the starter template to extend its capabilities. They are not included by default but are designed as potential enhancements.

1.  **Meetup Activation:**
    *   **Concept:** Allow boards to be explicitly marked or activated as "meetups" based on user interaction (e.g., a button click, number of replies). This involves adding UI elements and backend logic to manage a `meetup` status or details in the database.
    *   **Dependencies:** Database Schema Update, User Input Handling (Frontend/Backend)
    *   **Priority:** Medium

2.  **Geolocation Integration:**
    *   **Concept:** Use the browser's Geolocation API (or a similar service) on the frontend to automatically detect the user's location or allow them to pick from a map, replacing the manual "Near Austin" string. Display boards based on proximity.
    *   **Dependencies:** Frontend Geolocation API, Potential Backend adjustments for querying by location.
    *   **AI Potential:** Could be enhanced with AI for smarter location-based recommendations.
    *   **Priority:** Medium

3.  **Enhanced UI (Map/Canvas):**
    *   **Concept:** Replace the simple card list with a more visual representation, like pinning boards onto an interactive map (e.g., Leaflet, Mapbox GL JS) or a conceptual canvas.
    *   **Dependencies:** Frontend UI Libraries (Mapping/Canvas), Logic to map board data to visual elements.
    *   **Priority:** Medium (Visual enhancement)

4.  **Engagement Prediction (AI - Low Priority):**
    *   **Concept:** Implement a simple model (server-side) to analyze early replies or interaction patterns on a board to predict its likelihood of becoming an active meetup. Could provide hints in the UI.
    *   **Dependencies:** Data Analysis/ML library (server-side), Backend logic.
    *   **Priority:** Low

5.  **Content Moderation (AI - Low Priority):**
    *   **Concept:** Integrate a content moderation API or model (server-side) to automatically flag or filter potentially inappropriate text submitted in boards or replies.
    *   **Dependencies:** Moderation API/Library, Backend integration.
    *   **Priority:** Low

6.  **Recommendation System (AI - Medium Priority):**
    *   **Concept:** Develop a system (likely server-side) to suggest relevant boards or potential meetups to users based on their location, past interactions, or explicitly defined interests (requires adding user profiles/interests).
    *   **Dependencies:** User Profiles/History (Database), Recommendation Logic (Backend).
    *   **Priority:** Medium

---

## Core Technology Stack

*   **Backend:** Node.js, Express.js
*   **Database:** SQLite
*   **Real-time:** Socket.IO
*   **Frontend:** React (with Vite)
*   **Styling:** CSS (basic global styles provided in `index.css`)

---

## Development Milestones (Example)

1.  **MVP (Base Template):** Functional backend/frontend with real-time pinning and replying. (Completed)
2.  **UI/UX Enhancements:** Integrate Geolocation, add Meetup Activation features, or implement Map/Canvas UI.
3.  **AI Integration:** Add optional AI features like Engagement Prediction, Moderation, or Recommendations.
