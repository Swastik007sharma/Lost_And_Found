import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../services/itemService';
import { getCategories } from '../services/categoryService';
import { getSubCategories } from '../services/subCategoryService';
import { toast } from 'react-toastify';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import {
  FaCamera,
  FaUpload,
  FaMapMarkerAlt,
  FaTag,
  FaFileAlt,
  FaCheckCircle,
  FaTimes,
  FaArrowLeft,
  FaExclamationCircle,
  FaImage,
  FaSyncAlt,
  FaVideo
} from 'react-icons/fa';

function ItemCreate() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subCategory: '',
    status: '',
    location: '',
  });
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [showFoundSuccess, setShowFoundSuccess] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories({ limit: 100 });
        setCategories(response.data.categories || []);
      } catch (err) {
        toast.error('Failed to load categories: ' + (err.response?.data?.message || err.message), {
          toastId: 'categories-load-error',
          position: 'top-center'
        });
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (formData.category) {
        try {
          const categoryDoc = categories.find(cat => cat.name === formData.category);
          if (categoryDoc) {
            const response = await getSubCategories(categoryDoc._id);
            setSubCategories(response.data.subCategories || []);
            setFormData((prev) => ({ ...prev, subCategory: '' }));
          } else {
            setSubCategories([]);
            setFormData((prev) => ({ ...prev, subCategory: '' }));
          }
        } catch (err) {
          toast.error('Failed to load subcategories: ' + (err.response?.data?.message || err.message), {
            toastId: 'subcategories-load-error',
            position: 'top-center'
          });
        }
      } else {
        setSubCategories([]);
        setFormData((prev) => ({ ...prev, subCategory: '' }));
      }
    };
    fetchSubCategories();
  }, [formData.category, categories]);

  // Get available cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(videoDevices);
        if (videoDevices.length > 0 && !selectedCamera) {
          // Select back camera by default if available
          const backCamera = videoDevices.find(device =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );
          setSelectedCamera(backCamera || videoDevices[0]);
        }
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };

    if (showCamera) {
      getCameras();
    }
  }, [showCamera, selectedCamera]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleOpenCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Camera not supported in this browser.');
      return;
    }
    try {
      const constraints = selectedCamera
        ? { video: { deviceId: { exact: selectedCamera.deviceId } } }
        : { video: { facingMode: facingMode } };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setVideoStream(stream);
      setShowCamera(true);

      // Set video stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Failed to access camera: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSwitchCamera = async () => {
    // Stop current stream
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
    }

    if (availableCameras.length > 1) {
      // Switch to next camera in the list
      const currentIndex = availableCameras.findIndex(cam => cam.deviceId === selectedCamera?.deviceId);
      const nextIndex = (currentIndex + 1) % availableCameras.length;
      setSelectedCamera(availableCameras[nextIndex]);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: availableCameras[nextIndex].deviceId } }
        });
        setVideoStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        toast.success('Camera switched successfully');
      } catch (err) {
        console.error('Switch camera error:', err);
        toast.error('Failed to switch camera');
      }
    } else {
      // Fallback to toggle facing mode
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      setFacingMode(newFacingMode);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: newFacingMode }
        });
        setVideoStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        toast.success('Camera switched successfully');
      } catch (err) {
        console.error('Switch camera error:', err);
        toast.error('Failed to switch camera');
      }
    }
  };

  const handleTakePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');

      // Mirror image only for front camera
      if (facingMode === 'user' || selectedCamera?.label.toLowerCase().includes('front')) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
        setVideoStream(null);
      }

      const dataUrl = canvas.toDataURL('image/png');
      setImagePreview(dataUrl);

      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'captured.png', { type: 'image/png' });
          setImage(file);
        });

      setShowCamera(false);
    }
  };

  const handleCloseCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
    setShowCamera(false);
  };

  const handleStatusSelect = (status) => {
    setFormData((prev) => ({ ...prev, status }));
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    if (!formData.title?.trim()) {
      toast.error('Title is required.', {
        toastId: 'title-required',
        position: 'top-center'
      });
      return;
    }
    if (!formData.description?.trim()) {
      toast.error('Description is required.', {
        toastId: 'description-required',
        position: 'top-center'
      });
      return;
    }
    if (!formData.category) {
      toast.error('Category is required.', {
        toastId: 'category-required',
        position: 'top-center'
      });
      return;
    }
    if (!formData.subCategory) {
      toast.error('Subcategory is required.', {
        toastId: 'subcategory-required',
        position: 'top-center'
      });
      return;
    }
    if (!formData.status) {
      toast.error('Status is required.', {
        toastId: 'status-required',
        position: 'top-center'
      });
      return;
    }
    if (!formData.location?.trim()) {
      toast.error('Location is required.', {
        toastId: 'location-required',
        position: 'top-center'
      });
      return;
    }
    if (formData.status === 'Found' && !image) {
      toast.error('Image is required for found items.', {
        toastId: 'image-required',
        position: 'top-center'
      });
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('subCategory', formData.subCategory);
    data.append('status', formData.status);
    data.append('location', formData.location);
    if (image instanceof File) {
      data.append('image', image);
    }

    try {
      await createItem(data);
      toast.success('Item created successfully!', {
        toastId: 'item-create-success',
        position: 'top-center',
        autoClose: 3000
      });
      if (formData.status === 'Found') {
        setShowFoundSuccess(true);
      } else {
        setFormData({
          title: '',
          description: '',
          category: '',
          subCategory: '',
          status: '',
          location: '',
        });
        setImage(null);
        setImagePreview(null);
        setIsModalOpen(true);
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (err) {
      console.error('Item creation error:', err);

      // Handle the new consistent error format
      const errorResponse = err.response?.data;

      if (errorResponse) {
        // Check if it's a validation error with details
        if (errorResponse.code === 'VALIDATION_ERROR' && errorResponse.details) {
          toast.error(errorResponse.message || 'Validation failed', {
            toastId: 'validation-error',
            position: 'top-center',
            autoClose: 5000
          });
        } else if (errorResponse.code === 'IMAGE_VERIFICATION_FAILED') {
          toast.error(`Image verification failed: ${errorResponse.details || errorResponse.message}`, {
            toastId: 'image-verification-error',
            position: 'top-center',
            autoClose: 5000
          });
        } else {
          // Show the error message from the backend
          toast.error(errorResponse.message || 'Failed to create item', {
            toastId: 'create-item-error',
            position: 'top-center',
            autoClose: 5000
          });
        }
      } else {
        // Network or other error
        toast.error(err.message || 'Failed to create item. Please try again.', {
          toastId: 'network-error',
          position: 'top-center',
          autoClose: 5000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.title &&
      formData.description &&
      formData.category &&
      formData.subCategory &&
      formData.status &&
      formData.location &&
      (formData.status === 'Found' ? image instanceof File : true)
    );
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Modal for status selection */}
      <Modal isOpen={isModalOpen} onClose={() => handleStatusSelect('Lost')}>
        <div className="p-8" style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}>
          <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--color-text)' }}>
            Report an Item
          </h2>
          <p className="text-sm mb-6 text-center opacity-75" style={{ color: 'var(--color-text)' }}>
            Choose the type of report you'd like to make
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleStatusSelect('Lost')}
              className="group p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2"
              style={{
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                borderColor: '#ef4444'
              }}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="text-5xl">🔴</div>
                <h3 className="text-xl font-bold">Lost Item</h3>
                <p className="text-sm text-center opacity-75">
                  I lost something and need help finding it
                </p>
              </div>
            </button>
            <button
              onClick={() => handleStatusSelect('Found')}
              className="group p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2"
              style={{
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                borderColor: '#10b981'
              }}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="text-5xl">🟢</div>
                <h3 className="text-xl font-bold">Found Item</h3>
                <p className="text-sm text-center opacity-75">
                  I found something and want to return it
                </p>
              </div>
            </button>
          </div>
        </div>
      </Modal>

      {/* Progress indicator */}
      {!isModalOpen && !showFoundSuccess && (
        <div className="w-full py-6" style={{ background: 'var(--color-secondary)' }}>
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                <div className={`flex flex-col items-center flex-1 ${formData.status ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${formData.status ? 'bg-blue-600 text-white scale-110' : 'bg-gray-300 text-gray-600'}`}>
                    <FaCheckCircle />
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Status</span>
                </div>
                <div className={`h-1 flex-1 mx-2 transition-all duration-300 ${formData.title && formData.description ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`flex flex-col items-center flex-1 ${formData.title && formData.description ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${formData.title && formData.description ? 'bg-blue-600 text-white scale-110' : 'bg-gray-300 text-gray-600'}`}>
                    <FaFileAlt />
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Details</span>
                </div>
                <div className={`h-1 flex-1 mx-2 transition-all duration-300 ${formData.category && formData.location ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`flex flex-col items-center flex-1 ${formData.category && formData.location ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${formData.category && formData.location ? 'bg-blue-600 text-white scale-110' : 'bg-gray-300 text-gray-600'}`}>
                    <FaTag />
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Category</span>
                </div>
                <div className={`h-1 flex-1 mx-2 transition-all duration-300 ${(formData.status === 'Found' ? image : true) ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`flex flex-col items-center flex-1 ${(formData.status === 'Found' ? image : true) ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${(formData.status === 'Found' ? image : true) ? 'bg-blue-600 text-white scale-110' : 'bg-gray-300 text-gray-600'}`}>
                    <FaImage />
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Image</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {showFoundSuccess ? (
        <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
          <div className="max-w-2xl w-full rounded-2xl shadow-2xl p-10 flex flex-col items-center animate-fade-in" style={{ background: 'var(--color-secondary)' }}>
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-6">
              <FaCheckCircle className="text-5xl text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-center" style={{ color: 'var(--color-text)' }}>
              Found Item Submitted Successfully!
            </h2>
            <p className="mb-8 text-lg text-center opacity-80" style={{ color: 'var(--color-text)' }}>
              You can now submit the item to a keeper for safekeeping, or keep it with yourself until someone claims it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <button
                className="flex-1 px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
                onClick={() => navigate('/keepers')}
              >
                <FaMapMarkerAlt />
                <span>Find Keeper</span>
              </button>
              <button
                className="flex-1 px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}
                onClick={() => navigate('/dashboard')}
              >
                <FaCheckCircle />
                <span>Keep It</span>
              </button>
            </div>
          </div>
        </div>
      ) : !isModalOpen && (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header with back button */}
            <div className="mb-8">
              <button
                type="button"
                className="flex items-center space-x-2 mb-6 py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}
                onClick={() => navigate('/dashboard')}
              >
                <FaArrowLeft />
                <span className="font-medium">Back to Dashboard</span>
              </button>

              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                  Add New Item
                </h1>
                {formData.status && (
                  <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full shadow-md" style={{
                    background: formData.status === 'Lost' ? '#fee2e2' : '#d1fae5',
                    color: formData.status === 'Lost' ? '#991b1b' : '#065f46'
                  }}>
                    <span className="text-2xl">{formData.status === 'Lost' ? '🔴' : '🟢'}</span>
                    <span className="font-bold">{formData.status} Item</span>
                  </div>
                )}
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl shadow-2xl overflow-hidden"
              style={{ background: 'var(--color-secondary)' }}
              encType="multipart/form-data"
            >
              <div className="p-6 md:p-8 lg:p-10">

                {/* Item Details Section */}
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
                      <FaFileAlt className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                      Item Details
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="md:col-span-2">
                      <label htmlFor="title" className="text-sm font-semibold mb-2 flex items-center space-x-1" style={{ color: 'var(--color-text)' }}>
                        <span>Title</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-2 text-base shadow-sm hover:shadow-md transition-all duration-200"
                        style={{
                          border: '2px solid var(--color-accent)',
                          background: 'var(--color-bg)',
                          color: 'var(--color-text)'
                        }}
                        placeholder="e.g., Black Leather Wallet"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label htmlFor="description" className="text-sm font-semibold mb-2 flex items-center space-x-1" style={{ color: 'var(--color-text)' }}>
                        <span>Description</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-2 text-base shadow-sm hover:shadow-md transition-all duration-200 resize-none"
                        style={{
                          border: '2px solid var(--color-accent)',
                          background: 'var(--color-bg)',
                          color: 'var(--color-text)'
                        }}
                        rows="4"
                        placeholder="Provide a detailed description..."
                        required
                      />
                      <p className="mt-2 text-xs opacity-70" style={{ color: 'var(--color-text)' }}>
                        Include distinctive features, colors, brands, or any identifying marks
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category Section */}
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
                      <FaTag className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                      Category & Location
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div>
                      <label htmlFor="category" className="text-sm font-semibold mb-2 flex items-center space-x-1" style={{ color: 'var(--color-text)' }}>
                        <span>Category</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-2 text-base shadow-sm hover:shadow-md transition-all duration-200"
                        style={{
                          border: '2px solid var(--color-accent)',
                          background: 'var(--color-bg)',
                          color: 'var(--color-text)'
                        }}
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subcategory */}
                    <div>
                      <label htmlFor="subCategory" className="text-sm font-semibold mb-2 flex items-center space-x-1" style={{ color: 'var(--color-text)' }}>
                        <span>Subcategory</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="subCategory"
                        name="subCategory"
                        value={formData.subCategory}
                        onChange={handleChange}
                        className="w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-2 text-base shadow-sm hover:shadow-md transition-all duration-200"
                        style={{
                          border: '2px solid var(--color-accent)',
                          background: 'var(--color-bg)',
                          color: 'var(--color-text)'
                        }}
                        required
                        disabled={!formData.category}
                      >
                        <option value="">Select a subcategory</option>
                        {subCategories.map((subCategory) => (
                          <option key={subCategory._id} value={subCategory.name}>
                            {subCategory.name}
                          </option>
                        ))}
                      </select>
                      {!formData.category && (
                        <p className="mt-2 text-xs opacity-70" style={{ color: 'var(--color-text)' }}>
                          Please select a category first
                        </p>
                      )}
                    </div>

                    {/* Location */}
                    <div className="md:col-span-2">
                      <label htmlFor="location" className="text-sm font-semibold mb-2 flex items-center space-x-1" style={{ color: 'var(--color-text)' }}>
                        <FaMapMarkerAlt className="text-sm" style={{ color: 'var(--color-accent)' }} />
                        <span>Location</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-2 text-base shadow-sm hover:shadow-md transition-all duration-200"
                        style={{
                          border: '2px solid var(--color-accent)',
                          background: 'var(--color-bg)',
                          color: 'var(--color-text)'
                        }}
                        placeholder="e.g., Main Hall, Room 101, Library 2nd Floor"
                        required
                      />
                      <p className="mt-2 text-xs opacity-70" style={{ color: 'var(--color-text)' }}>
                        Be specific to help others locate the item
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image Section */}
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
                      <FaCamera className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                        Image {formData.status === 'Found' && <span className="text-red-500">*</span>}
                      </h2>
                      <p className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
                        {formData.status === 'Found'
                          ? 'Photo required for verification'
                          : 'Optional: helps with identification'}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl border-2 border-dashed" style={{
                    borderColor: image ? 'var(--color-accent)' : 'var(--color-text)',
                    background: 'var(--color-bg)',
                    opacity: image ? 1 : 0.7
                  }}>
                    {formData.status === 'Found' ? (
                      <>
                        {showCamera ? (
                          <div className="flex flex-col items-center space-y-4">
                            <div className="relative w-full max-w-md">
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-64 md:h-80 rounded-xl object-cover shadow-lg"
                                style={{ background: '#222' }}
                              />

                              {/* Camera info overlay */}
                              {availableCameras.length > 1 && selectedCamera && (
                                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2">
                                  <FaVideo />
                                  <span>
                                    {selectedCamera.label.includes('front') || selectedCamera.label.includes('user') ? 'Front' : 'Back'} Camera
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-3 justify-center">
                              <button
                                type="button"
                                className="px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                                style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
                                onClick={handleTakePhoto}
                              >
                                <FaCamera />
                                <span>Capture Photo</span>
                              </button>

                              {(availableCameras.length > 1 || navigator.mediaDevices?.getSupportedConstraints?.()?.facingMode) && (
                                <button
                                  type="button"
                                  className="px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                                  style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}
                                  onClick={handleSwitchCamera}
                                >
                                  <FaSyncAlt />
                                  <span>Switch Camera</span>
                                </button>
                              )}

                              <button
                                type="button"
                                className="px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                                style={{ background: 'var(--color-secondary)', color: 'var(--color-text)', border: '2px solid var(--color-accent)' }}
                                onClick={handleCloseCamera}
                              >
                                <FaTimes />
                                <span>Cancel</span>
                              </button>
                            </div>

                            {availableCameras.length > 1 && (
                              <p className="text-xs text-center opacity-70" style={{ color: 'var(--color-text)' }}>
                                {availableCameras.length} cameras available - use Switch Camera to change
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-4">
                            {imagePreview ? (
                              <div className="relative group">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-64 h-64 object-cover rounded-xl shadow-lg"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <FaCheckCircle className="text-white text-4xl" />
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <FaCamera className="text-6xl mx-auto mb-4 opacity-50" style={{ color: 'var(--color-text)' }} />
                                <p className="text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                                  No image captured yet
                                </p>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={handleOpenCamera}
                              className="px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                              style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
                            >
                              <FaCamera />
                              <span>{imagePreview ? 'Retake Photo' : 'Open Camera'}</span>
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center space-y-4">
                        {imagePreview ? (
                          <div className="relative group">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-64 h-64 object-cover rounded-xl shadow-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <FaCheckCircle className="text-white text-4xl" />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FaUpload className="text-6xl mx-auto mb-4 opacity-50" style={{ color: 'var(--color-text)' }} />
                            <p className="text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                              No image uploaded yet
                            </p>
                          </div>
                        )}
                        <label htmlFor="image" className="cursor-pointer">
                          <div className="px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2" style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}>
                            <FaUpload />
                            <span>{imagePreview ? 'Change Image' : 'Upload Image'}</span>
                          </div>
                          <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            required={formData.status === 'Found'}
                          />
                        </label>
                      </div>
                    )}

                    {formData.status === 'Found' && (
                      <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${image ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                        {image ? (
                          <>
                            <FaCheckCircle className="text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              Image captured successfully
                            </span>
                          </>
                        ) : (
                          <>
                            <FaExclamationCircle className="text-red-600 dark:text-red-400" />
                            <span className="text-sm font-medium text-red-800 dark:text-red-200">
                              Image is required for found items
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t-2" style={{ borderColor: 'var(--color-bg)' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                    style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '2px solid var(--color-accent)' }}
                  >
                    <FaTimes />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !isFormValid()}
                    className={`px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 ${loading || !isFormValid()
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-105'
                      }`}
                    style={{
                      background: loading || !isFormValid() ? '#9ca3af' : 'var(--color-primary)',
                      color: 'var(--color-bg)'
                    }}
                  >
                    {loading && (
                      <div className="inline-flex items-center justify-center">
                        <Loader size="xs" className="h-5! w-5!" />
                      </div>
                    )}
                    {!loading && <FaCheckCircle />}
                    <span>{loading ? 'Submitting...' : 'Submit Item'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemCreate;
