import { useState, useEffect } from 'react';

const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/posts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setPosts(result.data);
      } else {
        setError(result.message || 'Failed to fetch posts');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (title, content, media = [], category_id) => {
    try {
      // Build data object matching server expectations
      const postData = {
        title: title,
        content: content,
        media: media || [],
        category_id: category_id || null,
        status: 1
      };
      
      console.log('Creating post with data:', postData);
      
      const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(postData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchPosts(); // Refresh the posts list
        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message || 'Failed to create post' };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updatePost = async (id, title, content, media = [], category_id) => {
    try {
      // Build data object matching server expectations
      const postData = {
        id: id,
        title: title,
        content: content,
        media: media || [],
        category_id: category_id || null,
        status: 1
      };
      
      console.log('Updating post with data:', postData);
      
      const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(postData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchPosts(); // Refresh the posts list
        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message || 'Failed to update post' };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deletePost = async (postId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchPosts(); // Refresh the posts list
        return { success: true };
      } else {
        return { success: false, message: result.message || 'Failed to delete post' };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const handleEditPost = async (postData) => {
    return await updatePost(postData);
  };

  const handleDeletePost = async (postId) => {
    return await deletePost(postId);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    handleEditPost,
    handleDeletePost,
  };
};

export default usePosts;
