DROP TABLE IF EXISTS allBooks;

CREATE TABLE allBooks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR (255),
    description Text,
    image VARCHAR(255) 

);

