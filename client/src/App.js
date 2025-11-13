import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MovieList from './components/MovieList';
import AddMovie from './components/AddMovie';
import EditMovie from './components/EditMovie';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MovieList />} />
          <Route path="/add" element={<AddMovie />} />
          <Route path="/edit/:id" element={<EditMovie />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
