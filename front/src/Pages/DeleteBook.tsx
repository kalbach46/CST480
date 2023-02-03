import {useEffect, useState} from 'react';
import {Form, Container, Row, Col, Button} from 'react-bootstrap';
import {useForm, SubmitHandler} from 'react-hook-form';
import {ErrorMessage} from '@hookform/error-message';
import 'react-datepicker/dist/react-datepicker.css';
import {TableContainer, Table, TableHead, TableRow, TableCell, TableBody} from '@mui/material';
import axios from 'axios';
import Book from '../Models/Book';

type FormValues = {
    book_id:number
};

export default function DeleteBook() {
    const { register, handleSubmit, formState: {errors}, reset} = useForm<FormValues>();
    const [books, setBooks] = useState<Array<Book>>([]);
    const [booksError, setBooksError] = useState<string>('');

    const onSubmit: SubmitHandler<FormValues> = data => {
        let book_id:number = data.book_id;
        reset();
        const getData = async () => {
            axios.delete(`/api/deleteResource?id=${book_id}&type=book`);
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
            {books.length===0 ? `Can't delete any books if there are no books! add a book first` : 
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
                                <Col>
                                    <Button type='submit'> 
                                        Delete Book
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