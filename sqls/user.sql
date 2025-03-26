CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    isLoggedIn BOOL NOT NULL
);

CREATE TYPE USER_TYPE_OPTION AS ENUM('runner', 'volunteer', 'organiser');
ALTER TABLE users ADD COLUMN user_type USER_TYPE_OPTION NOT NULL;

UPDATE users SET user_type='organiser';
