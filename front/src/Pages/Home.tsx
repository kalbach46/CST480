import React, {useEffect, useState} from 'react';
import {Table} from 'react-bootstrap';
import axios, {AxiosResponse} from "axios";

let port = 3001;
let host = "localhost";
let protocol = "http";
let api = "api";
let baseUrl = `${protocol}://${host}:${port}/${api}`;

interface Book {
    id: number,
    author_id: number,
    title: string,
    pub_year: number,
    genre: string;
}

export default function Home() {
    const [books, setBooks] = useState<Array<Book>>([]);

    useEffect(() => {
        const getData = async () => {
            let result:AxiosResponse = await axios.get(`${baseUrl}/getBooks`);
            let body:Array<Book> = result.data;
            setBooks(body);
        }
        getData();
    }, [])
    return (
        <Table striped bordered>
            <thead>
                <tr>
                    <th>Book ID</th>
                    <th>Author ID</th>
                    <th>Title</th>
                    <th>Published Year</th>
                    <th>Genre</th>
                </tr>
            </thead>
            <tbody>
            {
                books.map(book => {
                    return (
                        <tr key={book.id}>
                            <td>{book.id}</td>
                            <td>{book.author_id}</td>
                            <td>{book.title}</td>
                            <td>{book.pub_year}</td>
                            <td>{book.genre}</td>
                        </tr>
                    )
                })
            }
            </tbody>
        </Table>
    )
}