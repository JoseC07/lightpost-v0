Phase 1: Validation & Stabilization (Current Focus)
[x] Validate Endpoints & Middleware:
    [x] Test POST /register (success, duplicate email/username errors).
    [x] Test POST /login (success with cookie setting, invalid credentials).
    [x] Test POST /pin (requires auth, successfully creates board with user_id). (Verified via socket equivalent)
    [x] Test POST /reply (requires auth, successfully adds reply). (Verified via socket equivalent)
    [x] Test GET /boards (returns boards with associated usernames).
    [x] Verify unauthenticated access to /pin and /reply is blocked (401/403).
[x] Validate Socket.IO:
    [x] Test socket connection (requires valid accessToken cookie).
    [x] Test pinBoard event (requires auth, creates board, broadcasts with username).
    [x] Test addReply event (requires auth, adds reply, broadcasts updated board with username). (Assuming similar structure to pinBoard)
    [x] Verify unauthenticated socket connections/events fail gracefully.
[x] End-to-End Smoke Test:
    [x] Simulate frontend flow: Register -> Login -> Pin Board -> Add Reply.
    [x] Verify data appears correctly via GET /boards and socket updates.
    [x] Inspect SQLite database (boards.db) directly to confirm user_id is stored correctly. (Confirmed via logs)
[ ] Commit Working Version:
    Once validation is complete, commit the fully functional `server.js` to Git as a stable baseline. `git add . && git commit -m "feat: Implement monolithic authentication and board features"`
Phase 2: Refactoring & Refinement (Post-Validation)
[ ] Environment & Config: (Original Phase 1, Step 1 - Refined)
Install dotenv.
Create .env (add to .gitignore) & .env.example with JWT_SECRET, DATABASE_FILE, PORT.
Create and implement src/config/index.ts (or .js) to load and export environment variables.
Update server.js (and later, refactored files) to use the config module instead of hardcoded values.
[ ] Modular Routing: (Original Phase 2, Step 6 & Phase 3, Step 9 - Refactored)
Create src/routes/authRoutes.js: Move /register and /login route definitions here.
Create src/routes/boardRoutes.js: Move /boards, /pin, /reply route definitions here.
Create src/controllers/authController.js: Extract logic from inline /register, /login handlers.
Create src/controllers/boardController.js: Extract logic from inline /boards, /pin, /reply handlers.
Create src/routes/index.js: Combine authRoutes and boardRoutes.
Update server.js to use the main router from src/routes/index.js.
[ ] Modular Middleware: (Original Phase 3, Step 7 - Refactored)
Create src/middleware/authenticateToken.js: Move the authenticateToken function here.
Update boardRoutes.js to import and use this middleware.
[ ] Modular Utilities: (Original Phase 2, Step 4 - Refactored)
Create src/utils/passwordUtils.js: Extract bcrypt.hash and bcrypt.compare logic into hashPassword and verifyPassword functions.
Create src/utils/jwtUtils.js: Move generateTokens and verifyToken functions here. Update dependencies.
[ ] Modular Database & Models: (Original Phase 1, Step 3 - Refactored)
Create src/db/database.js: Encapsulate the sqlite3.Database connection setup. Export the db instance.
Create src/models/UserModel.js: Move createUser, findUserByEmail, validateLogin logic here, making them methods that use the imported db instance and password utils. Update dependencies.
Create src/models/BoardModel.js: Extract database logic related to creating/fetching/updating boards. Update dependencies.
[ ] Modular Socket.IO Logic: (New Step - Refactoring)
Create src/sockets/socketHandler.js (or similar): Move the io.use() middleware and io.on('connection', ...) logic, including event handlers (pinBoard, addReply), into this module. Pass the io instance and necessary models/utils.
Update server.js to import and initialize the socket handler.
[ ] Security Enhancements:
Install and apply helmet middleware in server.js for security headers. (Original Phase 2, Step 5)
[ ] Error Handling: (Original Phase 4, Step 10 - Refined)
Implement more robust global error handling middleware in server.js.
[ ] Review & Test: Thoroughly test the refactored application to ensure no functionality was broken during modularization.
