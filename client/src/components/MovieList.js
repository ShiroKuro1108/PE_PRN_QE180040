import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './MovieList.css';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Debounce search input with shorter delay for smoother experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchGenres = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/movies/genres`);
      if (response.ok) {
        const data = await response.json();
        setGenres(data);
      }
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  }, [API_URL]);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      if (selectedGenre) {
        params.append('genre', selectedGenre);
      }

      if (sortBy) {
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);
      }

      const url = `${API_URL}/api/movies?${params.toString()}`;
      console.log('Fetching movies from:', url);
      
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', response.status, errorText);
        throw new Error(`Failed to fetch movies: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched movies:', data);
      setMovies(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError(err.message);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedGenre, sortBy, sortOrder, API_URL]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const openDeleteModal = (movie) => {
    setMovieToDelete(movie);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setMovieToDelete(null);
  };

  const confirmDelete = async () => {
    if (!movieToDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/movies/${movieToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete movie');
      }

      closeDeleteModal();
      fetchMovies();
    } catch (err) {
      alert('Error deleting movie: ' + err.message);
      closeDeleteModal();
    }
  };

  const renderStars = (rating) => {
    if (!rating) return <span className="no-rating">Not rated</span>;
    return (
      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? 'star filled' : 'star'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading movies...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="movie-list-container">
      <div className="header">
        <h1>My Movie Watchlist</h1>
        <Link to="/add" className="btn btn-primary btn-add">+ Add Movie</Link>
      </div>

      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search movies by title..."
            value={search}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="filter-box">
          <label>Genre:</label>
          <select value={selectedGenre} onChange={handleGenreChange} className="genre-select">
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        <div className="sort-box">
          <label>Sort by:</label>
          <select value={sortBy} onChange={handleSortChange} className="sort-select">
            <option value="">Default</option>
            <option value="title">Title</option>
            <option value="rating">Rating</option>
          </select>
          {sortBy && (
            <button onClick={toggleSortOrder} className="btn btn-small btn-secondary">
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          )}
        </div>
      </div>

      {movies.length === 0 ? (
        <div className="no-movies">
          <p>No movies found. {debouncedSearch || selectedGenre ? 'Try adjusting your filters or ' : ''}
            <Link to="/add">add a new movie</Link>.
          </p>
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              {movie.posterUrl && (
                <div className="movie-poster">
                  <img src={movie.posterUrl} alt={movie.title} />
                </div>
              )}
              <div className="movie-content">
                <h3 className="movie-title">{movie.title}</h3>
                {movie.genre && <p className="movie-genre">{movie.genre}</p>}
                <div className="movie-rating">{renderStars(movie.rating)}</div>
                <div className="movie-actions">
                  <Link to={`/edit/${movie.id}`} className="btn btn-small btn-edit">
                    Edit
                  </Link>
                  <button 
                    onClick={() => openDeleteModal(movie)} 
                    className="btn btn-small btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this movie?</p>
              {movieToDelete && (
                <div className="movie-info">
                  <strong>{movieToDelete.title}</strong>
                  {movieToDelete.genre && <span> ({movieToDelete.genre})</span>}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={closeDeleteModal} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn btn-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieList;
