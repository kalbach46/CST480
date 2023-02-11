import {useState} from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';
import {TextField, InputLabel, Button} from '@mui/material';
import {Controller, useForm, SubmitHandler} from 'react-hook-form';
import axios from 'axios';

type FormValues = {
    username: string;
    password: string;
}

export default function Login() {
    const {control, handleSubmit, formState: {errors}, reset} = useForm<FormValues>();
    const [error, setError] = useState<string>('');
    let navigate:NavigateFunction = useNavigate();

    const onSubmit: SubmitHandler<FormValues> = data => {
        let username:string = data.username;
        let password:string = data.password;
        axios.put('/auth/login', {username, password})
        .then(() => {
            setError('');
            navigate('/home');
        })
        .catch((error) => {
            setError(error.response.data.error);
        })
    };

    return (
        <div>
            <h2>Login</h2>
            <Controller
                        name="username"
                        control={control}
                        defaultValue={''}
                        rules={{
                            required:'This is required.', 
                            maxLength: {
                                value: 20,
                                message: 'Username cannot be more than 20 chars.'
                            }
                        }}
                        render={({
                            field: {onChange, value}, fieldState: { error }}) => (
                                <>
                                    <InputLabel>Username</InputLabel>
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
                        name="password"
                        control={control}
                        defaultValue={''}
                        rules={{
                            required:'This is required.'
                        }}
                        render={({
                            field: {onChange, value}, fieldState: { error }}) => (
                                <>
                                    <InputLabel>Password</InputLabel>
                                    <TextField
                                        type="password"
                                        value={value}
                                        onChange={onChange}
                                        error={!!error}
                                        helperText={error ? error.message : null}
                                    />
                                </>
                        )}
                    />
                    <div>
                        <Button variant='outlined' onClick={handleSubmit(onSubmit)}>Login</Button>
                    </div>
            <div>
                {error}
            </div>
        </div>
    )
}