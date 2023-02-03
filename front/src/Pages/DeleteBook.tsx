import {useEffect, useState} from 'react';
import {useForm, SubmitHandler, Controller} from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import {Grid, FormHelperText, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, InputLabel, Select, MenuItem, Button} from '@mui/material';
import axios from 'axios';
import Book from '../Models/Book';

type FormValues = {
    book_id:number
};

export default function DeleteBook() {
    const { handleSubmit, control, formState: {errors}, reset} = useForm<FormValues>();
    const [books, setBooks] = useState<Array<Book>>([]);
    const [booksError, setBooksError] = useState<string>('');

    const onSubmit: SubmitHandler<FormValues> = data => {
        console.log(data);
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
            <h2>Delete Books</h2>
            {books.length===0 ? `Can't delete any books if there are no books! add a book first` : 
                <div>
                    <Controller
                        name="book_id"
                        control={control}
                        defaultValue={books[0].id}
                        rules={{required:'This field is required.'}}
                        render={({
                            field: {onChange, value}, fieldState: { error }}) => (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <InputLabel>Book ID</InputLabel>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Select
                                            label="Book"
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
                                    </Grid>
                                </Grid>
                        )}
                    />
                    <Button variant='outlined' onClick={handleSubmit(onSubmit)}>Delete Book</Button>
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