import {useEffect, useState} from 'react';
import {Table, Container, Row, Col} from 'react-bootstrap';
import axios from '../axios';
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
        <Container>
            <Row>
                <Col>
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
                        {!books ? <tr></tr> :
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
                </Col>
            </Row>
            <Row>
                <Col>
                        {booksError}
                </Col>
            </Row>
            <Row>
                <Col>
                <Table striped bordered>
                        <thead>
                            <tr>
                                <th>Author ID</th>
                                <th>Name</th>
                                <th>Bio</th>
                            </tr>
                        </thead>
                        <tbody>
                        {!authors ? <tr></tr> : 
                            authors.map(author => {
                                return (
                                    <tr key={author.id}>
                                        <td>{author.id}</td>
                                        <td>{author.name}</td>
                                        <td>{author.bio}</td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row>
                <Col>
                        {authorsError}
                </Col>
            </Row>
        </Container>
    )
}