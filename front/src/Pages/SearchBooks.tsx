import {useState} from 'react';
import { Form, Container, Row, Col, Button, Table } from 'react-bootstrap';
import {ErrorMessage} from '@hookform/error-message';
import {useForm, SubmitHandler} from 'react-hook-form';
import axios from 'axios';
import Book from '../Models/Book';

type FormValues = {
    genre: string;
}

export default function SearchBooks() {
    const {register, handleSubmit, formState: {errors}} = useForm<FormValues>();
    const [books, setBooks] = useState<Array<Book>>();
    const [error, setError] = useState<string>('');

    const onSubmit: SubmitHandler<FormValues> = data => {
        const getData = async () => {
            axios.get(`/api/getBooks?genre=${data.genre}`)
            .then((result) => {
                let body:Array<Book> = result.data;
                setBooks(body);
                setError('');
            })
            .catch((error) => {
                setBooks([]);
                setError(error.response.data.error);
            });
        }
        getData();
    }

    return (
        <div>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Container>
                    <Row className='mt-3'>
                        <Col>
                            <Form.Group>
                                <Form.Label>Search Books By Genre</Form.Label>
                                <Form.Control {...register('genre',
                                {
                                    required:'This is required.',
                                    maxLength: {
                                        value: 20,
                                        message: 'Genre cannot be more than 20 chars.'
                                    }
                                })}
                                placeholder='Enter Genre'></Form.Control>
                                <ErrorMessage errors={errors} name='genre'/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button type='submit'>
                                Search
                            </Button>
                        </Col>
                    </Row>
                    <Row className='mt-3'>
                        <Col xs={6}>
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
                                        books?.map(book => {
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
                </Container>
            </Form>
            <div>
                {error}
            </div>
        </div>
    )
}