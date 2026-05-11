import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  PackagePlus, 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  Download, 
  Plus, 
  Edit2,
  MessageSquare,
  Eye
} from 'lucide-react';
import DynamicTable from '../../../components/DynamicTable';
import DynamicToast from '../../../components/DynamicToast';
import RouteProtection from '../../../components/RouteProtection';
import ProtectedAction from '../../../components/ProtectedAction';
import usePosts from './usePosts';
import RightSideModal from '../../../components/RightSideModal';

function PostsContent() {
  const { posts, loading, error, createPost, updatePost } = usePosts();

  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    media: [],
    newLink: '',
    category_id: ''
  });
  const [toast, setToast] = useState(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/api/categories`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  // Helper function to find category ID by name
  const getCategoryIdByName = (categoryName) => {
    if (!categoryName) return '';
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.id : '';
  };

  const handleAddPostClick = () => {
    setEditingPost(null);
    setFormData({ title: '', content: '', media: [], newLink: '' });
    setIsModalOpen(true);
  };

  const handleViewPostClick = (row) => {
    setViewingPost(row);
    setIsViewModalOpen(true);
  };

  const handleEditPostClick = (row) => {
    setEditingPost(row);
    setFormData({
      title: row.title || '',
      content: row.content || '',
      media: row.media || [],
      newLink: '',
      category_id: getCategoryIdByName(row.category_name) || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    setFormData({ title: '', content: '', media: [], newLink: '' });
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setViewingPost(null);
  };

  const handleEditFromView = () => {
    if (viewingPost) {
      setEditingPost(viewingPost);
      setFormData({
        title: viewingPost.title || '',
        content: viewingPost.content || '',
        media: viewingPost.media || [],
        newLink: '',
        category_id: getCategoryIdByName(viewingPost.category_name) || ''
      });
      setIsViewModalOpen(false);
      setIsModalOpen(true);
    }
  };

  const handleToastClose = () => {
    setToast(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.title.trim()) {
      setToast({
        type: 'error',
        message: 'Post title is required'
      });
      return;
    }
    
    if (!formData.content.trim()) {
      setToast({
        type: 'error',
        message: 'Post content is required'
      });
      return;
    }
    
    
    try {
      console.log('Submitting form data:', formData);
      
      const result = editingPost
        ? await updatePost(
            editingPost.id,
            formData.title.trim(),
            formData.content.trim(),
            formData.media,
            formData.category_id
          )
        : await createPost(
            formData.title.trim(),
            formData.content.trim(),
            formData.media,
            formData.category_id
          );

      if (result.success) {
        setToast({
          type: 'success',
          message: `Post "${formData.title}" ${editingPost ? 'updated' : 'created'} successfully!` 
        });
        setIsModalOpen(false);
        setEditingPost(null);
        // Reset form data
        setFormData({
          title: '',
          content: '',
          media: [],
          newLink: '',
          category_id: ''
        });
      } else {
        setToast({
          type: 'error',
          message: result.message || `Failed to ${editingPost ? 'update' : 'create'} post`
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setToast({
        type: 'error',
        message: `Network error occurred while ${editingPost ? 'updating' : 'creating'} post` 
      });
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black uppercase tracking-[3px] text-gray-400">Syncing Post Database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-xl shadow-sm">
          <h3 className="text-red-800 font-bold uppercase text-sm">System Error</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden">

      {/* --- HEADER SECTION --- */}
      <div className="flex-shrink-0">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-black rounded-lg text-emerald-500 shadow-lg shadow-black/20">
                <MessageSquare size={24} />
              </div>
              <h1 className="text-4xl font-black text-black tracking-tighter">
                Post <span className="text-emerald-600 italic">Registry</span>
              </h1>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-xs font-bold text-black rounded-xl hover:bg-gray-50 transition-all shadow-sm">
              <Download size={14} />
              EXPORT LIST
            </button>
            <ProtectedAction routeName="posts">
              <button onClick={handleAddPostClick} className="flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all uppercase tracking-widest">
                <PackagePlus size={14} />
                Add Post
              </button>
            </ProtectedAction>
          </div>
        </motion.div>

        {/* --- SUMMARY TILES --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard
            icon={<MessageSquare className="text-emerald-600" size={20} />}
            label="Total Posts"
            value={posts?.length || 0}
            subText="Published Content"
          />
          <SummaryCard
            icon={<ShieldCheck className="text-black" size={20} />}
            label="Moderated"
            value={posts?.filter(p => p.status === 'published').length || 0}
            subText="Approved Posts"
          />
          <SummaryCard
            icon={<Search className="text-gray-400" size={20} />}
            label="Review Req."
            value="2"
            subText="In Progress"
          />
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex-1 min-h-0 bg-white rounded-2xl shadow-xl shadow-black/5 overflow-hidden border border-gray-100"
      >
        <DynamicTable
          data={posts}
          title="Post table"
          enableAddButton={false}
          enableActionColumn={true}
          actionButtons={[
            {
              label: 'View',
              onClick: (row) => handleViewPostClick(row),
              icon: <Eye size={16} />
            }
          ]}
          badgeColumns={[
            {
              column: 'status',
              values: {
                'PUBLISHED': 'green',
                'DRAFT': 'yellow',
                'ARCHIVED': 'red'
              }
            }
          ]}
          excludeColumns={['media', 'user_id']}
        />
      </motion.div>

      {/* Add Post Modal */}
      <RightSideModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPost ? 'Edit Post' : 'Create New Post'}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                Post Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="Enter post title..."
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              >
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                Content <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows="8"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="Write your post content..."
                required
              />
            </div>

            {/* Media Section */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                Media ({formData.media.length} items)
              </label>

              {/* Media List with Delete Buttons */}
              {formData.media.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.media.filter(item => item && typeof item === 'string').map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <div className="flex-1 min-w-0">
                        {item.startsWith('data:') ? (
                          <div className="flex items-center gap-2">
                            <img src={item} alt={`Preview ${index + 1}`} className="w-8 h-8 object-cover rounded" />
                            <span className="text-xs text-gray-600">Image {index + 1}</span>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const newMedia = [...formData.media];
                              newMedia[index] = e.target.value;
                              setFormData({ ...formData, media: newMedia });
                            }}
                            className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-emerald-500"
                            placeholder="Enter media URL..."
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newMedia = formData.media.filter((_, i) => i !== index);
                          setFormData({ ...formData, media: newMedia });
                        }}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Media Inputs - Below Content */}
              <div className="space-y-2">
                {/* Add Link Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.newLink || ''}
                    onChange={(e) => setFormData({ ...formData, newLink: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && formData.newLink?.trim()) {
                        e.preventDefault();
                        setFormData({
                          ...formData,
                          media: [...formData.media, formData.newLink.trim()],
                          newLink: ''
                        });
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                    placeholder="Enter media URL and press Enter..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.newLink?.trim()) {
                        setFormData({
                          ...formData,
                          media: [...formData.media, formData.newLink.trim()],
                          newLink: ''
                        });
                      }
                    }}
                    disabled={!formData.newLink?.trim()}
                    className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </button>
                </div>

                {/* Add Image Input */}
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg cursor-pointer hover:bg-emerald-100 transition-all">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-emerald-700 font-medium">Click to upload image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({
                              ...formData,
                              media: [...formData.media, reader.result]
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Add image URLs above or upload images. Each media item can be edited or deleted.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 text-xs font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-black text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              {editingPost ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </form>
      </RightSideModal>

      {/* View Post Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        title="View Post Details"
        size="2xl"
      >
        {viewingPost && (
          <div className="space-y-4">
            {/* Header Section */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-black text-black uppercase tracking-tight mb-2">Post Details</h3>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                  viewingPost.status === 1 || viewingPost.status === 'PUBLISHED' 
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : viewingPost.status === 'DRAFT'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {viewingPost.status === 1 ? 'PUBLISHED' : (viewingPost.status || 'UNKNOWN')}
                </span>
                <span className="text-xs text-gray-500">
                  ID: #{viewingPost.id}
                </span>
              </div>
            </div>

            {/* Title Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Title</label>
              <h4 className="text-base font-bold text-black leading-tight">
                {viewingPost.title || 'Untitled Post'}
              </h4>
            </div>

            {/* Content Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Content</label>
              <div className="bg-white p-4 rounded-lg border border-gray-200 min-h-[120px]">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {viewingPost.content || 'No content available'}
                </p>
              </div>
            </div>

            {/* Created Date Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Created Date</label>
              <p className="text-sm text-gray-600">
                {viewingPost.created_at ? 
                  new Date(viewingPost.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 
                  'Unknown'
                }
              </p>
            </div>

            {/* Category Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Category</label>
              <p className="text-sm text-gray-700">
                {viewingPost.category_name || 'No category assigned'}
              </p>
            </div>

            {/* Media Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Media {viewingPost.media && viewingPost.media.length > 0 &&
                  <span className="text-gray-400">({viewingPost.media.length} items)</span>
                }
              </label>
              {viewingPost.media && viewingPost.media.length > 0 ? (
                <div className="space-y-4">
                  {viewingPost.media.filter(item => item && typeof item === 'string').map((mediaItem, index) => {
                    // Check if it's a base64 image
                    const isBase64Image = mediaItem.startsWith('data:image');

                    const isVideo = !isBase64Image && (mediaItem.includes('youtube.com') || mediaItem.includes('youtu.be') || mediaItem.includes('vimeo.com') || mediaItem.includes('.mp4') || mediaItem.includes('facebook.com/watch') || mediaItem.includes('facebook.com/reel') || mediaItem.includes('facebook.com/plugins/video.php') || mediaItem.includes('<iframe'));

                    // Check if it's a Google Drive URL
                    const isGoogleDrive = !isBase64Image && (mediaItem.includes('drive.google.com/file/d/') || mediaItem.includes('drive.google.com/open?id='));

                    // Check if it's an image (including base64, URLs, Google Drive, etc.)
                    const isImage = isBase64Image || mediaItem.includes('.jpg') || mediaItem.includes('.jpeg') || mediaItem.includes('.png') || mediaItem.includes('.gif') || mediaItem.includes('.webp') || mediaItem.includes('facebook.com/photo') || mediaItem.includes('facebook.com/permalink') || mediaItem.includes('instagram.com/p') || mediaItem.includes('instagram.com/reel') || mediaItem.includes('twitter.com') || mediaItem.includes('x.com') || mediaItem.includes('imgur.com') || isGoogleDrive;

                    return (
                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-xs text-gray-400 mt-0.5">#{index + 1}</span>
                          <div className="flex-1">
                            {isBase64Image ? (
                              <span className="text-xs text-emerald-600 break-all">
                                Base64 Image {index + 1}
                              </span>
                            ) : (
                              <a
                                href={mediaItem}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-600 hover:text-emerald-800 underline break-all hover:bg-emerald-50 p-1 rounded transition-colors"
                              >
                                {mediaItem}
                              </a>
                            )}
                          </div>
                        </div>
                        
                        {/* Display media content */}
                        <div className="mt-3">
                          {isVideo ? (
                            <div className="aspect-w-16 aspect-h-9">
                              {mediaItem.includes('youtube.com') || mediaItem.includes('youtu.be') ? (
                                <iframe
                                  src={mediaItem.includes('youtu.be')
                                    ? `https://www.youtube.com/embed/${mediaItem.split('youtu.be/')[1]?.split('?')[0]}`
                                    : `https://www.youtube.com/embed/${mediaItem.split('v=')[1]?.split('&')[0]}`
                                  }
                                  className="w-full h-64 rounded-lg border border-gray-200"
                                  allowFullScreen
                                  title={`Video ${index + 1}`}
                                />
                              ) : mediaItem.includes('facebook.com/plugins/video.php') || mediaItem.includes('<iframe') ? (
                                <div className="w-full rounded-lg border border-gray-200 overflow-hidden relative" style={{ paddingBottom: '56.25%' }}>
                                  {mediaItem.includes('<iframe') ? (
                                    <div 
                                      dangerouslySetInnerHTML={{
                                        __html: mediaItem.replace(/width="\d+"/g, 'width="100%"').replace(/height="\d+"/g, 'height="100%"').replace(/style="[^"]*"/g, 'style="position:absolute;top:0;left:0;width:100%;height:100%;"')
                                      }}
                                      className="absolute inset-0 w-full h-full"
                                    />
                                  ) : (
                                    <iframe
                                      src={mediaItem}
                                      className="absolute inset-0 w-full h-full"
                                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                      allowFullScreen={true}
                                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                      scrolling="no"
                                      frameBorder="0"
                                      title={`Facebook Video ${index + 1}`}
                                    />
                                  )}
                                </div>
                              ) : mediaItem.includes('facebook.com/watch') || mediaItem.includes('facebook.com/reel') ? (
                                <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 text-center">
                                  <div className="flex items-center justify-center mb-3">
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-2.51 0-3.286 1.584-3.286 3.19v2.87h3.645l-.583 3.47h-3.062v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                      </svg>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-2">Facebook Video</p>
                                  <a 
                                    href={mediaItem} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 underline font-bold"
                                  >
                                    Watch on Facebook
                                  </a>
                                </div>
                              ) : (
                                <video
                                  controls
                                  className="w-full h-64 rounded-lg border border-gray-200"
                                  title={`Video ${index + 1}`}
                                >
                                  <source src={mediaItem} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                              )}
                            </div>
                          ) : isImage ? (
                            <div className="relative">
                              {mediaItem.includes('facebook.com/photo') || mediaItem.includes('facebook.com/permalink') ? (
                                <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 text-center">
                                  <div className="flex items-center justify-center mb-3">
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-2.51 0-3.286 1.584-3.286 3.19v2.87h3.645l-.583 3.47h-3.062v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                      </svg>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-1">Facebook Photo</p>
                                  <p className="text-xs text-gray-400 mb-3 italic">Requires Facebook login to view</p>
                                  <a 
                                    href={mediaItem} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 underline font-bold"
                                  >
                                    View on Facebook
                                  </a>
                                </div>
                              ) : mediaItem.includes('instagram.com') || mediaItem.includes('twitter.com') || mediaItem.includes('x.com') ? (
                                <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 text-center">
                                  <div className="flex items-center justify-center mb-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
                                      </svg>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-1">Social Media Image</p>
                                  <p className="text-xs text-gray-400 mb-3 italic">Requires platform login to view</p>
                                  <a 
                                    href={mediaItem} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-emerald-600 hover:text-emerald-800 underline font-bold"
                                  >
                                    View on Platform
                                  </a>
                                </div>
                              ) : isGoogleDrive ? (
                                <div className="relative">
                                  {(() => {
                                    // Extract file ID from Google Drive URL
                                    let fileId = '';
                                    let originalUrl = mediaItem;
                                    
                                    if (mediaItem.includes('drive.google.com/file/d/')) {
                                      fileId = mediaItem.split('/file/d/')[1]?.split('/')[0]?.split('?')[0];
                                    } else if (mediaItem.includes('drive.google.com/open?id=')) {
                                      fileId = mediaItem.split('open?id=')[1]?.split('&')[0];
                                    }
                                    
                                    console.log('Google Drive URL:', originalUrl);
                                    console.log('Extracted File ID:', fileId);
                                    
                                    // Try multiple URL formats for Google Drive images
                                    const mediaItems = fileId ? [
                                      `https://drive.google.com/uc?export=view&id=${fileId}`,
                                      `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
                                      `https://lh3.googleusercontent.com/d/${fileId}=s1000`
                                    ] : [mediaItem];
                                    
                                    return (
                                      <>
                                        <img
                                          src={mediaItems[0]}
                                          alt={`Google Drive Image ${index + 1}`}
                                          className="w-full h-auto rounded-lg border border-gray-200"
                                          onError={(e) => {
                                            console.log('Failed to load Google Drive image with URL:', mediaItems[0]);
                                            if (mediaItems.length > 1) {
                                              e.target.src = mediaItems[1];
                                            }
                                          }}
                                        />
                                        <a 
                                          href={originalUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded hover:bg-black/70 transition-colors"
                                        >
                                          View Original
                                        </a>
                                      </>
                                    );
                                  })()}
                                </div>
                              ) : isBase64Image ? (
                                <img
                                  src={mediaItem}
                                  alt={`Image ${index + 1}`}
                                  className="w-full h-auto rounded-lg border border-gray-200"
                                />
                              ) : (
                                <img
                                  src={mediaItem}
                                  alt={`Image ${index + 1}`}
                                  className="w-full h-auto rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const fallback = document.createElement('div');
                                    fallback.className = 'bg-gray-100 p-4 rounded-lg border border-gray-200 text-center';
                                    fallback.innerHTML = `
                                      <p className="text-xs text-gray-600 mb-2">Image failed to load</p>
                                      <a href="${mediaItem}" target="_blank" class="text-xs text-emerald-600 hover:text-emerald-800 underline">
                                        Open Image Link
                                      </a>
                                    `;
                                    e.target.parentNode.appendChild(fallback);
                                  }}
                                />
                              )}
                            </div>
                          ) : (
                            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 text-center">
                              <p className="text-xs text-gray-600 mb-2">Media Link</p>
                              <a 
                                href={mediaItem} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-600 hover:text-emerald-800 underline break-all"
                              >
                                {mediaItem}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 text-center">
                  <p className="text-xs text-gray-600">No media attached to this post</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleEditFromView}
                className="flex-1 px-4 py-3 bg-black text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Edit2 size={14} />
                Edit Post
              </button>
              <button
                onClick={handleViewModalClose}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 text-xs font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </RightSideModal>

      {/* Toast */}
      {toast && (
        <DynamicToast
          type={toast.type}
          message={toast.message}
          onClose={handleToastClose}
        />
      )}
    </div>
  );
}

// Summary Card Component
function SummaryCard({ icon, label, value, subText }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-600 mt-1">{subText}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default function Posts() {
  return (
    <RouteProtection>
      <PostsContent />
    </RouteProtection>
  );
}
