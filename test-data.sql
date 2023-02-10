INSERT INTO users (id, username, password) VALUES (
    '1',
    'kalbach46',
    '$argon2id$v=19$m=65536,t=3,p=4$RtJpRqBTF/3Ua9kqcQD+sg$bkOELvqWaKE9MoMyyOA9gLVg722pZsWjDi3buSyoT8Q'
);

INSERT INTO authors (id, name, bio) VALUES (
    '1',
    'JRR Tolkien',
    'biography'
),
(
    '2',
    'Stephen King',
    'bio'    
),
(
    '3',
    'John Wick',
    'yea'
);

INSERT INTO books (id, author_id, title, pub_year, genre) VALUES (
    '1',
    '1',
    'Fellowship of The Ring',
    '1980',
    'Fantasy'
),
(
    '2',
    '1',
    'The Two Towers',
    '1985',
    'Fantasy'
),
(
    '3',
    '1',
    'The Return of The King',
    '1990',
    'Fantasy'
),
(
    '4',
    '2',
    'IT',
    '1991',
    'Horror'
),
(
    '5',
    '2',
    'The Shining',
    '1994',
    'Horror'
),
(
    '6',
    '3',
    'John Wick: The Novel',
    '2022',
    'Action'
)