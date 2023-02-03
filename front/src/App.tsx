import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import AddAuthor from './Pages/AddAuthor';
import AddBook from './Pages/AddBook';
import SearchBooks from './Pages/SearchBooks';
import DeleteBook from './Pages/DeleteBook';
import EditBook from './Pages/EditBook';
import {AppBar, Button, Toolbar} from '@mui/material';
import './App.css';

function App() {
  return (
    <div>
      <AppBar position="sticky" style={{ background: '#f0f0f0'}}>
        <Toolbar>
          <Button href="/">Home</Button>
          <Button href="/addBook">Add Book</Button>
          <Button href="/addAuthor">Add Author</Button>
          <Button href="/searchBooks">Search Books</Button>
          <Button href="/deleteBook">Delete Books</Button>
          <Button href="/editBook">Edit Books</Button>
        </Toolbar>
      </AppBar>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Home />} />       
            <Route path="/addBook" element={<AddBook />} />
            <Route path="/addAuthor" element={<AddAuthor />} />
            <Route path="/searchBooks" element={<SearchBooks />} />
            <Route path="/deleteBook" element={<DeleteBook />} />
            <Route path="/editBook" element={<EditBook />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
