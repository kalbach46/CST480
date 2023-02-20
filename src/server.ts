import express, { Response } from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
import { z } from "zod";
import path from "path";
import argon2 from "argon2";
import crypto from "crypto";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";

const BOOKS:string = "books";
const AUTHORS:string = "authors";

let tokens:string[] = [];

let app = express();
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
dotenv.config({path:'../.env'});

let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");
await db.get("PRAGMA journal_mode=WAL");

async function generateUniqueID(table:string):Promise<number>{
    let IDs = await db.all(`SELECT id FROM ${table}`);
    let arr : Array<number> = [];
    IDs.forEach(element => {
        arr.push(element.id);
    });
    let out : number = 1;
    if(arr.length!=0){
        out = Math.max(...arr)+1;
    }
    return out;
}

async function addAuthor(id: number, name: string, bio: string) {
    let statement = await db.prepare(
        'INSERT INTO authors(id, name, bio) VALUES(?, ?, ?)'
    );
    await statement.bind([
        id, 
        name, 
        bio
    ]);
    return await statement.run();
}

async function addBook(id:number, author_id:number, title:string, pub_year:number, genre:string){
    let statement = await db.prepare(
        'INSERT INTO books(id, author_id, title, pub_year, genre) VALUES(?, ?, ?, ?, ?)'
    );
    await statement.bind([
        id,
        author_id,
        title,
        pub_year,
        genre
    ]);
    return await statement.run();
}

async function editBook(id:number, author_id:number, title:string, pub_year:number, genre:string){
    let statement = await db.prepare(
        `UPDATE books 
        SET 
            author_id=IfNull(?, author_id),
            title=IfNull(?, title),
            pub_year=IfNull(?, pub_year),
            genre=IfNull(?, genre)
        WHERE id=?`
    );
    await statement.bind([
        author_id ? author_id : null,
        title ? title : null,
        pub_year ? pub_year : null,
        genre ? genre : null,
        id
    ]);
    return await statement.run();
}

async function validGenre(genre:string):Promise<boolean>{
    let statement = await db.prepare(
        'SELECT genre FROM books WHERE genre=?'
    );
    await statement.bind([
        genre
    ]);
    let out = await statement.all();
    return out.length>0;
}

async function validID(type:string, id:number){
    let statement = await db.prepare(
        `SELECT ? from ${type} WHERE id=?`
    );
    await statement.bind([
        id,
        id
    ])
    let out = await statement.all();
    return out.length>0;
}

async function authorHasBooks(id:number){
    let statement = await db.prepare(
        'SELECT id FROM books WHERE author_id=?'
    );
    await statement.bind([
        id
    ]);
    let out = await statement.all();
    return out.length>0;
}

async function deleteResource(id:number, type:string){
    let statement = await db.prepare(
        `DELETE FROM ${type}s WHERE id=?`
    );
    await statement.bind([
        id
    ]);
    return await statement.run();
}

async function deleteAuthorBooks(id:number){
    let statement = await db.prepare(
        'DELETE FROM books WHERE author_id=?'
    );
    await statement.bind([
        id
    ]);
    return await statement.run();
}

async function getBooksByGenre(genre:string){
    let statement = await db.prepare(
        'SELECT * FROM books WHERE genre=?'
    );
    await statement.bind([
        genre
    ]);
    return await statement.all();
}

async function getResourceByID(type:string, id:number){
    return await db.get(
        `SELECT * FROM ${type} WHERE id=${id}`
    );
}

async function getAllOfType(type:string){
    return await db.all(
        `SELECT * FROM ${type}`
    )
}

function verifyToken(token:string){
    return tokens.indexOf(token) != -1;
}

enum RequestType {
    Author = "author",
    Book = "book"
}

interface Error {
    error: string;
}
interface Resource {
    id: number;
}
interface Book {
    id: number,
    author_id: number,
    title: string,
    pub_year: number,
    genre: string;
}
interface Author {
    id: number,
    name: string,
    bio: string
}
interface Token {
    token:string
}

type resourceResponse = Response <Resource | Error>;
type getBooksResponse = Response <Array<Book> | Error>;
type getAuthorsResponse = Response <Array<Author> | Error>;
type loginResponse = Response <Token | Error>;

app.post("/api/addAuthor", async (req, res: resourceResponse) => {
    if(verifyToken(req.cookies.token)){
        let id:number = await generateUniqueID(AUTHORS);
        let name:string = req.body.name;
        let bio:string = req.body.bio;
        try{
            const validAuthorName = z.string().max(20);
            validAuthorName.parse(name);
        } catch (e) {
            return res.status(400).json({ error : "author name must be <20 chars"});
        }
    
        addAuthor(id, name, bio).then(() => {
            return res.json({id : id});
        })
    } else {
        res.set({'Set-Cookie':[`loggedIn=false; Path=/`]});
        return res.status(403);
    }
})

app.post("/api/addBook", async (req, res: resourceResponse) => {
    if(verifyToken(req.cookies.token)){
        let id:number = await generateUniqueID(BOOKS);

        let author_id:number = req.body.author_id;
        if(!(await validID(AUTHORS, author_id))){
            return res.status(400).json({ error : "author id doesn't exist in database"});
        }
    
        let title:string = req.body.title;
        try{
            const validTitle = z.string().max(20);
            validTitle.parse(title);
        } catch (e) {
            return res.status(400).json({ error : "book title must be <20 chars"});
        }
    
        let pub_year:number = req.body.pub_year;
        try{
            const validYear = z.number().min(1000).max(9999);
            validYear.parse(pub_year);
        } catch (e) {
            return res.status(400).json({error : "pub_year must be a 4-digit number"});
        }
        let genre:string = req.body.genre;
        addBook(id, author_id, title, pub_year, genre).then(() => {
            return res.json({id : id})
        });
    } else {
        res.set({'Set-Cookie':[`loggedIn=false; Path=/`]});
        return res.status(403);
    }
});

app.delete("/api/deleteResource", async (req, res) => {
    if(verifyToken(req.cookies.token)){
        let id:number = Number(req.query.id);
        let type:RequestType = <RequestType> req.query.type;
    
        if(type==RequestType.Author){
            if(!(await validID(AUTHORS, id))){
                return res.status(400).json({ error : "author id doesn't exist in database"});
            }
            if(await authorHasBooks(id)){
                deleteAuthorBooks(id);
            }
        } else if (type==RequestType.Book){
            if(!(await validID(BOOKS, id))){
                return res.status(400).json({ error : "book id doesn't exist in database"});
            }
        } else {
            return res.status(400).json({error : "invalid request type (author, book)"})
        }
    
        deleteResource(id, type).then(() => {
            res.sendStatus(200);
        })
    } else {
        res.set({'Set-Cookie':[`loggedIn=false; Path=/`]});
        return res.status(403);
    }
})

app.get("/api/getBooks", async (req, res: getBooksResponse) => {
    if(verifyToken(req.cookies.token)){
        if(req.query.id){
            let id:number = Number(req.query.id);
            let book = await getResourceByID(BOOKS, id);
            if(!await validID(BOOKS, id)){
                return res.status(400).json({ error : "book id doesn't exist in database"})
            }
            return res.json(book);
    
        } else if (req.query.genre){
            let genre:string = String(req.query.genre);
            let books = await getBooksByGenre(genre);
            if(!await validGenre(genre)){
                return res.status(400).json({ error : "genre doesn't exist in database"})
            }
            return res.json(books);
    
        } else {
            let books:Array<Book> = await getAllOfType(BOOKS);
            return res.json(books);
        }
    } else {
        res.set({'Set-Cookie':[`loggedIn=false; Path=/`]});
        return res.status(403).json({error : "invalid session token"});
    }
});

app.get("/api/getAuthors", async (req, res: getAuthorsResponse) => {
    if(verifyToken(req.cookies.token)){
        if(req.query.id){
            let author_id:number = Number(req.query.id);
            let author = await getResourceByID(AUTHORS, author_id);
            if(!await validID(AUTHORS, author_id)){
                return res.status(400).json({ error : "author id doesn't exist in database"})
            }
            return res.json([author]);
            
        } else {
            let authors:Array<Author> = await getAllOfType(AUTHORS);
            return res.json(authors);
        }
    } else {
        res.set({'Set-Cookie':[`loggedIn=false; Path=/`]});
        return res.status(403);
    }
})

app.put("/api/editBook", async (req, res: resourceResponse) => {
    if(verifyToken(req.cookies.token)){
        if(req.query.id){
            let id:number = Number(req.query.id);
            if(!await validID(BOOKS, id)){
                return res.status(400).json({error : "book id doesn't exist in database"})
            }
            let author_id:number = req.body.author_id;
            if(author_id && !await validID(AUTHORS, author_id)){
                return res.status(400).json({error : "author id doesn't exist in database"})
            }
    
            let title:string = req.body.title;
            if(req.body.title){
                try{
                    const validTitle = z.string().max(20).optional();
                    validTitle.parse(title);
                } catch (e) {
                    return res.status(400).json({ error : "book title must be <20 chars"});
                }
            }
    
            let pub_year:number = req.body.pub_year;
            if(req.body.pub_year){
                try{
                    const validYear = z.number().min(1000).max(9999).optional();
                    validYear.parse(pub_year);
                } catch (e) {
                    return res.status(400).json({error : "pub_year must be a 4-digit number"});
                }
            }
    
            let genre:string = req.body.genre;
            editBook(id, req.body.author_id, req.body.title, req.body.pub_year, req.body.genre).then(() => {
                return res.json({id : Number(req.query.id)})
            })
        } else {
            return res.status(400).json({error : "must input a book id"})
        }
    } else {
        return res.status(403);
    }
})

app.put("/auth/login", async (req, res: loginResponse) => {
    let password:string = req.body.password;
    let username:string = req.body.username;

    let statement = await db.prepare(
        'SELECT * FROM users WHERE username=?'
    );
    await statement.bind([username]);
    let user = await statement.get();
    await statement.finalize();
    if(!user){
        return res.status(400).json({error: "no user exists with that username"});
    }
    let hashed_pass = user.password;
    if(await argon2.verify(hashed_pass, password)){
        let token = crypto.randomBytes(16).toString('hex');
        tokens.push(token);
        res.set({'Set-Cookie':[`loggedIn=true; Path=/`, `token=${token}; httponly; Path=/`]});
        return res.json({token:token});
    } else {
        res.status(400).json({error: "password is incorrect"});
    }
})

let port = 3000;
let host = "localhost";
let protocol = "http";
app.use(express.static("public"));
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'out', 'public', 'index.html'));
})
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
