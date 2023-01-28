import axios from "axios";

let port = 3000;
let host = 'localhost';
let protocol = 'http';

const instance = axios.create({
    baseURL: `${protocol}://${host}:${port}`
})

export default instance;