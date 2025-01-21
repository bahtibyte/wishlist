CREATE TABLE IF NOT EXISTS stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    events INTEGER DEFAULT 0 CHECK (events >= 0),
    wishes INTEGER DEFAULT 0 CHECK (wishes >= 0),
    friends INTEGER DEFAULT 0 CHECK (friends >= 0),
    UNIQUE(user_id)
);