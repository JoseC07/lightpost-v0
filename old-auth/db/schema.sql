-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- For a clean setup, drop tables in dependency order
DROP TABLE IF EXISTS spotlight_entries;
DROP TABLE IF EXISTS spotlight_competitions;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS regions;
DROP TABLE IF EXISTS users;

---------------------------------------------------
-- 1. Users Table (for authentication and roles)
---------------------------------------------------
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user', -- e.g., 'user', 'moderator', 'admin'
  verified_location BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------
-- 2. Regions Table (to support location-based features)
---------------------------------------------------
CREATE TABLE regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL, -- e.g., 'New York', 'Los Angeles'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------
-- 3. Categories Table (for content organization)
---------------------------------------------------
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------
-- 4. Posts Table (core content, now with location and author)
---------------------------------------------------
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,       -- Author of the post
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, -- Optional categorization
  region_id INTEGER REFERENCES regions(id) ON DELETE SET NULL,      -- For geolocation-based filtering
  spotlight_score NUMERIC DEFAULT 0,  -- Optional field to help calculate spotlight ranking
  ai_score NUMERIC DEFAULT 0,         -- AI-generated content score
  engagement_score NUMERIC DEFAULT 0,  -- User engagement metrics
  paid_boost_score NUMERIC DEFAULT 0,  -- Paid promotion boost
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------
-- 5. Votes Table (to record up/down votes on posts)
---------------------------------------------------
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Can be linked to a user or used for anonymous votes
  vote INTEGER CHECK (vote IN (1, -1)), -- 1 for upvote, -1 for downvote
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

---------------------------------------------------
-- 6. Spotlight Competitions Table (to track competition cycles)
---------------------------------------------------
CREATE TABLE spotlight_competitions (
  id SERIAL PRIMARY KEY,
  region_id INTEGER REFERENCES regions(id) ON DELETE CASCADE,  -- Competition tied to a specific region
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,  -- Tracks competitions per category
  competition_date DATE NOT NULL,  -- Date or period for competition
  winning_post_id INTEGER REFERENCES posts(id), -- Reference to the top-ranked post
  status VARCHAR(50) DEFAULT 'active', -- e.g., 'active', 'completed'
  duration_interval VARCHAR(50) DEFAULT 'weekly', -- Supports 'daily', 'weekly', 'monthly'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(region_id, category_id, competition_date)
);

---------------------------------------------------
-- 7. Spotlight Entries Table (link posts to spotlight competitions)
---------------------------------------------------
CREATE TABLE spotlight_entries (
  id SERIAL PRIMARY KEY,
  spotlight_competition_id INTEGER REFERENCES spotlight_competitions(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  score NUMERIC DEFAULT 0, -- Computed score based on votes, engagement, etc.
  rank INTEGER,           -- Ranking within the competition (calculated dynamically or stored)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(spotlight_competition_id, post_id)
);

---------------------------------------------------
-- 8. Indexes for Performance
---------------------------------------------------
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_region_id ON posts(region_id);
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_votes_post ON votes(post_id);
CREATE INDEX idx_regions_name ON regions(name);

-- CREATE INDEX idx_posts_ranking ON posts
-- (region_id, category_id, (ai_score + engagement_score + paid_boost_score));