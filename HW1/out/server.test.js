import axios from "axios";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
let port = 3000;
let host = "localhost";
let protocol = "http";
let baseUrl = `${protocol}://${host}:${port}`;
let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");
const AUTHOR_NAME = "John Wick";
const AUTHOR_BIO = "author bio";
const BOOK_TITLE = "Harry Potter";
const PUB_YEAR = 2001;
const GENRE = "Fiction";
// clear database before all tests
beforeEach(() => {
    db.run("DELETE FROM books WHERE 1=1");
    db.run("DELETE FROM authors WHERE 1=1");
});
//clear database after each run
afterAll(() => {
    db.run("DELETE FROM books WHERE 1=1");
    db.run("DELETE FROM authors WHERE 1=1");
});
// test("GET /foo?bar returns message", async () => {
//     let bar = "xyzzy";
//     let { data } = await axios.get(`${baseUrl}/foo?bar=${bar}`);
//     expect(data).toEqual({ message: `You sent: ${bar} in the query` });
// });
// test("GET /foo returns error", async () => {
//     try {
//         await axios.get(`${baseUrl}/foo`);
//     } catch (error) {
//         // casting needed b/c typescript gives errors "unknown" type
//         let errorObj = error as AxiosError;
//         // if server never responds, error.response will be undefined
//         // throw the error so typescript can perform type narrowing
//         if (errorObj.response === undefined) {
//             throw errorObj;
//         }
//         // now, after the if-statement, typescript knows
//         // that errorObj can't be undefined
//         let { response } = errorObj;
//         // TODO this test will fail, replace 300 with 400
//         expect(response.status).toEqual(300);
//         expect(response.data).toEqual({ error: "bar is required" });
//     }
// });
// test("POST /bar works good", async () => {
//     let bar = "xyzzy";
//     let result = await axios.post(`${baseUrl}/foo`, { bar });
//     expect(result.data).toEqual({ message: `You sent: ${bar} in the body` });
// });
//TODO new tests
// test("Test GET ye", async () => {
//     let result = await axios.get(`${baseUrl}/ye`);
//     console.log(result);
//     expect(result.data).toEqual({ message: 'yee'});
// });
// test("test POST body vs query string", async () => {
//     let query = "query";
//     let body = "body";
//     let result = await axios.post(`${baseUrl}/ye?query=${query}`, { body });
//     expect(result.data).toEqual({ result: `query is ${query} and body is ${body}`});
// });
//CREATE AUTHOR TESTS
describe("Create Author Tests", () => {
    test("create author happy path", async () => {
        let name = AUTHOR_NAME;
        let bio = AUTHOR_BIO;
        let result = await axios.post(`${baseUrl}/addAuthor`, { name, bio });
        expect(await isAuthorInTable(result.data.id, name, bio)).toBeTruthy();
    });
    test("create two authors with same data", async () => {
        let name = AUTHOR_NAME;
        let bio = AUTHOR_BIO;
        let result1 = await axios.post(`${baseUrl}/addAuthor`, { name, bio });
        let result2 = await axios.post(`${baseUrl}/addAuthor`, { name, bio });
        expect(await isAuthorInTable(result1.data.id, name, bio)).toBeTruthy();
        expect(await isAuthorInTable(result2.data.id, name, bio)).toBeTruthy();
    });
    test("invalid author name", async () => {
        let name = "this name is over 20 chars and that's just too long";
        let bio = AUTHOR_BIO;
        try {
            await axios.post(`${baseUrl}/addAuthor`, { name, bio });
            fail('this call should return a 400');
        }
        catch (error) {
            let errorObj = error;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({ error: "author name must be <20 chars" });
        }
    });
});
//CREATE BOOK TESTS
describe("Create book tests", () => {
    test("create book happy path", async () => {
        let author_id = await (await initializeAuthor()).data.id;
        let title = BOOK_TITLE;
        let pub_year = PUB_YEAR;
        let genre = GENRE;
        let result = await axios.post(`${baseUrl}/addBook`, { author_id, title, pub_year, genre });
        expect(await isBookInTable(result.data.id, author_id, title, pub_year, genre)).toBeTruthy();
    });
    test("create two books with same data", async () => {
        let author_id = await (await initializeAuthor()).data.id;
        let title = BOOK_TITLE;
        let pub_year = PUB_YEAR;
        let genre = GENRE;
        let result1 = await axios.post(`${baseUrl}/addBook`, { author_id, title, pub_year, genre });
        let result2 = await axios.post(`${baseUrl}/addBook`, { author_id, title, pub_year, genre });
        expect(await isBookInTable(result1.data.id, author_id, title, pub_year, genre)).toBeTruthy();
        expect(await isBookInTable(result2.data.id, author_id, title, pub_year, genre)).toBeTruthy();
    });
    test("invalid author_id", async () => {
        await initializeAuthor();
        let author_id = 100;
        let title = BOOK_TITLE;
        let pub_year = PUB_YEAR;
        let genre = GENRE;
        try {
            await axios.post(`${baseUrl}/addBook`, { author_id, title, pub_year, genre });
            fail('this call should return a 400');
        }
        catch (error) {
            let errorObj = error;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({ error: "author id doesn't exist in database" });
        }
    });
    test("invalid title", async () => {
        let author_id = await (await initializeAuthor()).data.id;
        let title = "title is way too long and def over 20 characters";
        let pub_year = PUB_YEAR;
        let genre = GENRE;
        try {
            await axios.post(`${baseUrl}/addBook`, { author_id, title, pub_year, genre });
            fail('this call should return a 400');
        }
        catch (error) {
            let errorObj = error;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({ error: "book title must be <20 chars" });
        }
    });
    test("invalid pub_year (string)", async () => {
        let author_id = await (await initializeAuthor()).data.id;
        let title = BOOK_TITLE;
        let pub_year = "nineteen forty-three";
        let genre = GENRE;
        try {
            await axios.post(`${baseUrl}/addBook`, { author_id, title, pub_year, genre });
            fail('this call should return a 400');
        }
        catch (error) {
            let errorObj = error;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({ error: "pub_year must be a 4-digit number" });
        }
    });
    test("invalid pub_year (not 4 digits)", async () => {
        let author_id = await (await initializeAuthor()).data.id;
        let title = BOOK_TITLE;
        let pub_year = 20450;
        let genre = GENRE;
        try {
            await axios.post(`${baseUrl}/addBook`, { author_id, title, pub_year, genre });
            fail('this call should return a 400');
        }
        catch (error) {
            let errorObj = error;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({ error: "pub_year must be a 4-digit number" });
        }
    });
});
//DELETE BOOKS
describe("Delete book tests", () => {
    test("delete book happy path", async () => {
        let author_id = await (await initializeAuthor()).data.id;
        let id = await (await initializeBook(author_id)).data.id;
        expect(await isBookInTable(id, author_id, BOOK_TITLE, PUB_YEAR, GENRE)).toBeTruthy();
        await axios.delete(`${baseUrl}/deleteBook?id=${id}`);
        expect(await isBookInTable(id, author_id, BOOK_TITLE, PUB_YEAR, GENRE)).toBeFalsy();
    });
    test("delete book invalid id", async () => {
        let author_id = await (await initializeAuthor()).data.id;
        let actual_id = await (await initializeBook(author_id)).data.id;
        let id = 100;
        expect(await isBookInTable(actual_id, author_id, BOOK_TITLE, PUB_YEAR, GENRE)).toBeTruthy();
        try {
            await axios.delete(`${baseUrl}/deleteBook?id=${id}`);
            fail('this call should return a 400');
        }
        catch (error) {
            let errorObj = error;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({ error: "book id doesn't exist in database" });
            expect(await isBookInTable(actual_id, author_id, BOOK_TITLE, PUB_YEAR, GENRE)).toBeTruthy();
        }
    });
});
//DELETE AUTHORS
describe("Delete author tests", () => {
    test("delete author happy path", async () => {
        let author_id = await (await initializeAuthor()).data.id;
        expect(await isAuthorInTable(author_id, AUTHOR_NAME, AUTHOR_BIO)).toBeTruthy();
        await axios.delete(`${baseUrl}/deleteAuthor?id=${author_id}`);
        expect(await isAuthorInTable(author_id, AUTHOR_NAME, AUTHOR_BIO)).toBeFalsy();
    });
    test("delete author with books associated", async () => {
        let author_id = await (await initializeAuthor()).data.id;
        let id = await (await initializeBook(author_id)).data.id;
        expect(await isAuthorInTable(author_id, AUTHOR_NAME, AUTHOR_BIO)).toBeTruthy();
        expect(await isBookInTable(id, author_id, BOOK_TITLE, PUB_YEAR, GENRE)).toBeTruthy();
        await axios.delete(`${baseUrl}/deleteAuthor?id=${author_id}`);
        expect(await isAuthorInTable(author_id, AUTHOR_NAME, AUTHOR_BIO)).toBeFalsy();
        expect(await isBookInTable(id, author_id, BOOK_TITLE, PUB_YEAR, GENRE)).toBeFalsy();
    });
    test("delete author invalid author_id", async () => {
        let actual_id = await (await initializeAuthor()).data.id;
        let author_id = 100;
        expect(await isAuthorInTable(actual_id, AUTHOR_NAME, AUTHOR_BIO)).toBeTruthy();
        try {
            await axios.delete(`${baseUrl}/deleteAuthor?id=${author_id}`);
            fail('this call should return a 400');
        }
        catch (error) {
            let errorObj = error;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({ error: "author id doesn't exist in database" });
            expect(await isAuthorInTable(actual_id, AUTHOR_NAME, AUTHOR_BIO)).toBeTruthy();
        }
    });
});
//GET BOOKS
describe("Get books tests", () => {
    test("get book by id happy path", async () => {
        let author_id = await (await initializeAuthor()).data.id;
        let id = await (await initializeBook(author_id)).data.id;
        let expectedBook = {
            id: 1,
            author_id: String(author_id),
            title: 'Harry Potter',
            pub_year: '2001',
            genre: 'Fiction'
        };
        let result = await axios.get(`${baseUrl}/getBook?id=${id}`);
        expect(result.data).toEqual(expectedBook);
    });
    test("get book invalid id", async () => {
        let author_id = await (await initializeAuthor()).data.id;
        await initializeBook(author_id);
        let id = 100;
        try {
            await axios.get(`${baseUrl}/getBook?id=${id}`);
            fail('this call should return a 400');
        }
        catch (error) {
            let errorObj = error;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({ error: "book id doesn't exist in database" });
        }
    });
    test("get book by genre happy path", async () => {
        let author_id = await (await initializeAuthor()).data.id;
        await initializeBook(author_id);
        let genre = 'Fiction';
        let expectedBook = {
            id: 1,
            author_id: String(author_id),
            title: 'Harry Potter',
            pub_year: '2001',
            genre: genre
        };
        let result = await axios.get(`${baseUrl}/getBookByGenre?genre=${genre}`);
        expect(result.data).toEqual(expectedBook);
    });
    test("get book by genre invalid genre", async () => {
        let author_id = await (await initializeAuthor()).data.id;
        await initializeBook(author_id);
        let genre = "Fantasy";
        try {
            await axios.get(`${baseUrl}/getBookByGenre?genre=${genre}`);
            fail('this call should return a 400');
        }
        catch (error) {
            let errorObj = error;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({ error: "genre doesn't exist in database" });
        }
    });
    test("get all books", async () => {
        let author_id = await (await initializeAuthor()).data.id;
        await initializeBook(author_id);
        await initializeBook(author_id);
        let expectedBooks = [
            {
                id: 1,
                author_id: String(author_id),
                title: 'Harry Potter',
                pub_year: '2001',
                genre: 'Fiction'
            },
            {
                id: 2,
                author_id: String(author_id),
                title: 'Harry Potter',
                pub_year: '2001',
                genre: 'Fiction'
            },
        ];
        let result = await axios.get(`${baseUrl}/getAllBooks`);
        expect(result.data).toEqual(expectedBooks);
    });
});
//GET AUTHORS
describe("Get authors tests", () => {
    test("get author by id happy path", async () => {
        let author_id = await (await initializeAuthor()).data.id;
        let expectedAuthor = {
            id: author_id,
            name: AUTHOR_NAME,
            bio: AUTHOR_BIO
        };
        let result = await axios.get(`${baseUrl}/getAuthor?id=${author_id}`);
        expect(result.data).toEqual(expectedAuthor);
    });
    test("get author invalid id", async () => {
        await initializeAuthor();
        let id = 100;
        try {
            await axios.get(`${baseUrl}/getAuthor?id=${id}`);
            fail('this call should return a 400');
        }
        catch (error) {
            let errorObj = error;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({ error: "author id doesn't exist in database" });
        }
    });
    test("get all authors", async () => {
        await initializeAuthor();
        await initializeAuthor();
        let expectedAuthors = [
            {
                id: 1,
                name: AUTHOR_NAME,
                bio: AUTHOR_BIO
            },
            {
                id: 2,
                name: AUTHOR_NAME,
                bio: AUTHOR_BIO
            },
        ];
        let result = await axios.get(`${baseUrl}/getAllAuthors`);
        expect(result.data).toEqual(expectedAuthors);
    });
});
//-----------------HELPERS-----------------------
async function initializeAuthor() {
    let name = AUTHOR_NAME;
    let bio = AUTHOR_BIO;
    return axios.post(`${baseUrl}/addAuthor`, { name, bio });
}
async function initializeBook(author_id) {
    let title = BOOK_TITLE;
    let pub_year = PUB_YEAR;
    let genre = GENRE;
    return axios.post(`${baseUrl}/addBook`, { author_id, title, pub_year, genre });
}
async function isAuthorInTable(id, name, bio) {
    let result = await db.all(`SELECT * FROM authors WHERE 
        id=${id} 
        AND name='${name}' 
        AND bio='${bio}'
    `);
    return result.length > 0;
}
async function isBookInTable(id, author_id, title, pub_year, genre) {
    let result = await db.all(`SELECT * FROM books WHERE 
        id=${id} 
        AND author_id=${author_id}
        AND title='${title}'
        AND pub_year=${pub_year}
        AND genre='${genre}'
    `);
    return result.length > 0;
}
async function showAuthors() {
    return await db.all("SELECT * FROM authors");
}
