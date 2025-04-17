 multi-player-light-post/
├── .env                      # Environment Variables (Create this manually, add to .gitignore)
│                             #   - JWT_SECRET=your_strong_secret
│                             #   - DATABASE_FILE=./data/dev.db
│                             #   - PORT=3000
│                             #   - (JWT_EXPIRES_IN=1h)
│
├── .env.example              # Template for .env (Good practice to create)
│
├── master-checklist.md       # Your project guide (You are here!)
│
├── package.json              # Node.js project dependencies & scripts
│
├── tsconfig.json             # TypeScript compiler options
│
└── src/                      # Source Code Root
    │
    ├── server.ts             # ENTRY POINT: Express app setup, middleware, server start
    │                         # -> /home/josec07/2025/Free/FullSpeed/multi-player-light-post/src/server.ts
    │
    ├── app.ts                # (Potentially integrate into server.ts or define core Express app instance)
    │                         # -> /home/josec07/2025/Free/FullSpeed/multi-player-light-post/src/app.ts
    │
    ├── config/               # Configuration Loading
    │   └── (index.ts)        #   - Reads .env, provides config object (Needs Creation)
    │                         #   -> /home/josec07/2025/Free/FullSpeed/multi-player-light-post/src/config/
    │
    ├── db/                   # Database Setup & Initialization
    │   └── (init.ts)         #   - Connects to SQLite, ensures schema exists (Needs Creation)
    │                         #   -> /home/josec07/2025/Free/FullSpeed/multi-player-light-post/src/db/
    │
    ├── models/               # Data Models & Database Query Logic
    │   └── (User.ts)         #   - User model definition, DB operations (findUser, createUser) (Needs Creation)
    │                         #   -> /home/josec07/2025/Free/FullSpeed/multi-player-light-post/src/models/
    │
    ├── routes/               # API Route Definitions
    │   ├── (index.ts)        #   - Main router combining all specific routes (Needs Creation)
    │   ├── (auth.ts)         #   - Auth endpoints (/register, /login) (Needs Creation)
    │   └── (users.ts)        #   - User endpoints (/me) (Needs Creation)
    │                         #   -> /home/josec07/2025/Free/FullSpeed/multi-player-light-post/src/routes/
    │
    ├── controllers/          # Route Handler Logic (Business Logic)
    │   ├── (authController.ts) #   - Logic for /register, /login (Needs Creation)
    │   └── (userController.ts) #   - Logic for /me (Needs Creation)
    │                         #   -> /home/josec07/2025/Free/FullSpeed/multi-player-light-post/src/controllers/
    │
    ├── middleware/           # Custom Middleware
    │   └── (authenticateToken.ts) # - JWT verification middleware (Needs Creation)
    │                         #   -> /home/josec07/2025/Free/FullSpeed/multi-player-light-post/src/middleware/
    │
    ├── utils/                # Utility Functions
    │   ├── (jwt.ts)          #   - JWT generation/verification helpers (Needs Creation)
    │   └── (password.ts)     #   - Bcrypt password hashing helpers (Needs Creation)
    │                         #   -> /home/josec07/2025/Free/FullSpeed/multi-player-light-post/src/utils/
    │
    ├── types/                # TypeScript Type Definitions (Directory)
    │   └── (index.ts)        #   - Shared types/interfaces (Optional, could use src/types.ts)
    │                         #   -> /home/josec07/2025/Free/FullSpeed/multi-player-light-post/src/types/
    │
    ├── types.ts              # Global Type Definitions (File)
    │                         # -> /home/josec07/2025/Free/FullSpeed/multi-player-light-post/src/types.ts
    │
    └── __tests__/            # Testing Suite
                              # -> /home/josec07/2025/Free/FullSpeed/multi-player-light-post/src/__tests__/
