CREATE TABLE [user] (
    id bigint NOT NULL,
    username varchar(50) NOT NULL,
    birthdate date NOT NULL,
    email varchar(50),

    PRIMARY KEY(id)
);