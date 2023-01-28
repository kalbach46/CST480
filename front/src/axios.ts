import axios from "axios";

let port = 3001;
let host = 'localhost';
let protocol = 'http';

const instance = axios.create({
    baseURL: `${protocol}://${host}:${port}`
})

export default instance;