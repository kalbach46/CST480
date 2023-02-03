import {useState} from 'react';
import {TextField, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, InputLabel, Button} from '@mui/material';
import {Controller, useForm, SubmitHandler} from 'react-hook-form';
import axios from 'axios';
import Book from '../Models/Book';

type FormValues = {
    genre: string;
}

export default function SearchBooks() {
    const {control, handleSubmit, formState: {errors}} = useForm<FormValues>();
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
            <h2>Search Books By Genre</h2>
            <Controller
                name="genre"
                control={control}
                defaultValue={''}
                rules={{
                    required:'This is required.',
                    maxLength: {
                        value: 20,
                        message: 'Genre cannot be more than 20 chars.'
                    }
                }}
                render={({
                    field: {onChange, value}, fieldState: { error }}) => (
                        <>
                            <InputLabel>Book ID</InputLabel>
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
                <Button variant='outlined' onClick={handleSubmit(onSubmit)}>Search</Button>
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
                            books?.map(book => {
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
            </TableContainer>
            <div>
                {error}
            </div>
        </div>
    )
}