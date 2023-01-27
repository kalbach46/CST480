import express, { Response } from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
import { z } from "zod";


const BOOKS:string = "books";
const AUTHORS:string = "authors";

let app = express();
app.use(express.json());

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
    return await db.run(
        `INSERT INTO authors(id, name, bio) VALUES(
            '${id}', 
            '${name}', 
            '${bio}'
        )`
    );
}

async function addBook(id:number, author_id:number, title:string, pub_year:number, genre:string){
    return await db.run(
        `INSERT INTO books(id, author_id, title, pub_year, genre) VALUES(
            '${id}',
            '${author_id}',
            '${title}',
            '${pub_year}',
            '${genre}'
        )`
    );
}

async function validGenre(genre:string):Promise<boolean>{
    let out = await db.all(`SELECT genre FROM books WHERE genre='${genre}'`);
    return out.length>0;
}

async function validID(type:string, id:number){
    let out = await db.all(`SELECT ${id} from ${type} WHERE id=${id}`);
    return out.length>0;
}

async function authorHasBooks(id:number){
    let out = await db.all(`SELECT id FROM books WHERE author_id=${id}`);
    return out.length>0;
}

async function deleteResource(id:number, type:string){
    return await db.run(
        `DELETE FROM ${type}s WHERE id=${id}`
    );
}

async function deleteAuthorBooks(id:number){
    return await db.run(
        `DELETE FROM books WHERE author_id=${id}`
    );
}

async function getBookByGenre(genre:string){
    return await db.get(
        `SELECT * FROM books WHERE genre='${genre}'`
    );
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

type createResourceResponse = Response <Resource | Error>;
type getBooksResponse = Response <Array<Book> | Error>;
type getAuthorsResponse = Response <Array<Author> | Error>;

app.post("/addAuthor", async (req, res: createResourceResponse) => {
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
})

app.post("/addBook", async (req, res: createResourceResponse) => {
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
});

app.delete("/deleteResource", async (req, res) => {
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
})

app.get("/getBooks", async (req, res: getBooksResponse) => {
    if(req.query.id){
        let id:number = Number(req.query.id);
        let book = await getResourceByID(BOOKS, id);
        if(!await validID(BOOKS, id)){
            return res.status(400).json({ error : "book id doesn't exist in database"})
        }
        return res.json(book);

    } else if (req.query.genre){
        let genre:string = String(req.query.genre);
        let book = await getBookByGenre(genre);
        if(!await validGenre(genre)){
            return res.status(400).json({ error : "genre doesn't exist in database"})
        }
        return res.json(book);

    } else {
        let books:Array<Book> = await getAllOfType(BOOKS);
        return res.json(books);
    }
});

app.get("/getAuthors", async (req, res: getAuthorsResponse) => {
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
})


let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});