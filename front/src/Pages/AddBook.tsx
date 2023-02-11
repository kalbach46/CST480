import {useEffect, useState} from 'react';
import {TextField, FormHelperText, InputLabel, Select, MenuItem, Button} from '@mui/material';
import {Controller, useForm, SubmitHandler} from 'react-hook-form';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import Author from '../Models/Author';
import Cookies from 'js-cookie';


type FormValues = {
    author_id: number,
    title: string,
    pub_year: number,
    genre: string;
}

export default function AddBook() {
    const { control, handleSubmit, reset} = useForm<FormValues>();
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
            .then(() => {
                setError('');
            })
            .catch((error)=> {
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
            {Cookies.get('loggedIn')==='true'? 
                <div>
                    <h2>Add A Book</h2>
                    {authorIDs.length===0 ? `Can't add any books if there are no authors! add an author first` : 
                        <div>
                            <Controller
                                name="author_id"
                                control={control}
                                defaultValue={authorIDs[0]}
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
                                            {authorIDs.map(id => {
                                                return (
                                                    <MenuItem key={id} value={id}>{id}</MenuItem>
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
                                    required:'This field is required.',
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
                                    required:'This field is required.',
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
                                    required:'This field is required.',
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
                                <Button variant='outlined' onClick={handleSubmit(onSubmit)}>Add Book</Button>
                            </div>
                            <div>
                                {error}
                            </div>
                        </div>
                    }
                </div>
            : <a href='/'>Login</a>}
        </div>
    )
}