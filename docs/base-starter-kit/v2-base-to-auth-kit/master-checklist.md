Node.js + Express + SQLite JWT Auth – Starter Template Checklist
1. Required NPM Packages

    Express – Web framework for routing and middleware support.

    SQLite3 – Database driver for SQLite (lightweight file-based storage).

    dotenv – Loads environment variables from a .env file (e.g. JWT secret, DB path).

    jsonwebtoken – Library to create and verify JWT tokens (for authentication)​
    github.com
    .

    bcrypt – For hashing passwords securely before storing in the database​
    github.com
    .

    cors – Middleware to enable Cross-Origin Resource Sharing (allow frontend requests).

    helmet – Security middleware to set safe HTTP headers by default (helps secure the API).

    (Dev) nodemon – Utility to auto-restart the server on code changes (for development).

    (Optional) socket.io – If real-time features are needed, Socket.IO can be included on both server and client for WebSocket communication (see Socket integration suggestions below).

2. File/Module Structure

    app.js (or server.js): The main entry point. Sets up the Express app, connects to the SQLite database, loads environment variables, applies global middleware (e.g. express.json() for JSON body parsing, cors(), helmet()), and attaches routes. It starts the server on the configured port.

    /routes/: Directory for route modules, grouping endpoints by feature.

        routes/auth.js – Defines authentication routes (/register, /login, etc.). Imports any auth controller or service functions and uses auth middleware where appropriate.

        routes/users.js – Defines user-related routes (e.g. /me for profile, or other user CRUD endpoints). Protected by auth middleware to allow only authenticated access.

    /middleware/: Custom Express middleware functions for auth.

        middleware/authenticateToken.js – JWT validation middleware. Checks for a token in the Authorization: Bearer <token> header (or a similar header), verifies the token using the secret, and attaches the decoded user info (e.g. req.user or req.userId) if valid. Returns 401 Unauthorized if missing/invalid.

        middleware/authorizeRole.js (optional) – Authorization middleware to enforce user roles or permissions. E.g. authorizeRole('admin') could check req.user.role and next() only if the user has the required role, otherwise 403 Forbidden. Use this for protected routes that only certain users should access.

    /utils/: Utility modules for reusable logic.

        utils/jwt.js – Wrapper utilities around JWT handling (e.g. functions generateToken(payload) and verifyToken(token) using jsonwebtoken). Centralizing this logic makes it easy to change token settings (like expiration) in one place.

        utils/password.js – Password hashing utilities (e.g. functions hashPassword(plainPwd) and verifyPassword(plain, hash) using bcrypt). Abstracts the bcrypt usage (salt rounds, etc.) and keeps authentication code clean.

    /db/: Database setup and access layer.

        db/init.js – Script to initialize the SQLite database (e.g. open connection, run migrations or CREATE TABLE statements if tables don’t exist). This can be run on server startup to ensure the schema is ready.

        db/queries.js or models/User.js – Database helper functions or a simple model for user queries. For example, functions like findUserByUsername(username), createUser(userData) that execute SQL statements (using parameterized queries to prevent SQL injection). This separates raw SQL logic from the rest of the app for clarity and easy maintenance.

    /controllers/ (optional layer): If the project grows, you can use controllers to hold business logic for routes. For example, an authController.register(req, res) to handle the register process (calling DB and utils), which is invoked by the route. This keeps route files thin. In a simple starter, you may handle logic directly in route handlers, but a modular structure allows adding controllers as needed for clarity.

    socket.js (optional): If using Socket.IO, a module to set up the Socket.IO server and handle connection events. It can use the same JWT verification logic to authenticate users during websocket connection (see section 7). This keeps socket-specific code separate from HTTP routes.

    .env.example: A template of environment variables required. This file is committed to the repo as a guide for other developers. It lists all env vars (like JWT_SECRET, DATABASE_URL, etc.) without actual secrets. Developers copy this to .env and fill in real values.

    Project Structure Notes: Organize by feature when possible (e.g. a users/ module containing its routes, controllers, etc.) to make it easy to extend. The above structure can be extended with new feature modules by following the same pattern (e.g. add a posts route/controller for a new feature)​
    jasonwatmore.com
    . Keeping components decoupled (routes vs. middleware vs. utils) ensures the template is extensible and maintainable.

3. Database Schema (SQLite)

    Users Table: Core table to store user credentials and profile info. At minimum, include:

        id – integer primary key (auto-increment).

        username (or email) – text, unique identifier for login. Decide on using username, email, or both. Ensure uniqueness to prevent duplicates.

        password_hash – text, the hashed password (using bcrypt). Never store plaintext passwords.

        created_at – timestamp of account creation (optional but useful for auditing).

        updated_at – timestamp of last update (optional).

        Optional fields: e.g. email (if using username as login, store email separately), role (e.g. 'user' vs 'admin' for authorization), or any profile info needed. By default, a simple template might just have username and password.

    Relationships: If other tables exist (e.g. posts, orders, etc.), use a foreign key to link to the users table. For example, a posts table might have a user_id column referencing users.id to indicate ownership. This ensures any data created in other parts of the app can be associated with the user who created it.

    Foreign Key Constraints: In SQLite, make sure to enable foreign key enforcement (usually by a PRAGMA setting) if using relations. This will maintain referential integrity (e.g. prevent deleting a user that still has linked records).

    Example: A minimal users table schema:

    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    This can be extended with more columns as needed. The template’s DB init script can create this table on first run.

    Indexes: Ensure an index on the username/email field for fast lookups during login. (In SQLite, a UNIQUE field like username implicitly has an index.)

4. Core Features & Endpoints

    User Registration (POST /register) – Accepts new user data (e.g. username, password, and possibly email). The flow: validate the input, check that the username/email is not already taken, then hash the password with bcrypt and save the new user to the database. On success, it can return a success message or even an auth token. For example, one approach is to automatically log the user in after registration by returning a JWT in the response (so the frontend doesn’t have to immediately call login). Ensure to never store or return the raw password.

    User Login (POST /login) – Authenticates a user and returns a JWT on success. The user provides credentials (username/email and password). The flow: find the user record by username/email in the database, use bcrypt.compare to check the provided password against the stored hash. If invalid, return 401 Unauthorized. If valid, generate a JWT containing the user’s ID and any other needed info (e.g. username or role) and send it back in JSON (e.g. { token: "<JWT>" }). This token will be used by the client for subsequent requests. Optionally, include token type (Bearer) and expiry info in the response.

    JWT Generation – Use jsonwebtoken (or similar) to create tokens. Sign the JWT with the secret key from the environment. Include a reasonable expiration (expires payload) to enhance security (see Token Handling below). Typically use an HS256 signature algorithm by default. The payload can include minimal user info: usually the user’s unique ID and maybe username or role. Keep the JWT payload small and avoid sensitive data (never put the password or other secrets in the token). The token generation logic can live in utils/jwt.js (e.g. a generateToken(user) function). For example: jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' }) to create a 1-hour token​
    medium.com
    .

    Password Hashing – On registration (and whenever storing a password, e.g. password change), hash the password using bcrypt before saving. Bcrypt automatically salts the password and hashes it with a cost factor (work factor). Use a sufficiently strong cost factor (bcrypt saltRounds ~10 or higher) as a default​
    cheatsheetseries.owasp.org
    , balancing security and performance. The hashing utility (in utils/password.js) should abstract this, e.g. bcrypt.hash(password, saltRounds) and store the result. During login, use bcrypt.compare(password, user.password_hash). This ensures that even if the database is compromised, the actual passwords are not exposed in plain text​
    cheatsheetseries.owasp.org
    .

    Response Handling – Return clear responses for these auth endpoints. On success, include the token (and perhaps basic user info like username or id). On failure, use appropriate status codes (400 for bad input, 409 Conflict if username taken on register, 401 for invalid login). This helps the front-end handle outcomes properly.

    Secure Practices – Apply basic security practices to these core routes: for example, throttle repeated failed login attempts to mitigate brute force attacks (using a rate-limiter middleware on /login route). Also, if using email for registration, consider sending verification emails in a real app (though that might be outside this MVP scope). For the template, ensure the basics: hashed passwords, JWT secrets, and proper HTTP status codes, are handled as secure defaults.

5. Middleware for Auth & Access Control

    JWT Authentication Middleware – The authenticateToken middleware checks incoming requests for a valid token before allowing access to protected routes. Typically, the client sends the JWT in the Authorization header as a Bearer token (e.g. Authorization: Bearer <token>). The middleware should:

        Extract the token – e.g. using req.headers.authorization (and parsing out the Bearer scheme) or a cookie if that’s the chosen method.

        Verify the token – use jsonwebtoken.verify(token, JWT_SECRET). If verification fails (token missing, malformed, expired, or signature invalid), respond with 401 Unauthorized. If it’s valid, decode the token payload.

        Attach user to request – e.g. set req.user = decodedPayload (or specifically req.userId = decodedPayload.id if you encoded the user’s id in the token). This makes the authenticated user’s identity available to the next handlers.

        Call next() – pass control to the actual route handler if authentication succeeded.
        This middleware should be applied to all routes that require login. For example, in routes/users.js for the /me route: router.get('/me', authenticateToken, usersController.getProfile). This ensures only a valid JWT can access /me.

    Authorization Middleware – In addition to verifying the token, you may have routes that only certain users can access (authorization). For instance, an admin-only endpoint or a resource that belongs to a specific user. Implementing this can be done in a couple ways:

        Role-based: If the JWT payload or user record has a role (e.g. user.role === 'admin'), an authorizeRole('admin') middleware can check req.user.role. If the user’s role isn’t allowed, return 403 Forbidden. Use this on admin routes (e.g. deleting other users, etc.).

        Ownership-based: For routes that include a resource identifier (e.g. /users/:id to get user details, or /posts/:postId/delete), you can check that the authenticated user matches the resource owner. E.g., in a controller: if req.user.id !== req.params.id then 403 Forbidden. This check can be done inline or via a middleware that compares req.userId with an ID param.

    Applying Middleware – Register the auth middleware in the route definitions. You can also apply it globally using app.use(authenticateToken) except on public routes (ExpressJWT or similar libraries offer an .unless() to exclude certain paths​
    jasonwatmore.com
    ). In a simple setup, it’s often clearer to attach middleware per route group (all routes in /users require auth, etc.). This template should define clearly which routes are open and which require auth.

    Error Handling – Include a global error handler middleware (at the end of the middleware chain) to catch errors and format responses. For JWT, if using a library like express-jwt, an invalid token might throw an UnauthorizedError – your error handler can catch that and respond with 401 and a message​
    jasonwatmore.com
    ​
    jasonwatmore.com
    . This ensures consistent error responses. In our custom middleware, we’d manually send 401, so the error handler might mostly catch unexpected errors (500s).

    Logging & Debugging – (Optional) use a logging middleware (like morgan) in development to log requests, which can help in debugging authentication issues (e.g. seeing if the Authorization header is present).

6. Token Handling Strategy

    Stateless Authentication – The JWT approach is stateless: the server does not store session info. The token itself contains the user’s identity and is self-validating (via signature). This means the server must verify the token on each request but doesn’t keep a session store. Ensure the secret key used to sign is kept private so tokens cannot be forged​
    medium.com
    ​
    medium.com
    .

    Storage on Client – Decide where the client stores the JWT. Common options:

        Local Storage: Easy to implement (store token string in browser localStorage and send in header on each request). However, tokens in JS-accessible storage are vulnerable to XSS attacks (if an attacker can run script on your site, they could steal the token).

        HTTP-only Cookie: More secure from XSS (the token isn’t accessible via JS if cookie is HttpOnly), but it comes with complexity: you must configure CORS to allow credentials and handle CSRF protection for state-changing requests (since cookies are automatically sent). If using cookies, you’d likely issue the JWT as a cookie and still parse it server-side.

        In a starter template, storing in memory or localStorage during development is fine, but for production consider security implications. Secure default practice is to treat the JWT like a password: protect it in transit (use HTTPS) and storage.

    Token Expiration – Always set an expiration (exp) on JWTs​
    medium.com
    . This limits how long a stolen token can be abused. A common practice is short-lived access tokens, e.g. 15 minutes to 1 hour for an access JWT​
    medium.com
    . After expiration, the client needs to get a new token (which could mean logging in again or using a refresh token flow). In the jsonwebtoken.sign call, use the expiresIn option (e.g. '15m' or '1h'). The auth middleware should reject expired tokens (the verify function will throw if expired).

    Refresh Tokens (optional advanced) – To improve user experience with short-lived tokens, consider implementing refresh tokens. A refresh token is a second JWT (or random token) with a longer expiry (e.g. several days or a week)​
    medium.com
    . It is issued alongside the access token (often stored in an HttpOnly cookie or secure storage). When the access token expires, the client can call a /refresh endpoint with the refresh token to get a new access JWT without re-entering credentials. For security, refresh tokens should be stored very securely (HttpOnly cookie or even in a database with an identifier) and have their own expiration and revocation mechanism. The template can omit this for simplicity, but it’s good to structure the code so refresh logic can be added (e.g. have a route and service ready to implement /refresh if needed).

    Revocation (Logging out) – With stateless JWT, “logging out” is usually handled on the client side by discarding the token. The server, by default, has no memory of issued tokens. If immediate invalidation is required (e.g. user clicked logout or token compromised), one approach is to maintain a token blacklist/denylist on the server: store token IDs (jti) or a hash of the token in a datastore and check against it in authenticateToken. This adds complexity and state, so many apps forego it and accept that logout simply means the client won’t use the token anymore (and it will expire eventually). As a secure practice, you can implement an in-memory or DB blacklist if needed, or use short token lifetimes such that logout isn’t absolutely necessary server-side. In a reusable template, this might not be included by default, but the code should be extensible enough to add it (for example, your token utils could optionally handle a revoke list).

    Token Scope & Content – Keep JWT payload minimal: usually an id and maybe a username and role. The smaller the token, the less chance of leaking info and the faster to verify. If additional data is needed often (like user preferences), query the database via an API call (e.g. /me) rather than stuffing it all in the token. Remember that JWTs can be decoded by clients easily (they are just base64; though the signature prevents tampering, the content is not secret), so do not put sensitive data in them.

    Secret Key Management – The JWT signing secret (or RSA private key if using RSA) must be kept out of source code. Load it from process.env.JWT_SECRET (e.g. via dotenv) and make sure to use a strong secret (at least 32 characters of randomness)​
    medium.com
    . Rotate the secret if you suspect compromise (note: rotating will invalidate all existing tokens, requiring users to re-authenticate). For a shared template, leave a placeholder in .env.example and instruct users to change it to their own secure key​
    medium.com
    .

7. Socket.IO Integration for User Identity (Real-time Communication)

If your application uses Socket.IO for real-time features (chat, notifications, etc.), you should extend the authentication system to sockets as well, so you know which user is connected on each socket. Here are some suggestions to integrate JWT auth with Socket.IO:

    Include JWT on Connection – The client should send its JWT when initiating the WebSocket connection. Socket.IO allows sending auth data during the handshake. For example, in the front-end:

io("https://yourserver.com", { 
    auth: { token: localStorage.getItem("token") } 
});

or alternatively as a query string (e.g. io("https://yourserver.com?token=XYZ")). Using the built-in auth option is cleaner in Socket.IO v4.

Verify on Handshake – On the server side, use a middleware for Socket.IO to authenticate this token before allowing the connection. For example:

    io.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error("Authentication error: no token"));
      try {
        const userPayload = jwt.verify(token, JWT_SECRET);
        socket.user = userPayload;  // Attach user info to socket
        next();
      } catch (err) {
        return next(new Error("Authentication error: invalid token"));
      }
    });

    This will run for each incoming socket connection. If the JWT is valid, the socket is associated with that user; if not, you reject the connection. Authenticating at connection time means only authorized sockets get through.​
    stackoverflow.com
    Every time the client reconnects (which Socket.IO will do automatically if disconnected), the token is re-checked, providing continuous verification​
    stackoverflow.com
    .

    Use Socket User Data – Once authenticated, you can identify the user in socket events. For example, in your event handlers, you might access socket.user.id to know who sent a message. This can be used to enforce authorization on socket events as well (e.g. if a user tries to join a room or send data they shouldn't).

    Rooms or Mappings – You can optionally use Socket.IO rooms or a mapping to track user sockets. For instance, join each socket to a room named after the user’s id: socket.join(user_${socket.user.id}). This way you can emit events to that specific user easily (useful for sending real-time updates to a particular user).

    Sync with HTTP Auth – Use the same JWT secret and payload for sockets as for HTTP requests to keep a single source of truth for authentication. This means a user who is logged in via the REST API can use the same token for sockets. There’s no separate session to maintain. If the user logs out (token discarded) or the token expires, you may want to disconnect their socket or reject future events from it.

    Error Handling – If a socket fails authentication, you should not serve any events to it. In the above middleware example, calling next(new Error("Authentication error")) will prevent the socket from connecting. On the client, you should handle the disconnect or error event to know that the connection was refused (and possibly prompt re-login or refresh the token).

    Security – All messages over an authenticated socket should still be validated server-side (don’t trust data just because the socket is authenticated). The JWT mainly tells you who the client is. You should still enforce authorization for specific actions. For instance, if user A tries to emit an event to delete user B’s data, your server logic should prevent that by checking the IDs. In summary, treat socket auth with the same level of scrutiny as HTTP auth.

(These Socket.IO integration steps won’t be fully coded in a basic template, but the template’s structure can include a socket setup file and demonstrate the pattern for adding JWT auth to sockets. Developers can then reuse that pattern in projects that need real-time features.)
8. Environment Variables and Configuration (.env)

Set up environment variables for all secrets and config values to avoid hardcoding them. Create a .env file for local development and use a .env.example to document the required keys. Key variables to include:

    JWT_SECRET – Secret key used to sign/verify JWT tokens. This must be a strong, random string (e.g. 32+ characters)​
    medium.com
    . In production, store it securely (environment config or secret manager) and never commit it to code. The template’s .env.example should list this as a placeholder (e.g. JWT_SECRET=changeme), and the code will load it via process.env.JWT_SECRET.

    JWT_EXPIRES_IN – (Optional) Duration for JWT expiration. For example JWT_EXPIRES_IN=1h or 3600s. You can default this in code instead, but having it configurable allows easy tuning. If using refresh tokens, you might also have REFRESH_EXPIRES_IN.

    DATABASE_URL / DATABASE_FILE – The path/URL to the SQLite database. For SQLite, this could be a file path (e.g. ./data/dev.db). If you want to support multiple environments or use a different DB in production, this variable could change (e.g. point to a PostgreSQL connection string in the future). The code should read this and initialize the DB accordingly.

    PORT – The port on which the Express server runs (e.g. 3000). This allows flexibility to run the app on different ports or as specified by hosting (often hosts set PORT in env). The app will use process.env.PORT || 3000 when starting the server.

    NODE_ENV – Set to "development" or "production" to distinguish environment. In production, you might enable extra security (e.g. enforce HTTPS, different logging, etc.). This template can use NODE_ENV to conditionally load things like logger or stack traces.

    BCRYPT_SALT_ROUNDS – (Optional) Number of salt rounds for bcrypt (if you want to configure hashing cost via env). Default could be 10 if not set.

    Other Secrets – If the app grows, things like third-party API keys, OAuth secrets, etc., would also go here. For the auth template itself, the main secret is the JWT secret.

    .env.example – This file should list all the above keys with example values or blank. It serves as documentation for anyone using the template on what env vars to set. For instance:

# .env.example
JWT_SECRET=your_jwt_secret_here  
JWT_EXPIRES_IN=1h  
DATABASE_FILE=./data/dev.db  
PORT=3000  

The template should instruct users to copy this to .env and fill in real values. Ensure .env is in .gitignore so that sensitive info never gets committed. Storing secrets in env variables is a secure practice​
medium.com
.

Config Module – Optionally, have a config file or module that reads these env vars and provides defaults. For example, a config.js that does:

    module.exports = {
      port: process.env.PORT || 3000,
      jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret',
      jwtExpires: process.env.JWT_EXPIRES_IN || '1h',
      dbPath: process.env.DATABASE_FILE || ':memory:'
    };

    This makes it easy to use configuration throughout the app and see all defaults in one place. In a simple starter, this might be done inline in the app, but a config module is a good pattern for larger projects.

9. Optional Frontend-Facing Routes (User Info & Utilities)

In addition to the core auth endpoints, it’s useful to provide a few utility routes for the frontend to retrieve user info or perform common actions after login. These routes enhance integration with client applications but are not strictly required for auth to function. Examples include:

    GET /me (Current User Profile) – Returns the profile of the currently authenticated user. The client uses this to fetch the user’s data (e.g. on app startup to verify the login status and get user details). This route should be protected with authenticateToken (so you know which user is requesting). On the server, after the middleware sets req.user, the handler can query the database for that user’s record (by req.user.id) and return the user object (often excluding sensitive fields like password hash). For example, it might return { id, username, email, role, created_at }. This lets the frontend display the user’s info and confirm the token is valid. If the token is invalid or expired, this route will return 401 (which the frontend can interpret as “not logged in”).

    POST /logout – In a JWT stateless context, logout can be handled entirely on the client (just remove the token). However, you can include a /logout endpoint for convenience or future use. For instance, if using refresh tokens or server-side token storage, the logout route can accept the token (or a refresh token) and invalidate it (e.g. add to blacklist or delete an entry in DB). In a simple template, /logout might not do much; you can implement it to just respond 200 OK (and the client will delete its token). It mainly serves as a logical endpoint for completeness.

    GET /health or /ping (optional) – A public endpoint that returns OK (used to check if server is running). Not directly auth-related, but many starters include something like this for testing deployment.

    User Management Routes (optional) – Depending on needs, you might add routes to update user info or password. For example, PUT /me to update the current user’s profile (name, email, etc.), or PUT /me/password to change password (requiring old password verification). These should require auth (user must be logged in) and use proper validation (e.g. password strength). They demonstrate how to modify protected resources. In the template, these can be left as placeholders or simple implementations to be expanded in real projects.

    Admin Routes (optional advanced) – If the template includes roles, you might show an example of an admin-only route. For instance, GET /users (like in some tutorials) to list all users, protected by an admin check. This showcases the authorize middleware. In a starter, you can just note that adding such routes is straightforward with the role system in place.

    Documentation & Testing – Ensure the template’s README or docs mention these routes so frontend developers know they exist. For example, document that /me returns the current user and requires a token. This helps others using the template understand how to integrate their frontend (e.g. they might call /me after receiving the JWT on login to get user details instead of encoding all details in the token).

Extensibility: The above routes are designed to cover common needs in any project. They can be extended or modified as needed. The modular structure (separating auth logic, using middleware, etc.) ensures that adding new routes or features (like password reset, email verification, social login, etc.) is easier. The goal is to provide a secure foundation with sensible defaults (hashed passwords, JWT auth, env-configured secrets, etc.) that other projects can reuse and build upon confidently. Each component in this checklist can be seen as a starting point that encourages best practices while remaining flexible for future requirements.
jasonwatmore.com
​
medium.com