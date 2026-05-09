import React, { createContext, useContext, useState } from 'react';
import { Plus } from 'lucide-react';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);

  const openModal = (modalContent) => {
    console.log('Opening modal with content:', modalContent);
    setModal(modalContent);
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <ModalContext.Provider value={{ modal, openModal, closeModal }}>
      {children}
      {modal && (
        <div className="fixed inset-0 z-[9999]">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] transition-opacity animate-in fade-in duration-300"
            onClick={closeModal}
          />
          <div className={`fixed right-0 top-0 h-screen w-96 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.2)] z-[90] transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right`}>
            {/* Header */}
            <div className="bg-emerald-600 px-6 py-5 flex items-center justify-between relative">
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600" />
              <div className="flex flex-col">
                <h2 className="text-lg font-black text-white uppercase tracking-tight">{modal.title}</h2>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[2px]">5L Allied Services</span>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-emerald-800 text-gray-400 hover:text-red-500 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                {modal.isCreateMode !== undefined ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    console.log('Form submitted with data:', modal.formData);
                    modal.onSubmit && modal.onSubmit(modal.formData);
                  }} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                          Post Title <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={modal.formData?.title || ''}
                          onChange={(e) => {
                            console.log('Title input change:', e.target.value);
                            if (modal.setFormData) {
                              modal.setFormData({ ...modal.formData, title: e.target.value });
                            }
                          }}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                          placeholder="Enter post title..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                          Content <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          value={modal.formData?.content || ''}
                          onChange={(e) => {
                            console.log('Content input change:', e.target.value);
                            if (modal.setFormData) {
                              modal.setFormData({ ...modal.formData, content: e.target.value });
                            }
                          }}
                          rows="8"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                          placeholder="Write your post content..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                          Media Type <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={modal.formData?.media_type || 'text'}
                          onChange={(e) => modal.setFormData && modal.setFormData({ ...modal.formData, media_type: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                          required
                        >
                          <option value="">Select type...</option>
                          <option value="text">Text Only</option>
                          <option value="image">Images</option>
                          <option value="video">Videos</option>
                          <option value="mixed">Mixed Media</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                          Media URLs
                        </label>
                        <textarea
                          value={modal.formData?.media_urls?.join('\n') || ''}
                          onChange={(e) => modal.setFormData && modal.setFormData({ ...modal.formData, media_urls: e.target.value.split('\n').filter(url => url.trim()) })}
                          rows="4"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                          placeholder="https://youtube.com/watch?v=xxx&#10;https://facebook.com/xxx&#10;https://example.com/image.jpg"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 text-xs font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-black text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <Plus size={14} />
                        {modal.isCreateMode ? 'Create Post' : 'Update Post'}
                      </button>
                    </div>
                  </form>
                ) : modal.content}
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 w-full bg-gray-50 border-t border-gray-100 p-4 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Confidential Accounting Record</p>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
