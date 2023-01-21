import express, { Response } from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
import { z } from "zod";

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

//
// TODO SQLITE EXAMPLES
// comment these out or they'll keep inserting every time you run your server
// if you get 'UNIQUE constraint failed' errors it's because
// this will keep inserting a row with the same primary key
// but the primary key should be unique
//

// TODO insert example
// await db.run(
//     "INSERT INTO authors(id, name, bio) VALUES('1', 'Figginsworth III', 'A traveling gentleman.')"
// );
// await db.run(
//     "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES ('1', '1', 'My Fairest Lady', '1866', 'romance')"
// );

// TODO insert example with parameterized queries
// important to use parameterized queries to prevent SQL injection
// when inserting untrusted data
// let statement = await db.prepare(
//     "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (?, ?, ?, ?, ?)"
// );
// await statement.bind(["2", "1", "A Travelogue of Tales", "1867", "adventure"]);
// await statement.run();

// TODO select examples
// let authors = await db.all("SELECT * FROM authors");
// console.log("Authors", authors);
// let books = await db.all("SELECT * FROM books WHERE author_id = '1'");
// console.log("Books", books);
// let filteredBooks = await db.all("SELECT * FROM books WHERE pub_year = '1867'");

// console.log("Some books", filteredBooks);

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

async function validAuthorID(author_id:number):Promise<boolean>{
    let out = await db.all(`SELECT id FROM authors WHERE id=${author_id}`);
    return out.length>0;
}

async function validBookID(id:number):Promise<boolean>{
    let out = await db.all(`SELECT id FROM books WHERE id=${id}`);
    return out.length>0;
}

async function validGenre(genre:string):Promise<boolean>{
    let out = await db.all(`SELECT genre FROM books WHERE genre='${genre}'`);
    return out.length>0;
}

async function authorHasBooks(id:number){
    let out = await db.all(`SELECT id FROM books WHERE author_id=${id}`);
    return out.length>0;
}

async function deleteBook(id:number){
    return await db.run(
        `DELETE FROM books WHERE id=${id}`
    );
}

async function deleteAuthor(id:number){
    return await db.run(
        `DELETE FROM authors WHERE id=${id}`
    );
}

async function deleteAuthorBooks(id:number){
    return await db.run(
        `DELETE FROM books WHERE author_id=${id}`
    );
}

async function getBookByID(id:number){
    return await db.get(
        `SELECT * FROM books WHERE id=${id}`
    );
}

async function getBookByGenre(genre:string){
    return await db.get(
        `SELECT * FROM books WHERE genre='${genre}'`
    );
}

async function getAllBooks(){
    return await db.all(
        `SELECT * FROM books`
    );
}

async function getAuthorByID(id:number){
    return await db.get(
        `SELECT * FROM authors WHERE id=${id}`
    );
}

async function getAllAuthors(){
    return await db.all(
        `SELECT * FROM authors`
    );
}
//
// TODO EXPRESS EXAMPLES
//

// TODO GET/POST/DELETE example
// interface Foo {
//     message: string;
// }
// interface Ye {
//     result: string;
// }
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
// type YeResponse = Response<Ye | Error>;
// type FooResponse = Response<Foo | Error>;
type createResourceResponse = Response <Resource | Error>;
type getBookResponse = Response <Book | Error>;
type getBooksResponse = Response <Array<Book> | Error>;
type getAuthorResponse = Response <Author | Error>;
type getAuthorsResponse = Response <Array<Author> | Error>;
// res's type limits what responses this request handler can send
// it must send either an object with a message or an error
// app.get()
app.post("/addAuthor", async (req, res: createResourceResponse) => {
    let id:number = await generateUniqueID("authors");
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
    let id:number = await generateUniqueID("books");

    let author_id:number = req.body.author_id;
    if(!(await validAuthorID(author_id))){
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

app.delete("/deleteBook", async (req, res) => {
    let id:number = Number(req.query.id);
    if(!(await validBookID(id))){
        return res.status(400).json({ error : "book id doesn't exist in database"});
    }
    deleteBook(id).then(() => {
        res.sendStatus(200);
    });
})

app.delete("/deleteAuthor", async (req, res) => {
    let author_id:number = Number(req.query.id);
    if(!(await validAuthorID(author_id))){
        return res.status(400).json({ error : "author id doesn't exist in database"});
    }
    if(await authorHasBooks(author_id)){
        deleteAuthorBooks(author_id);
    }
    deleteAuthor(author_id).then(() => {
        res.sendStatus(200);
    });
})

app.get("/getBook", async (req, res: getBookResponse) => {
    let id:number = Number(req.query.id);
    let book = await getBookByID(id);
    if(!await validBookID(id)){
        return res.status(400).json({ error : "book id doesn't exist in database"})
    }

    return res.json({
        id: book.id,
        author_id: book.author_id,
        title: book.title,
        pub_year: book.pub_year,
        genre: book.genre
    });
})

app.get("/getBookByGenre", async (req, res: getBookResponse) => {
    let genre:string = String(req.query.genre);
    let book = await getBookByGenre(genre);
    if(!await validGenre(genre)){
        return res.status(400).json({ error : "genre doesn't exist in database"})
    }
    return res.json({
        id: book.id,
        author_id: book.author_id,
        title: book.title,
        pub_year: book.pub_year,
        genre: book.genre
    })
})

app.get("/getAllBooks", async (req, res: getBooksResponse) => {
    let books:Array<Book> = await getAllBooks();
    let out:Array<Book> = [];
    books.forEach(book => {
        out.push({
            id: book.id,
            author_id: book.author_id,
            title: book.title,
            pub_year: book.pub_year,
            genre: book.genre
        })
    });
    return res.json(out);
})

app.get("/getAuthor", async (req, res: getAuthorResponse) => {
    let author_id:number = Number(req.query.id);
    let author = await getAuthorByID(author_id);
    if(!await validAuthorID(author_id)){
        return res.status(400).json({ error : "author id doesn't exist in database"})
    }
    return res.json({
        id: author.id,
        name: author.name,
        bio: author.bio
    });
})

app.get("/getAllAuthors", async (req, res: getAuthorsResponse) => {
    let authors:Array<Author> = await getAllAuthors();
    let out:Array<Author> = [];
    authors.forEach(author => {
        out.push({
            id: author.id,
            name: author.name,
            bio: author.bio
        });
    });
    return res.json(out);
})
// app.get("/ye", (req, res: FooResponse) => {
//     return res.json({message: 'yee'});
// });
// app.get("/foo", (req, res: FooResponse) => {
//     if (!req.query.bar) {
//         return res.status(400).json({ error: "bar is required" });
//     }
//     return res.json({ message: `You sent: ${req.query.bar} in the query` });
// });
// app.post("/ye", (req, res: YeResponse) => {
//     let query = req.query.query;
//     let body = req.body.body;
//     return res.json({ result: `query is ${query} and body is ${body}` });
// });
// app.post("/foo", (req, res: FooResponse) => {
//     if (!req.body.bar) {
//         return res.status(400).json({ error: "bar is required" });
//     }
//     return res.json({ message: `You sent: ${req.body.bar} in the body` });
// });
// app.delete("/foo", (req, res) => {
//     // etc.
//     res.sendStatus(200);
// });

//
// TODO ASYNC/AWAIT EXAMPLE
//

// function sleep(ms: number) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
// }
// // need async keyword on request handler to use await inside it
// app.get("/bar", async (req, res: FooResponse) => {
//     console.log("Waiting...");
//     // await is equivalent to calling sleep.then(() => { ... })
//     // and putting all the code after this in that func body ^
//     await sleep(3000);
//     // if we omitted the await, all of this code would execute
//     // immediately without waiting for the sleep to finish
//     console.log("Done!");
//     return res.sendStatus(200);
// });
// test it out! while server is running:
// curl http://localhost:3000/bar

// run server
let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
