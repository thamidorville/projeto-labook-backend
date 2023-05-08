-- Active: 1683404378631@@127.0.0.1@3306
CREATE TABLE users (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT DEFAULT (DATETIME()) NOT NULL
);

INSERT INTO users (id, name, email, password, role)
VALUES
  -- tipo NORMAL e senha = thami123
	('u001', 'Thamiris', 'thatha@email.com', '$2a$12$sfVyyFfDq2mJoHQurcVhcuGrWnmGgGGA/xDuGUriGvo1IfxU.Ftbe', 'NORMAL'),

  -- tipo NORMAL e senha = vini321
	('u002', 'Vinicius', 'Vini@email.com', '$2a$12$BjEg8YDBW7sZH.VVTq8jiO8tR91Fsphd2tBCIvJ.8QAnnDiNS3gz2', 'NORMAL'),

  -- tipo ADMIN e senha = dylabradoido123
	('u003', 'Dylan', 'bobdylan@email.com', '$2a$12$ZPsqSohnLN81RuwY3UI.9etbuq8uV.BVp/gHSy4zX9FLqNJD29Rjm', 'ADMIN');

    CREATE TABLE posts (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    creator_id TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT(0) NOT NULL,
    dislikes INTEGER DEFAULT(0) NOT NULL,
    created_at TEXT DEFAULT (DATETIME()) NOT NULL,
    updated_at TEXT DEFAULT (DATETIME()) NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

INSERT INTO posts (id, creator_id, content)
VALUES
('p001', 'u001', 'Mais um projeto em andamento!'),
('p002', 'u002', 'Persista, Thamiris! Você consegue!'),
('p003', 'u003', 'au au, mãe! Larga esses códigos e me leva para passear!');

CREATE TABLE likes_dislikes (
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    like INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
     ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id)
     ON UPDATE CASCADE
    ON DELETE CASCADE  
);

INSERT INTO likes_dislikes(user_id, post_id, like)
VALUES('u003', 'p001', 1),
('u001', 'p002', 1),
('u002', 'p003', 1);

UPDATE posts
SET likes = 2
WHERE id = 'p001';

UPDATE posts
SET likes = 1, dislikes = 1
WHERE id = 'p002';



--queries opcionais para caso quiser deletar
DROP TABLE likes_dislikes;
DROP TABLE posts;

DROP TABLE users;