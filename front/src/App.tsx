import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import AddAuthor from './Pages/AddAuthor';
import AddBook from './Pages/AddBook';
import SearchBooks from './Pages/SearchBooks';
import { Navbar, Nav } from 'react-bootstrap';
import './App.css';

function App() {
  return (
    <div>
      <Navbar>
        <Nav>
        <Nav.Link href="/*">Home</Nav.Link>
        <Nav.Link href="/addBook">Add Book</Nav.Link>
        <Nav.Link href="/addAuthor">Add Author</Nav.Link>
        <Nav.Link href="/searchBooks">Search Books</Nav.Link>
        </Nav>
      </Navbar>
      <Router>
        <div>
          <Routes>
            <Route path="/*" element={<Home />} />       
            <Route path="/addBook" element={<AddBook />} />
            <Route path="/addAuthor" element={<AddAuthor />} />
            <Route path="/searchBooks" element={<SearchBooks />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
