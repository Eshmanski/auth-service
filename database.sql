CREATE TABLE person (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_activate BOOLEAN NOT NULL DEFAULT FALSE,
    activation_link VARCHAR(255),
    UNIQUE(email)
);

CREATE TABLE token (
    id SERIAL PRIMARY KEY,
    person_id INTEGER,
    refresh_token VARCHAR(255),
    FOREIGN KEY (person_id) REFERENCES person (id)
);
