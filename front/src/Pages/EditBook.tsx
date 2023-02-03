import {useEffect, useState} from 'react';
import {useForm, SubmitHandler, Controller} from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import {TextField, FormHelperText, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, InputLabel, Select, MenuItem, Button} from '@mui/material';
import axios from 'axios';
import Book from '../Models/Book';
import Author from '../Models/Author';

type FormValues = {
    book_id:number,
    author_id:number,
    title:string,
    pub_year:number,
    genre:string
};

export default function EditBook() {
    const { control, handleSubmit, formState: {errors}, reset} = useForm<FormValues>();
    const [books, setBooks] = useState<Array<Book>>([]);
    const [authors, setAuthors] = useState<Array<Author>>([]);
    const [booksError, setBooksError] = useState<string>('');
    const [authorsError, setauthorsError] = useState<string>('');

    const onSubmit: SubmitHandler<FormValues> = data => {
        let book_id:number = data.book_id;
        let author_id:number = data.author_id;
        let title:string = data.title;
        let pub_year:number = data.pub_year;
        let genre:string = data.genre;
        reset();
        const getData = async () => {
            console.log(data);
            axios.put(`/api/editBook?id=${book_id}`, {author_id:author_id, title:title, pub_year:pub_year, genre:genre});
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
        const getAuthors = async () => {
            axios.get('/api/getAuthors')
            .then((result) => {
                setAuthors(result.data);
                setauthorsError('');
            })
            .catch((error) => {
                setAuthors([]);
                setauthorsError(error.response.data.error);
            });
        }
        getBooks();
        getAuthors();
    }, [onSubmit]);

    const sortBooks = (books:Array<Book>) => {
        books.sort((a, b) => (a.title > b.title) ? 1 : -1);
    }

    return (
        <div>
            <h2>Edit Book Properties</h2>
            {books.length===0 ? `Can't edit any books if there are no books! add a book first` : 
                <div>
                    <Controller
                        name="book_id"
                        control={control}
                        defaultValue={books[0].id}
                        rules={{required:'This field is required.'}}
                        render={({
                            field: {onChange, value}, fieldState: { error }}) => (
                                <>
                                    <InputLabel>Book ID</InputLabel>
                                    <Select
                                        value={value}
                                        onChange={onChange}
                                        error={!!error}
                                    >
                                    <FormHelperText>{error ? error.message : null}</FormHelperText>
                                    {books.map(book => {
                                        return (
                                            <MenuItem key={book.id} value={book.id}>{book.id}</MenuItem>
                                        )
                                    })}
                                    </Select>
                                </>
                        )}
                    />
                    <Controller
                        name="author_id"
                        control={control}
                        defaultValue={authors[0].id}
                        rules={{required:'This field is required.'}}
                        render={({
                            field: {onChange, value}, fieldState: { error }}) => (
                                <>
                                    <InputLabel>Author ID</InputLabel>
                                    <Select
                                        value={value}
                                        onChange={onChange}
                                        error={!!error}
                                    >
                                    <FormHelperText>{error ? error.message : null}</FormHelperText>
                                    {authors.map(author => {
                                        return (
                                            <MenuItem key={author.id} value={author.id}>{author.id}</MenuItem>
                                        )
                                    })}
                                    </Select>
                                </>
                        )}
                    />
                    <Controller
                        name="title"
                        control={control}
                        defaultValue={''}
                        rules={{
                            maxLength: {
                                value: 40,
                                message: 'Book title cannot be more than 40 chars.'
                            }
                        }}
                        render={({
                            field: {onChange, value}, fieldState: { error }}) => (
                                <>
                                    <InputLabel>Book Title</InputLabel>
                                    <TextField
                                        value={value}
                                        onChange={onChange}
                                        error={!!error}
                                        helperText={error ? error.message : null}
                                    />
                                </>
                        )}
                    />
                    <Controller
                        name="pub_year"
                        control={control}
                        defaultValue={1000}
                        rules={{
                            max: {
                                value: 2023,
                                message: 'Year must be between 1000-2023.'
                            },
                            min: {
                                value: 1000,
                                message: 'Year must be between 1000-2023.'
                            } 
                        }}
                        render={({
                            field: {onChange, value}, fieldState: { error }}) => (
                                <>
                                    <InputLabel>Published Year</InputLabel>
                                    <TextField
                                        type="number"
                                        value={value}
                                        onChange={onChange}
                                        error={!!error}
                                        helperText={error ? error.message : null}
                                    />
                                </>
                        )}
                    />
                    <Controller
                        name="genre"
                        control={control}
                        defaultValue={''}
                        rules={{
                            maxLength: {
                                value: 20,
                                message: 'Genre cannot be more than 20 chars.'
                            }
                        }}
                        render={({
                            field: {onChange, value}, fieldState: { error }}) => (
                                <>
                                    <InputLabel>Genre</InputLabel>
                                    <TextField
                                        value={value}
                                        onChange={onChange}
                                        error={!!error}
                                        helperText={error ? error.message : null}
                                    />
                                </>
                        )}
                    />
                    <div>
                        <Button variant='outlined' onClick={handleSubmit(onSubmit)}>Edit Book</Button>
                    </div>
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