import { useState, useEffect } from 'react';

export default function useWebsiteSettings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [backgroundPreview, setBackgroundPreview] = useState(null);
    const [status, setStatus] = useState('active');
    const [toast, setToast] = useState(null);
    const [backgroundInputMode, setBackgroundInputMode] = useState('text'); // 'text' or 'file'

    // Toast management
    const showToast = (type, message) => {
        setToast({ type, message });
    };

    const hideToast = () => {
        setToast(null);
    };

    // Form data state
    const [formData, setFormData] = useState({
        welcome_badge: '',
        hero_title: '',
        hero_description: '',
        background_value: '',
        contact_number: '',
        contact_email: '',
        website_title: '',
        website_logo: null,
        location: '',
        status: 'active'
    });

    // Fetch website settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/api/home-page-settings`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        setSettings(result.data);
                        setFormData({
                            welcome_badge: result.data.welcome_badge || '',
                            hero_title: result.data.hero_title || '',
                            hero_description: result.data.hero_description || '',
                            background_value: result.data.background_value || '',
                            contact_number: result.data.contact_number || '',
                            contact_email: result.data.contact_email || '',
                            website_title: result.data.website_title || '',
                            website_logo: result.data.website_logo || null,
                            location: result.data.location || '',
                            status: result.data.status || 'active'
                        });
                        setStatus(result.data.status || 'active');
                        
                        // Set logo preview if exists
                        if (result.data.website_logo) {
                            if (result.data.website_logo.startsWith('data:')) {
                                setLogoPreview(result.data.website_logo);
                            } else if (result.data.website_logo.startsWith('/')) {
                                setLogoPreview(`data:image/jpeg;base64,${result.data.website_logo}`);
                            } else if (result.data.website_logo.startsWith('http')) {
                                setLogoPreview(result.data.website_logo);
                            }
                        }
                        
                        // Set background preview if exists and is an image
                        if (result.data.background_value) {
                            if (result.data.background_value.startsWith('data:image/')) {
                                setBackgroundPreview(result.data.background_value);
                                setBackgroundInputMode('file');
                            } else if (result.data.background_value.startsWith('http')) {
                                setBackgroundPreview(result.data.background_value);
                                setBackgroundInputMode('file');
                            } else {
                                setBackgroundInputMode('text');
                            }
                        }
                    }
                } else {
                    setError('Failed to fetch settings');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (field === 'status') {
            setStatus(value);
        }
    };

    // Handle logo change
    const handleLogoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast('warning', 'File size must be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Data = e.target.result;
                setLogoPreview(base64Data);
                handleInputChange('website_logo', base64Data);
                showToast('success', 'Logo uploaded successfully');
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle background file change
    const handleBackgroundChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast('warning', 'Background file size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Data = e.target.result;
                setBackgroundPreview(base64Data);
                handleInputChange('background_value', base64Data);
                showToast('success', 'Background uploaded successfully');
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            setLoading(true);
            
            const submitData = { ...formData };
            
            // Convert logo to base64 if it's a file
            if (logoPreview && logoPreview.startsWith('data:') && !submitData.website_logo) {
                submitData.website_logo = logoPreview;
            }

            let response;
            if (settings?.id) {
                // Update existing settings
                response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/api/home-page-settings/${settings.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(submitData)
                });
            } else {
                // Create new settings
                response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/api/home-page-settings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(submitData)
                });
            }

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setSettings(result.data);
                    showToast('success', 'Website settings saved successfully!');
                } else {
                    setError(result.message || 'Failed to save settings');
                    showToast('error', result.message || 'Failed to save settings');
                }
            } else {
                setError('Failed to save settings');
                showToast('error', 'Failed to save settings');
            }
        } catch (err) {
            setError(err.message);
            showToast('error', 'Error saving settings: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        settings,
        loading,
        error,
        logoPreview,
        backgroundPreview,
        status,
        formData,
        toast,
        showToast,
        hideToast,
        backgroundInputMode,
        setBackgroundInputMode,
        handleLogoChange,
        handleBackgroundChange,
        handleInputChange,
        handleSubmit,
    };
}
