import {useEffect, useState} from 'react';
import {TableContainer, Table, TableHead, TableRow, TableCell, TableBody} from '@mui/material';
import axios from 'axios';
import Book from '../Models/Book';
import Author from '../Models/Author';

export default function Home() {
    const [books, setBooks] = useState<Array<Book>>();
    const [authors, setAuthors] = useState<Array<Author>>();
    const [booksError, setBooksError] = useState<string>('');
    const [authorsError, setAuthorsError] = useState<string>('');

    useEffect(() => {
        const getBooks = async () => {
            axios.get('/api/getBooks')
            .then((result) => {
                sortBooks(result.data);
                setBooks(result.data);
                setBooksError('');
            })
            .catch((error) => {
                setBooks([]);
                setBooksError(error.response.data.error);
            });
        }

        const getAuthors = async () => {
            axios.get('/api/getAuthors')
            .then((result) => {
                setAuthors(result.data);
                setAuthorsError('');
            })
            .catch((error) => {
                setAuthors([]);
                setAuthorsError(error.response.data.error);
            });
        }

        getBooks();
        getAuthors();
    }, []);

    const sortBooks = (books:Array<Book>) => {
        books.sort((a, b) => (a.title > b.title) ? 1 : -1);
    }

    return (
        <TableContainer>
            <h2>THE BOOK BARN</h2>
            <Table>
                <TableHead>
                    <TableRow style={{background:"#c0c0c0"}}>
                        <TableCell>Book ID</TableCell>
                        <TableCell>Author ID</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Published Year</TableCell>
                        <TableCell>Genre</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {!books ? <TableRow></TableRow> :
                    books.map(book => {
                        return (
                            <TableRow key={book.id}>
                                <TableCell>{book.id}</TableCell>
                                <TableCell>{book.author_id}</TableCell>
                                <TableCell>{book.title}</TableCell>
                                <TableCell>{book.pub_year}</TableCell>
                                <TableCell>{book.genre}</TableCell>
                            </TableRow>
                        )
                    })
                }
                </TableBody>
            </Table>
            <div>
                {booksError}
            </div>
            <Table>
                <TableHead>
                    <TableRow style={{background:"#c0c0c0"}}>
                        <TableCell>Author ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Bio</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {!authors ? <TableRow></TableRow> : 
                    authors.map(author => {
                        return (
                            <TableRow key={author.id}>
                                <TableCell>{author.id}</TableCell>
                                <TableCell>{author.name}</TableCell>
                                <TableCell>{author.bio}</TableCell>
                            </TableRow>
                        )
                    })
                }
                </TableBody>
            </Table>
            <div>
                {authorsError}
            </div>     
        </TableContainer>
    )
}