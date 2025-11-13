import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './PostList.css';

const PostList = () => {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  

  const fetchPosters = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (search) {
        params.append('search', search);
      }
      
      params.append('sortBy', 'name');
      params.append('sortOrder', sortOrder);

      const response = await fetch(`${API_URL}/api/posters?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch posters');
      }

      const data = await response.json();
      setPosters(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching posters:', err);
    } finally {
      setLoading(false);
    }
  }, [search, sortOrder, API_URL]);

  useEffect(() => {
    fetchPosters();
  }, [fetchPosters]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/posters/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete poster');
      }

      // Refresh the list
      fetchPosters();
    } catch (err) {
      alert('Error deleting poster: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading posters...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="post-list-container">
      <div className="header">
        <h1>Posts</h1>
        <Link to="/create" className="btn btn-primary">Create New Post</Link>
      </div>

      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search posts by name..."
            value={search}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="sort-controls">
          <button onClick={toggleSortOrder} className="btn btn-secondary">
            Sort by Name: {sortOrder === 'asc' ? 'A–Z' : 'Z–A'}
          </button>
        </div>
      </div>

      {posters.length === 0 ? (
        <div className="no-posts">
          <p>No posts found. {search && 'Try a different search term or '}
            <Link to="/create">create a new post</Link>.
          </p>
        </div>
      ) : (
        <div className="posts-grid">
          {posters.map(poster => (
            <div key={poster.id} className="post-card">
              {poster.imageUrl && (
                <div className="post-image">
                  <img src={poster.imageUrl} alt={poster.name} />
                </div>
              )}
              <div className="post-content">
                <h3 className="post-name">{poster.name}</h3>
                <p className="post-description">{poster.description}</p>
                <div className="post-actions">
                  <Link to={`/edit/${poster.id}`} className="btn btn-small btn-edit">
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(poster.id)} 
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
    </div>
  );
};

export default PostList;
