import {useState} from 'react';
import {TextField, InputLabel, Button} from '@mui/material';
import {Controller, useForm, SubmitHandler} from 'react-hook-form';
import Cookies from 'js-cookie';
import axios from 'axios';

type FormValues = {
    name: string;
    bio: string;
}

export default function AddAuthor() {
    const {control, handleSubmit, reset} = useForm<FormValues>();
    const [error, setError] = useState<string>('');

    const onSubmit: SubmitHandler<FormValues> = data => {
        let name:string = data.name;
        let bio:string = data.bio;
        reset();
        const getData = async () => {
            axios.post('/api/addAuthor', {name, bio})
            .then(() => {
                setError('');
            })
            .catch((error) => {
                setError(error.response.data.error);
            })

        }
        getData();
    };

    return (
        <div>
            {Cookies.get('loggedIn')==='true'? 
                <div>
                    <h2>Add An Author</h2>
                    <Controller
                                name="name"
                                control={control}
                                defaultValue={''}
                                rules={{
                                    required:'This is required.', 
                                    maxLength: {
                                        value: 30,
                                        message: 'Author name cannot be more than 30 chars.'
                                    }
                                }}
                                render={({
                                    field: {onChange, value}, fieldState: { error }}) => (
                                        <>
                                            <InputLabel>Author Name</InputLabel>
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
                                name="bio"
                                control={control}
                                defaultValue={''}
                                rules={{
                                    required:'This is required.', 
                                    maxLength: {
                                        value: 150,
                                        message: 'Bio cannot be more than 150 chars.'
                                    }
                                }}
                                render={({
                                    field: {onChange, value}, fieldState: { error }}) => (
                                        <>
                                            <InputLabel>Author Bio</InputLabel>
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
                                <Button variant='outlined' onClick={handleSubmit(onSubmit)}>Add Author</Button>
                            </div>
                    <div>
                        {error}
                    </div>
                </div>
            : <a href='/'>Login</a>}
        </div>
    )
}