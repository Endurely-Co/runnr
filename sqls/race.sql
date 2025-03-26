CREATE TABLE race(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    loop_km DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    start_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    cutoff_time INTERVAL NOT NULL,
    user_id INT,
    CONSTRAINT fk_customer
        FOREIGN KEY(user_id)
            REFERENCES users(id)
);


