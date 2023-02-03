import {useEffect, useState} from 'react';
import {Form, Container, Row, Col, Button} from 'react-bootstrap';
import {useForm, SubmitHandler} from 'react-hook-form';
import {ErrorMessage} from '@hookform/error-message';
import 'react-datepicker/dist/react-datepicker.css';
import {TableContainer, Table, TableHead, TableRow, TableCell, TableBody} from '@mui/material';
import axios from 'axios';
import Book from '../Models/Book';

type FormValues = {
    book_id:number,
    title:string,
    pub_year:number,
    genre:string
};

export default function EditBook() {
    const { register, handleSubmit, formState: {errors}, reset} = useForm<FormValues>();
    const [books, setBooks] = useState<Array<Book>>([]);
    const [booksError, setBooksError] = useState<string>('');

    const onSubmit: SubmitHandler<FormValues> = data => {
        let body = {};
        let book_id:number = data.book_id;
        let title:string = data.title;
        let pub_year:number = data.pub_year;
        let genre:string = data.genre;
        reset();
        const getData = async () => {
            axios.put(`/api/editBook?id=${book_id}`, {title:title, pub_year:pub_year, genre:genre});
        }
        getData();
    };

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
        getBooks();
    }, [onSubmit]);

    const sortBooks = (books:Array<Book>) => {
        books.sort((a, b) => (a.title > b.title) ? 1 : -1);
    }

    return (
        <div>
            {books.length===0 ? `Can't edit any books if there are no books! add a book first` : 
                <div>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Container>
                            <Row className='mt-3'>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>Book ID</Form.Label>
                                        <Form.Select {...register('book_id')}
                                            placeholder='Select Book ID'>
                                            {
                                                books.map(book => {
                                                    return (
                                                        <option key={book.id} value={book.id}>{book.id}</option>
                                                    )
                                                })
                                            }
                                        </Form.Select>
                                        <ErrorMessage errors={errors} name='book_id'/>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className='mt-3'>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>Book Title</Form.Label>
                                        <Form.Control {...register('title', 
                                        {
                                            maxLength: {
                                                value: 40,
                                                message: 'Book title cannot be more than 40 chars.'
                                            }
                                        })} 
                                        placeholder='Enter Book Title'></Form.Control>
                                        <ErrorMessage errors={errors} name='title'/>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className='mt-3'>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>Published Year</Form.Label>
                                        <Form.Control type='number' {...register('pub_year',
                                        {
                                            valueAsNumber: true,
                                            max: {
                                                value: 2023,
                                                message: 'Year must be between 1000-2023.'
                                            },
                                            min: {
                                                value: 1000,
                                                message: 'Year must be between 1000-2023.'
                                            } 
                                        })}
                                        placeholder='Enter Year'></Form.Control>
                                        <ErrorMessage errors={errors} name='pub_year'/>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className='mt-3'>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>Genre</Form.Label>
                                        <Form.Control {...register('genre', 
                                        {
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
                            <Row className='mt-3'>
                                <Col>
                                    <Button type='submit'> 
                                        Edit Book
                                    </Button>
                                </Col>
                            </Row>
                        </Container>                              
                    </Form>
                    <TableContainer>
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
                    </TableContainer>
                </div>
            }
        </div>
    )
}