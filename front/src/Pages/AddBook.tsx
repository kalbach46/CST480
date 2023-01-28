import {useEffect, useState} from 'react';
import {Form, Container, Row, Col, Button} from 'react-bootstrap';
import {useForm, SubmitHandler} from 'react-hook-form';
import {ErrorMessage} from '@hookform/error-message';
import axios from '../axios';
import 'react-datepicker/dist/react-datepicker.css';
import Author from '../Models/Author';

type FormValues = {
    author_id: number,
    title: string,
    pub_year: number,
    genre: string;
}

export default function AddBook() {
    const { register, handleSubmit, formState: {errors}, reset} = useForm<FormValues>();
    const [bookID, setBookID] = useState<number>();
    const [authorIDs, setAuthorIDs] = useState<Array<number>>([]);
    const [error, setError] = useState<string>('');

    const onSubmit: SubmitHandler<FormValues> = data => {
        let author_id:number = data.author_id;
        let title:string = data.title;
        let pub_year:number = data.pub_year;
        let genre:string = data.genre;
        reset();
        const getData = async () => {
            axios.post('/api/addBook', {author_id, title, pub_year, genre})
            .then((result) => {
                let body:number = result.data.id;
                setBookID(body);
                setError('');
            })
            .catch((error)=> {
                setBookID(0);
                setError(error.response.data.error);
            });
        }
        getData();
    };

    useEffect(() => {
        const getData = async () => {
            axios.get('/api/getAuthors')
            .then((result) => {
                let body:Array<Author> = result.data;
                let ids:Array<number> = [];
                body.map(author => {
                    ids.push(author.id);
                })
                setAuthorIDs(ids);
                setError('');
            })
            .catch((error) => {
                setAuthorIDs([]);
                setError(error.response.data.error);
            });
        }
        getData();
    }, [])

    return (
        <div>
            {authorIDs.length===0 ? `Can't add any books if there are no authors! add an author first` : 
                <div>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Container>
                            <Row className='mt-3'>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>Author ID</Form.Label>
                                        <Form.Select {...register('author_id')}
                                            placeholder='Select Author ID'>
                                            {
                                                authorIDs.map(id => {
                                                    return (
                                                        <option key={id} value={id}>{id}</option>
                                                    )
                                                })
                                            }
                                        </Form.Select>
                                        <ErrorMessage errors={errors} name='author_id'/>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className='mt-3'>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>Book Title</Form.Label>
                                        <Form.Control {...register('title', 
                                        {
                                            required:'This is required.', 
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
                                            required:'This is required.',
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
                            <Row className='mt-3'>
                                <Col>
                                    <Button type='submit'> 
                                        Add New Book
                                    </Button>
                                </Col>
                            </Row>
                            <Row>
                                <p>{!bookID ? '' : `Successfully added book with id ${bookID}`}</p>
                            </Row>
                        </Container>                              
                    </Form>
                    <div>
                        {error}
                    </div>
                </div>
            }
        </div>
    )
}