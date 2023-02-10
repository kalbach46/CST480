import axios, { AxiosError } from "axios";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
import argon2 from "argon2";

let port = 3000;
let host = "localhost";
let protocol = "http";
let api = "api";
let auth = "auth";
let baseUrl = `${protocol}://${host}:${port}/${api}`;
let authUrl = `${protocol}://${host}:${port}/${auth}`;


let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");

const AUTHOR_NAME : string = "John Wick";
const AUTHOR_BIO : string = "author bio";
const BOOK_TITLE : string = "Harry Potter";
const PUB_YEAR : number = 2001;
const GENRE : string = "Fiction";
const USERNAME : string = 'kalbach46';
const PASSWORD : string = 'password';

// clear database before all tests
beforeEach(() => {
    db.run(
        "DELETE FROM books WHERE 1=1"
    );
    db.run(
        "DELETE FROM authors WHERE 1=1"
    );
})

//clear database after each run
afterAll(() => {
    db.run(
        "DELETE FROM books WHERE 1=1"
    );
    db.run(
        "DELETE FROM authors WHERE 1=1"
    );
})

// //CREATE AUTHOR TESTS
// describe("Create Author Tests", () => {
//     test("create author happy path", async () => {
//         let name : string = AUTHOR_NAME;
//         let bio : string = AUTHOR_BIO;
//         let result = await axios.post(`${baseUrl}/addAuthor`, {name, bio});
//         expect(await isAuthorInTable(result.data.id, name, bio)).toBeTruthy();
//     });
    
//     test("create two authors with same data", async () => {
//         let name : string = AUTHOR_NAME;
//         let bio : string = AUTHOR_BIO;
//         let result1 = await axios.post(`${baseUrl}/addAuthor`, {name, bio});
//         let result2 = await axios.post(`${baseUrl}/addAuthor`, {name, bio});
//         expect(await isAuthorInTable(result1.data.id, name, bio)).toBeTruthy();
//         expect(await isAuthorInTable(result2.data.id, name, bio)).toBeTruthy();
//     });
    
//     test("invalid author name", async () => {
//         let name : string = "this name is over 20 chars and that's just too long";
//         let bio : string = AUTHOR_BIO;
//         try{
//             await axios.post(`${baseUrl}/addAuthor`, {name, bio});
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "author name must be <20 chars"});
//         }
//     });
// })

// //CREATE BOOK TESTS
// describe("Create book tests", () => {
//     test("create book happy path", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let title:string = BOOK_TITLE;
//         let pub_year:number = PUB_YEAR;
//         let genre:string = GENRE;
//         let result = await axios.post(`${baseUrl}/addBook`, {author_id, title, pub_year, genre});
//         expect(await isBookInTable(result.data.id, author_id, title, pub_year, genre)).toBeTruthy();
//     });
    
//     test("create two books with same data", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let title:string = BOOK_TITLE;
//         let pub_year:number = PUB_YEAR;
//         let genre:string = GENRE;
//         let result1 = await axios.post(`${baseUrl}/addBook`, {author_id, title, pub_year, genre});
//         let result2 = await axios.post(`${baseUrl}/addBook`, {author_id, title, pub_year, genre});
//         expect(await isBookInTable(result1.data.id, author_id, title, pub_year, genre)).toBeTruthy();
//         expect(await isBookInTable(result2.data.id, author_id, title, pub_year, genre)).toBeTruthy();
//     });
    
//     test("invalid author_id", async () => { 
//         await initializeAuthor();
//         let author_id:number = 100;
//         let title:string = BOOK_TITLE;
//         let pub_year:number = PUB_YEAR;
//         let genre:string = GENRE;
//         try{
//             await axios.post(`${baseUrl}/addBook`, {author_id, title, pub_year, genre});
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "author id doesn't exist in database"});
//         }
//     });
    
//     test("invalid title", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let title:string = "title is way too long and def over 20 characters";
//         let pub_year:number = PUB_YEAR;
//         let genre:string = GENRE;
//         try{
//             await axios.post(`${baseUrl}/addBook`, {author_id, title, pub_year, genre});
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "book title must be <20 chars"});
//         }
//     });
    
//     test("invalid pub_year (string)", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let title:string = BOOK_TITLE;
//         let pub_year:string = "nineteen forty-three";
//         let genre:string = GENRE;
//         try{
//             await axios.post(`${baseUrl}/addBook`, {author_id, title, pub_year, genre});
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "pub_year must be a 4-digit number"});
//         }
//     });
    
//     test("invalid pub_year (not 4 digits)", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let title:string = BOOK_TITLE;
//         let pub_year:number = 20450;
//         let genre:string = GENRE;
//         try{
//             await axios.post(`${baseUrl}/addBook`, {author_id, title, pub_year, genre});
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "pub_year must be a 4-digit number"});
//         }
//     });
    
// })

// //DELETE BOOKS
// describe("Delete book tests", () => {
//     test("delete book happy path", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let id:number = (await initializeBook(author_id)).data.id;
//         expect(await isBookInTable(id, author_id, BOOK_TITLE, PUB_YEAR, GENRE)).toBeTruthy();
//         await axios.delete(`${baseUrl}/deleteResource?id=${id}&type=book`);
//         expect(await isBookInTable(id, author_id, BOOK_TITLE, PUB_YEAR, GENRE)).toBeFalsy();
//     })
    
//     test("delete book invalid id", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let actual_id:number = (await initializeBook(author_id)).data.id;
//         let id:number = 100;
//         expect(await isBookInTable(actual_id, author_id, BOOK_TITLE, PUB_YEAR, GENRE)).toBeTruthy();
//         try{
//             await axios.delete(`${baseUrl}/deleteResource?id=${id}&type=book`);
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "book id doesn't exist in database"});
//             expect(await isBookInTable(actual_id, author_id, BOOK_TITLE, PUB_YEAR, GENRE)).toBeTruthy();
//         }
//     })
    
// })

// //DELETE AUTHORS
// describe("Delete author tests", () => {
//     test("delete author happy path", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         expect(await isAuthorInTable(author_id, AUTHOR_NAME, AUTHOR_BIO)).toBeTruthy();
//         await axios.delete(`${baseUrl}/deleteResource?id=${author_id}&type=author`);
//         expect(await isAuthorInTable(author_id, AUTHOR_NAME, AUTHOR_BIO)).toBeFalsy();
//     })
    
//     test("delete author with books associated", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let id:number = (await initializeBook(author_id)).data.id;
//         expect(await isAuthorInTable(author_id, AUTHOR_NAME, AUTHOR_BIO)).toBeTruthy();
//         expect(await isBookInTable(id, author_id, BOOK_TITLE, PUB_YEAR, GENRE)).toBeTruthy();
//         await axios.delete(`${baseUrl}/deleteResource?id=${author_id}&type=author`);
//         expect(await isAuthorInTable(author_id, AUTHOR_NAME, AUTHOR_BIO)).toBeFalsy();
//         expect(await isBookInTable(id, author_id, BOOK_TITLE, PUB_YEAR, GENRE)).toBeFalsy();
    
//     })
    
//     test("delete author invalid author_id", async () => {
//         let actual_id:number = (await initializeAuthor()).data.id;
//         let author_id:number = 100;
//         expect(await isAuthorInTable(actual_id, AUTHOR_NAME, AUTHOR_BIO)).toBeTruthy();
//         try{
//             await axios.delete(`${baseUrl}/deleteResource?id=${author_id}&type=author`);
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "author id doesn't exist in database"});
//             expect(await isAuthorInTable(actual_id, AUTHOR_NAME, AUTHOR_BIO)).toBeTruthy();
//         }
//     })
// })

// //DELETE
// describe("Delete tests", () => {
//     test("Delete test with bad type in query string", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         expect(await isAuthorInTable(author_id, AUTHOR_NAME, AUTHOR_BIO)).toBeTruthy();
//         try{
//             await axios.delete(`${baseUrl}/deleteResource?id=${author_id}&type=bad`);
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "invalid request type (author, book)"});
//             expect(await isAuthorInTable(author_id, AUTHOR_NAME, AUTHOR_BIO)).toBeTruthy();
//         }
//     })
// })

// //GET BOOKS
// describe("Get books tests", () => {
//     test("get book by id happy path", async () => { 
//         let author_id:number = (await initializeAuthor()).data.id;
//         let id:number = (await initializeBook(author_id)).data.id;
//         let expectedBook = {
//             id: 1,
//             author_id: String(author_id),
//             title: BOOK_TITLE,
//             pub_year: String(PUB_YEAR),
//             genre: GENRE
//         };
//         let result = await axios.get(`${baseUrl}/getBooks?id=${id}`);
//         expect(result.data).toEqual(expectedBook);
//     })
    
//     test("get book invalid id", async () => {
//         let author_id:number = await (await initializeAuthor()).data.id;
//         await initializeBook(author_id);
//         let id:number = 100;
//         try{
//             await axios.get(`${baseUrl}/getBooks?id=${id}`);
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "book id doesn't exist in database"});
//         }
//     })

//     test("get book by genre happy path", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         await initializeBook(author_id);
//         let genre = 'Fiction';
//         let expectedBook = [{
//             id: 1,
//             author_id: String(author_id),
//             title: BOOK_TITLE,
//             pub_year: String(PUB_YEAR),
//             genre: genre
//         }];
//         let result = await axios.get(`${baseUrl}/getBooks?genre=${genre}`);
//         expect(result.data).toEqual(expectedBook);
//     })

//     test("get multiple books by genre happy path", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         await initializeBook(author_id);
//         await initializeBook(author_id);
//         let genre = 'Fiction';
//         let expectedBooks = [{
//             id: 1,
//             author_id: String(author_id),
//             title: BOOK_TITLE,
//             pub_year: String(PUB_YEAR),
//             genre: genre
//         },
//         {
//             id: 2,
//             author_id: String(author_id),
//             title: BOOK_TITLE,
//             pub_year: String(PUB_YEAR),
//             genre: genre
//         }];
//         let result = await axios.get(`${baseUrl}/getBooks?genre=${genre}`);
//         expect(result.data).toEqual(expectedBooks);
//     })

//     test("get book by genre invalid genre", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         await initializeBook(author_id);
//         let genre:string = "Fantasy";
//         try{
//             await axios.get(`${baseUrl}/getBooks?genre=${genre}`);
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "genre doesn't exist in database"});
//         }
//     })

//     test("get all books", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         await initializeBook(author_id)
//         await initializeBook(author_id)
//         let expectedBooks = [
//             {
//                 id: 1,
//                 author_id: String(author_id),
//                 title: BOOK_TITLE,
//                 pub_year: String(PUB_YEAR),
//                 genre: GENRE
//             },
//             {
//                 id: 2,
//                 author_id: String(author_id),
//                 title: BOOK_TITLE,
//                 pub_year: String(PUB_YEAR),
//                 genre: GENRE
//             },
//         ];
//         let result = await axios.get(`${baseUrl}/getBooks`);
//         expect(result.data).toEqual(expectedBooks);
//     })
// })

// //GET AUTHORS
// describe("Get authors tests", () => {
//     test("get author by id happy path", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let expectedAuthor = [{
//             id: author_id,
//             name: AUTHOR_NAME,
//             bio: AUTHOR_BIO
//         }];

//         let result = await axios.get(`${baseUrl}/getAuthors?id=${author_id}`);
//         expect(result.data).toEqual(expectedAuthor);
//     })

//     test("get author invalid id", async () => {
//         await initializeAuthor();
//         let id:number = 100;
//         try{
//             await axios.get(`${baseUrl}/getAuthors?id=${id}`);
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "author id doesn't exist in database"});
//         }
//     })

//     test("get all authors", async () => {
//         await initializeAuthor();
//         await initializeAuthor();
//         let expectedAuthors = [
//             {
//                 id: 1,
//                 name: AUTHOR_NAME,
//                 bio: AUTHOR_BIO
//             },
//             {
//                 id: 2,
//                 name: AUTHOR_NAME,
//                 bio: AUTHOR_BIO
//             },
//         ];
//         let result = await axios.get(`${baseUrl}/getAuthors`);
//         expect(result.data).toEqual(expectedAuthors);
//     })
// })

// //EDIT BOOK INFO
// describe("Edit book tests", () => {
//     test("edit empty", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let id:number = (await initializeBook(author_id)).data.id;
//         let title:string = BOOK_TITLE;
//         let pub_year:number = PUB_YEAR;
//         let genre:string = GENRE;
//         let result = await axios.put(`${baseUrl}/editBook?id=${id}`, {});
//         expect(await isBookInTable(result.data.id, author_id, title, pub_year, genre)).toBeTruthy();
//     })
//     test("edit no book id", async () => {
//         try{
//             await axios.put(`${baseUrl}/editBook`, {});
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "must input a book id"});
//         }
//     })
//     test("edit book id doesn't exist", async () => {
//         let id:number = 1;
//         try{
//             await axios.put(`${baseUrl}/editBook?id=${id}`, {});
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "book id doesn't exist in database"});
//         }
//     })
//     test("edit author happy path", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         console.log(author_id);
//         let newAuthorId:number = (await initializeAuthor()).data.id;
//         console.log(newAuthorId);
//         let id:number = (await initializeBook(author_id)).data.id;
//         let title:string = BOOK_TITLE;
//         let pub_year:number = PUB_YEAR;
//         let genre:string = GENRE;
//         let result = await axios.put(`${baseUrl}/editBook?id=${id}`, {author_id:newAuthorId});
//         expect(await isBookInTable(result.data.id, newAuthorId, title, pub_year, genre)).toBeTruthy();
//     })
//     test("edit invalid author", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let id:number = (await initializeBook(author_id)).data.id;
//         let newAuthorId:number = 2;
//         try{
//             await axios.put(`${baseUrl}/editBook?id=${id}`, {author_id:newAuthorId});
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "author id doesn't exist in database"});
//         }
//     })
//     test("edit title happy path", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let id:number = (await initializeBook(author_id)).data.id;
//         let newTitle:string = "new Title";
//         let pub_year:number = PUB_YEAR;
//         let genre:string = GENRE;
//         let result = await axios.put(`${baseUrl}/editBook?id=${id}`, {title:newTitle});
//         expect(await isBookInTable(result.data.id, author_id, newTitle, pub_year, genre)).toBeTruthy();
//     })
//     test("edit invalid title", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let id:number = (await initializeBook(author_id)).data.id;
//         let title:string = "title is way too long and def over 20 characters";
//         try{
//             await axios.put(`${baseUrl}/editBook?id=${id}`, {title:title});
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "book title must be <20 chars"});
//         }
//     })
//     test("edit pub year happy path", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let id:number = (await initializeBook(author_id)).data.id;
//         let title:string = BOOK_TITLE;
//         let newPubYear:number = 1901;
//         let genre:string = GENRE;
//         let result = await axios.put(`${baseUrl}/editBook?id=${id}`, {pub_year:newPubYear});
//         expect(await isBookInTable(result.data.id, author_id, title, newPubYear, genre)).toBeTruthy();
//     })
//     test("edit invalid pub_year not a number", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let id:number = (await initializeBook(author_id)).data.id;
//         let newPubYear:string = 'year';
//         try{
//             await axios.put(`${baseUrl}/editBook?id=${id}`, {pub_year:newPubYear});
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "pub_year must be a 4-digit number"});
//         }
//     })
//     test("edit invalid pub_year out of range", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let id:number = (await initializeBook(author_id)).data.id;
//         let newPubYear:number = 999;
//         try{
//             await axios.put(`${baseUrl}/editBook?id=${id}`, {pub_year:newPubYear});
//             fail('this call should return a 400');
//         } catch (error) {
//             let errorObj = error as AxiosError;
    
//             if (errorObj.response === undefined) {
//                 throw errorObj;
//             }
    
//             let { response } = errorObj;
    
//             expect(response.status).toEqual(400);
//             expect(response.data).toEqual({error: "pub_year must be a 4-digit number"});
//         }
//     })
//     test("edit genre happy path", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let id:number = (await initializeBook(author_id)).data.id;
//         let title:string = BOOK_TITLE;
//         let pub_year:number = PUB_YEAR;
//         let newGenre:string = "newGenre";
//         let result = await axios.put(`${baseUrl}/editBook?id=${id}`, {genre:newGenre});
//         expect(await isBookInTable(result.data.id, author_id, title, pub_year, newGenre)).toBeTruthy();
//     })
//     test("edit everything happy path", async () => {
//         let author_id:number = (await initializeAuthor()).data.id;
//         let newAuthorId:number = (await initializeAuthor()).data.id;
//         let id:number = (await initializeBook(author_id)).data.id;
//         let newTitle:string = "newTitle";
//         let newPubYear:number = 1901;
//         let newGenre:string = "newGenre";
//         let result = await axios.put(`${baseUrl}/editBook?id=${id}`, {author_id:newAuthorId, title:newTitle, pub_year:newPubYear, genre:newGenre});
//         expect(await isBookInTable(result.data.id, newAuthorId, newTitle, newPubYear, newGenre)).toBeTruthy();
//     })
// })


//LOGIN
describe("Login tests", () => {
    test("login happy path", async () => {
        initializeUser();
        let id : number = 1;
        let username : string = USERNAME;
        let password : string = PASSWORD;
        let result = await axios.put(`${authUrl}/login`, {
            id:id,
            username:username,
            password:password
        });
        console.log(result.data);
    })
})

//-----------------HELPERS-----------------------
async function initializeAuthor() {
    let name : string = AUTHOR_NAME;
    let bio : string = AUTHOR_BIO;
    return axios.post(`${baseUrl}/addAuthor`, {name, bio});
}

async function initializeBook(author_id:number) {
    let title:string = BOOK_TITLE;
    let pub_year:number = PUB_YEAR;
    let genre:string = GENRE;
    return axios.post(`${baseUrl}/addBook`, {author_id, title, pub_year, genre});
}

async function initializeUser() {
    let id:number = 1;//TODO
    let username:string = USERNAME;
    let password:string = await argon2.hash(PASSWORD);
    let statement = await db.prepare(
        'INSERT INTO users(id, username, password) VALUES(?, ?, ?)'
    );
    await statement.bind([
        id,
        username,
        password
    ])
}

async function isAuthorInTable(id:number, name:string, bio:string):Promise<boolean>{
    let result = await db.all(`SELECT * FROM authors WHERE 
        id=${id} 
        AND name='${name}' 
        AND bio='${bio}'
    `);
    return result.length>0;
}

async function isBookInTable(id:number, author_id:number, title:string, pub_year:number, genre:string):Promise<boolean>{
    let result = await db.all(`SELECT * FROM books WHERE 
        id=${id} 
        AND author_id=${author_id}
        AND title='${title}'
        AND pub_year=${pub_year}
        AND genre='${genre}'
    `);
    return result.length>0;
}