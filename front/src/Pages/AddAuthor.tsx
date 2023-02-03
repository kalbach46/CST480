import {useState} from 'react';
import {TextField, InputLabel, Button} from '@mui/material';
import {Controller, useForm, SubmitHandler} from 'react-hook-form';
import axios from 'axios';

type FormValues = {
    name: string;
    bio: string;
}

export default function AddAuthor() {
    const {control, handleSubmit, formState: {errors}, reset} = useForm<FormValues>();
    const [authorID, setAuthorID] = useState<number>();
    const [error, setError] = useState<string>('');

    const onSubmit: SubmitHandler<FormValues> = data => {
        let name:string = data.name;
        let bio:string = data.bio;
        reset();
        const getData = async () => {
            axios.post('/api/addAuthor', {name, bio})
            .then((result) => {
                let body:number = result.data.id;
                setAuthorID(body);
                setError('');
            })
            .catch((error) => {
                setAuthorID(0);
                setError(error.response.data.error);
            })

        }
        getData();
    };

    return (
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
            {/* <Form onSubmit={handleSubmit(onSubmit)}>
                <Container>
                    <Row className='mt-3'>
                        <Col xs={6}>
                            <Form.Group>
                                <Form.Label>Author Name</Form.Label>
                                <Form.Control {...register('name', 
                                {
                                    required:'This is required.', 
                                    maxLength: {
                                        value: 30,
                                        message: 'Author name cannot be more than 30 chars.'
                                    }
                                })} 
                                placeholder='Enter Author Name'></Form.Control>
                                <ErrorMessage errors={errors} name='name'/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className='mt-3'>
                        <Col xs={6}>
                            <Form.Group>
                                <Form.Label>Bio</Form.Label>
                                <Form.Control {...register('bio', 
                                {
                                    required:'This is required.', 
                                    maxLength: {
                                        value: 150,
                                        message: 'Bio cannot be more than 150 chars.'
                                    }
                                })} 
                                placeholder='Enter Author Bio'></Form.Control>
                                <ErrorMessage errors={errors} name='bio'/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className='mt-3'>
                        <Col>
                            <Button type='submit'> 
                                Add New Author
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <p>{!authorID ? '' : `Successfully added author with id ${authorID}`}</p>
                    </Row>
                </Container>                              
            </Form> */}
            <div>
                {error}
            </div>
        </div>
    )
}