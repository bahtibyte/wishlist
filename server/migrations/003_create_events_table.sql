CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL,
    event_date DATE NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL CHECK (color ~* '^#[0-9A-F]{6}$'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX events_user_id_idx ON events(user_id);