import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Image, 
  Video, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Share2, 
  Facebook, 
  Youtube,
  Upload,
  X,
  Link,
  Calendar,
  MessageSquare
} from 'lucide-react';

export default function PostManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    media_urls: [],
    media_type: 'text'
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/posts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setPosts(result.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(postForm)
      });
      const result = await response.json();
      if (result.success) {
        setPosts([result.data, ...posts]);
        setShowCreateModal(false);
        setPostForm({ title: '', content: '', media_urls: [], media_type: 'text' });
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      content: post.content,
      media_urls: post.media_urls || [],
      media_type: post.media_type || 'text'
    });
    setShowCreateModal(true);
  };

  const handleUpdatePost = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(postForm)
      });
      const result = await response.json();
      if (result.success) {
        setPosts(posts.map(p => p.id === editingPost.id ? result.data : p));
        setShowCreateModal(false);
        setEditingPost(null);
        setPostForm({ title: '', content: '', media_urls: [], media_type: 'text' });
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setPosts(posts.filter(p => p.id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleMediaUpload = (mediaUrls) => {
    setPostForm(prev => ({ ...prev, media_urls: mediaUrls }));
  };

  const renderMediaPreview = (mediaUrls) => {
    if (!mediaUrls || mediaUrls.length === 0) return null;
    
    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {mediaUrls.map((url, index) => {
          if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return (
              <div key={index} className="relative group">
                <img 
                  src={`https://img.youtube.com/vi/${url.split('v=')[1]}/mqdefault.jpg`} 
                  alt="YouTube thumbnail" 
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Youtube className="absolute inset-0 m-auto w-8 h-8 text-red-500" />
                <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  YouTube
                </span>
              </div>
            );
          } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
            return (
              <div key={index} className="relative group">
                <img 
                  src={url.includes('video') ? '/fb-video-thumb.jpg' : url} 
                  alt="Facebook content" 
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Facebook className="absolute inset-0 m-auto w-8 h-8 text-blue-600" />
                <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  Facebook
                </span>
              </div>
            );
          } else if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return (
              <div key={index} className="relative group">
                <img 
                  src={url} 
                  alt="Image" 
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Eye className="absolute inset-0 m-auto w-8 h-8 text-gray-500" />
                <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  Image
                </span>
              </div>
            );
          } else {
            return (
              <div key={index} className="relative group">
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-500" />
                  <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Media
                  </span>
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Post Management</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{post.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPost(post)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-gray-700 mb-4 line-clamp-3">
                  {post.content}
                </div>

                {post.media_urls && post.media_urls.length > 0 && (
                  <div className="mb-4">
                    {renderMediaPreview(post.media_urls)}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.media_type}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create/Edit Post Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingPost ? 'Edit Post' : 'Create Post'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingPost(null);
                        setPostForm({ title: '', content: '', media_urls: [], media_type: 'text' });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    editingPost ? handleUpdatePost() : handleCreatePost();
                  }}>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Post Title
                        </label>
                        <input
                          type="text"
                          value={postForm.title}
                          onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Enter post title..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content
                        </label>
                        <textarea
                          value={postForm.content}
                          onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                          rows="8"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Write your post content..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Media Type
                        </label>
                        <select
                          value={postForm.media_type}
                          onChange={(e) => setPostForm(prev => ({ ...prev, media_type: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="text">Text Only</option>
                          <option value="image">Images</option>
                          <option value="video">Videos</option>
                          <option value="mixed">Mixed Media</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Media URLs (one per line)
                        </label>
                        <textarea
                          value={postForm.media_urls.join('\n')}
                          onChange={(e) => handleMediaUpload(e.target.value.split('\n').filter(url => url.trim()))}
                          rows="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="https://youtube.com/watch?v=xxx&#10;https://facebook.com/xxx&#10;https://example.com/image.jpg"
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowMediaModal(true)}
                            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Media Library
                          </button>
                        </div>
                      </div>

                      {postForm.media_urls.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Media Preview:</h4>
                          {renderMediaPreview(postForm.media_urls)}
                        </div>
                      )}

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateModal(false);
                            setEditingPost(null);
                            setPostForm({ title: '', content: '', media_urls: [], media_type: 'text' });
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                        >
                          {editingPost ? (
                            <>
                              <Edit className="w-4 h-4" />
                              Update Post
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Create Post
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Media Upload Modal */}
        <AnimatePresence>
          {showMediaModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
                    <button
                      onClick={() => setShowMediaModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Images or Videos
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          const urls = files.map(file => URL.createObjectURL(file));
                          handleMediaUpload([...postForm.media_urls, ...urls]);
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Or Add External URLs
                      </label>
                      <textarea
                        placeholder="Add YouTube, Facebook, or other media URLs..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        onChange={(e) => {
                          const urls = e.target.value.split('\n').filter(url => url.trim());
                          handleMediaUpload([...postForm.media_urls, ...urls]);
                        }}
                        rows="4"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowMediaModal(false)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
