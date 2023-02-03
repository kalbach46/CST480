import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
import { z } from "zod";
import path from "path";
const BOOKS = "books";
const AUTHORS = "authors";
let app = express();
app.use(express.json());
// app.use(cors);
// create database "connection"
// use absolute path to avoid this issue
// https://github.com/TryGhost/node-sqlite3/issues/441
let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");
async function generateUniqueID(table) {
    let IDs = await db.all(`SELECT id FROM ${table}`);
    let arr = [];
    IDs.forEach(element => {
        arr.push(element.id);
    });
    let out = 1;
    if (arr.length != 0) {
        out = Math.max(...arr) + 1;
    }
    return out;
}
async function addAuthor(id, name, bio) {
    let statement = await db.prepare('INSERT INTO authors(id, name, bio) VALUES(?, ?, ?)');
    await statement.bind([
        id,
        name,
        bio
    ]);
    return await statement.run();
}
async function addBook(id, author_id, title, pub_year, genre) {
    let statement = await db.prepare('INSERT INTO books(id, author_id, title, pub_year, genre) VALUES(?, ?, ?, ?, ?)');
    await statement.bind([
        id,
        author_id,
        title,
        pub_year,
        genre
    ]);
    return await statement.run();
}
async function editBook(id, author_id, title, pub_year, genre) {
    let statement = await db.prepare(`UPDATE books 
        SET 
            author_id=IfNull(?, author_id),
            title=IfNull(?, title),
            pub_year=IfNull(?, pub_year),
            genre=IfNull(?, genre)
        WHERE id=?`);
    await statement.bind([
        author_id ? author_id : null,
        title ? title : null,
        pub_year ? pub_year : null,
        genre ? genre : null,
        id
    ]);
    return await statement.run();
}
async function validGenre(genre) {
    let statement = await db.prepare('SELECT genre FROM books WHERE genre=?');
    await statement.bind([
        genre
    ]);
    let out = await statement.all();
    return out.length > 0;
}
async function validID(type, id) {
    let statement = await db.prepare(`SELECT ? from ${type} WHERE id=?`);
    await statement.bind([
        id,
        id
    ]);
    let out = await statement.all();
    return out.length > 0;
}
async function authorHasBooks(id) {
    let statement = await db.prepare('SELECT id FROM books WHERE author_id=?');
    await statement.bind([
        id
    ]);
    let out = await statement.all();
    return out.length > 0;
}
async function deleteResource(id, type) {
    let statement = await db.prepare(`DELETE FROM ${type}s WHERE id=?`);
    await statement.bind([
        id
    ]);
    return await statement.run();
}
async function deleteAuthorBooks(id) {
    let statement = await db.prepare('DELETE FROM books WHERE author_id=?');
    await statement.bind([
        id
    ]);
    return await statement.run();
}
async function getBooksByGenre(genre) {
    let statement = await db.prepare('SELECT * FROM books WHERE genre=?');
    await statement.bind([
        genre
    ]);
    return await statement.all();
}
async function getResourceByID(type, id) {
    return await db.get(`SELECT * FROM ${type} WHERE id=${id}`);
}
async function getAllOfType(type) {
    return await db.all(`SELECT * FROM ${type}`);
}
var RequestType;
(function (RequestType) {
    RequestType["Author"] = "author";
    RequestType["Book"] = "book";
})(RequestType || (RequestType = {}));
app.post("/api/addAuthor", async (req, res) => {
    let id = await generateUniqueID(AUTHORS);
    let name = req.body.name;
    let bio = req.body.bio;
    try {
        const validAuthorName = z.string().max(20);
        validAuthorName.parse(name);
    }
    catch (e) {
        return res.status(400).json({ error: "author name must be <20 chars" });
    }
    addAuthor(id, name, bio).then(() => {
        return res.json({ id: id });
    });
});
app.post("/api/addBook", async (req, res) => {
    let id = await generateUniqueID(BOOKS);
    let author_id = req.body.author_id;
    if (!(await validID(AUTHORS, author_id))) {
        return res.status(400).json({ error: "author id doesn't exist in database" });
    }
    let title = req.body.title;
    try {
        const validTitle = z.string().max(20);
        validTitle.parse(title);
    }
    catch (e) {
        return res.status(400).json({ error: "book title must be <20 chars" });
    }
    let pub_year = req.body.pub_year;
    try {
        const validYear = z.number().min(1000).max(9999);
        validYear.parse(pub_year);
    }
    catch (e) {
        return res.status(400).json({ error: "pub_year must be a 4-digit number" });
    }
    let genre = req.body.genre;
    addBook(id, author_id, title, pub_year, genre).then(() => {
        return res.json({ id: id });
    });
});
app.delete("/api/deleteResource", async (req, res) => {
    let id = Number(req.query.id);
    let type = req.query.type;
    if (type == RequestType.Author) {
        if (!(await validID(AUTHORS, id))) {
            return res.status(400).json({ error: "author id doesn't exist in database" });
        }
        if (await authorHasBooks(id)) {
            deleteAuthorBooks(id);
        }
    }
    else if (type == RequestType.Book) {
        if (!(await validID(BOOKS, id))) {
            return res.status(400).json({ error: "book id doesn't exist in database" });
        }
    }
    else {
        return res.status(400).json({ error: "invalid request type (author, book)" });
    }
    deleteResource(id, type).then(() => {
        res.sendStatus(200);
    });
});
app.get("/api/getBooks", async (req, res) => {
    if (req.query.id) {
        let id = Number(req.query.id);
        let book = await getResourceByID(BOOKS, id);
        if (!await validID(BOOKS, id)) {
            return res.status(400).json({ error: "book id doesn't exist in database" });
        }
        return res.json(book);
    }
    else if (req.query.genre) {
        let genre = String(req.query.genre);
        let books = await getBooksByGenre(genre);
        if (!await validGenre(genre)) {
            return res.status(400).json({ error: "genre doesn't exist in database" });
        }
        return res.json(books);
    }
    else {
        let books = await getAllOfType(BOOKS);
        return res.json(books);
    }
});
app.get("/api/getAuthors", async (req, res) => {
    if (req.query.id) {
        let author_id = Number(req.query.id);
        let author = await getResourceByID(AUTHORS, author_id);
        if (!await validID(AUTHORS, author_id)) {
            return res.status(400).json({ error: "author id doesn't exist in database" });
        }
        return res.json([author]);
    }
    else {
        let authors = await getAllOfType(AUTHORS);
        return res.json(authors);
    }
});
app.put("/api/editBook", async (req, res) => {
    if (req.query.id) {
        let id = Number(req.query.id);
        if (!await validID(BOOKS, id)) {
            return res.status(400).json({ error: "book id doesn't exist in database" });
        }
        let author_id = req.body.author_id;
        if (author_id && !await validID(AUTHORS, author_id)) {
            return res.status(400).json({ error: "author id doesn't exist in database" });
        }
        let title = req.body.title;
        if (req.body.title) {
            try {
                const validTitle = z.string().max(20).optional();
                validTitle.parse(title);
            }
            catch (e) {
                return res.status(400).json({ error: "book title must be <20 chars" });
            }
        }
        let pub_year = req.body.pub_year;
        if (req.body.pub_year) {
            try {
                const validYear = z.number().min(1000).max(9999).optional();
                validYear.parse(pub_year);
            }
            catch (e) {
                return res.status(400).json({ error: "pub_year must be a 4-digit number" });
            }
        }
        let genre = req.body.genre;
        editBook(id, req.body.author_id, req.body.title, req.body.pub_year, req.body.genre).then(() => {
            return res.json({ id: Number(req.query.id) });
        });
    }
    else {
        return res.status(400).json({ error: "must input a book id" });
    }
});
let port = 3000;
let host = "localhost";
let protocol = "http";
app.use(express.static("public"));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'out', 'public', 'index.html'));
});
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
