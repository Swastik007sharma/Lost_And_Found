import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../services/itemService';
import { getCategories } from '../services/categoryService';
import { getSubCategories } from '../services/subCategoryService';
import { toast } from 'react-toastify';
import Modal from '../components/common/Modal';

function ItemCreate() {
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch all categories by setting a high limit
        const response = await getCategories({ limit: 100 });
        setCategories(response.data.categories || []);
      } catch (err) {
        toast.error('Failed to load categories: ' + (err.response?.data?.message || err.message));
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
          toast.error('Failed to load subcategories: ' + (err.response?.data?.message || err.message));
        }
      } else {
        setSubCategories([]);
        setFormData((prev) => ({ ...prev, subCategory: '' }));
      }
    };
    fetchSubCategories();
  }, [formData.category, categories]);

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

  // Camera logic
  const handleOpenCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Camera not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      setShowCamera(true);
    } catch (err) {
      toast.error('Failed to access camera: ' + (err.message || 'Unknown error'));
    }
  };


  const handleTakePhoto = () => {
    const video = document.getElementById('item-create-video');
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      // Flip horizontally to fix mirror effect
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Reset transform for future use (not strictly needed here)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
        setVideoStream(null);
      }
      const dataUrl = canvas.toDataURL('image/png');
      setImagePreview(dataUrl);
      // Convert dataUrl to File for upload
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
    if (formData.status === 'Found' && !image) {
      toast.error('Image is required for found items.');
      return;
    }
    if (!formData.location) {
      toast.error('Location is required.');
      return;
    }
    if (!formData.subCategory) {
      toast.error('Subcategory is required.');
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
      toast.success('Item created successfully!');
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
      console.log(err);

      if (err.response?.data?.error?.type === 'VALIDATION_ERROR') {
        const errorDetails = err.response.data.error.details.map(detail => `${detail.field}: ${detail.message}`).join(', ');
        toast.error(`Failed to create item: ${errorDetails}`);
      } else if (err.response?.data?.code === 'IMAGE_VERIFICATION_FAILED') {
        toast.error(`Image verification failed: ${err.response.data.details}`);
      } else {
        toast.error('Failed to create item: ' + (err.response?.data?.message || err.message));
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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Modal for status selection */}
      <Modal isOpen={isModalOpen} onClose={() => handleStatusSelect('Lost')}>
        <div className="p-6 text-center" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            What would you like to report?
          </h2>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleStatusSelect('Lost')}
              className="p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              style={{
                background: 'var(--color-secondary)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-secondary)'
              }}
              aria-label="Report a lost item"
            >
              🔴 I lost an item
            </button>
            <button
              onClick={() => handleStatusSelect('Found')}
              className="p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              style={{
                background: 'var(--color-secondary)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-secondary)'
              }}
              aria-label="Report a found item"
            >
              🟢 I found an item
            </button>
          </div>
        </div>
      </Modal>

      {/* Stepper/progress indicator */}
      {!isModalOpen && !showFoundSuccess && (
        <div className="w-full flex justify-center mt-4 mb-2">
          <ol className="flex items-center w-full max-w-xl mx-auto text-sm font-medium text-gray-500 dark:text-gray-300">
            <li className={`flex-1 flex items-center ${formData.status ? 'text-blue-600 dark:text-blue-400' : ''}`}>1. Status</li>
            <li className="mx-2">→</li>
            <li className={`flex-1 flex items-center ${formData.title ? 'text-blue-600 dark:text-blue-400' : ''}`}>2. Details</li>
            <li className="mx-2">→</li>
            <li className={`flex-1 flex items-center ${(formData.status === 'Found' ? image : true) ? 'text-blue-600 dark:text-blue-400' : ''}`}>3. Image</li>
            <li className="mx-2">→</li>
            <li className="flex-1 flex items-center">4. Submit</li>
          </ol>
        </div>
      )}

      {/* Success message */}
      {showFoundSuccess ? (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 xl:p-10 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="max-w-xl w-full bg-green-50 dark:bg-green-900 rounded-lg shadow-lg p-8 flex flex-col items-center animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-green-700 dark:text-green-200 text-center">Found Item Submitted!</h2>
            <p className="mb-6 text-lg text-center text-green-800 dark:text-green-100">
              You can now submit the item to a keeper for safekeeping, or keep it with yourself until someone claims it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button
                className="w-full sm:w-auto px-6 py-3 rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors"
                onClick={() => navigate('/keepers')}
              >
                Go to Keeper List
              </button>
              <button
                className="w-full sm:w-auto px-6 py-3 rounded-md bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold shadow hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                onClick={() => navigate('/dashboard')}
              >
                Keep With Myself
              </button>
            </div>
          </div>
        </div>
      ) : !isModalOpen && (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 xl:p-10 flex-1">
          <div className="max-w-2xl mx-auto relative">
            {/* Back button */}
            <button
              type="button"
              className="absolute left-0 top-0 mt-2 ml-2 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
              onClick={() => navigate('/dashboard')}
              aria-label="Back to dashboard"
            >
              ← Back
            </button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center" style={{ color: 'var(--color-text)' }}>
              Add New Item {formData.status && `(${formData.status === 'Lost' ? '🔴 Lost' : '🟢 Found'})`}
            </h1>
            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 animate-fade-in"
              encType="multipart/form-data"
              style={{ color: 'var(--color-text)' }}
              aria-label="Create new item form"
            >
              {/* Section: Details */}
              <h2 className="text-lg font-semibold mb-2 border-b border-gray-200 dark:border-gray-700 pb-1 flex items-center gap-2">
                <span>Item Details</span>
                <span className="text-xs text-gray-400">Step 2/4</span>
              </h2>
              {/* Title */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm sm:text-base md:text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow-sm hover:shadow-md transition-shadow duration-200"
                  style={{
                    border: '1px solid var(--color-secondary)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                  required
                />
              </div>
              {/* Description */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm sm:text-base md:text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow-sm hover:shadow-md transition-shadow duration-200"
                  style={{
                    border: '1px solid var(--color-secondary)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                  rows="4"
                  required
                />
              </div>
              {/* Category */}
              <div className="mb-6">
                <label htmlFor="category" className="block text-sm sm:text-base md:text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow-sm hover:shadow-md transition-shadow duration-200"
                  style={{
                    border: '1px solid var(--color-secondary)',
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
              <div className="mb-6">
                <label htmlFor="subCategory" className="block text-sm sm:text-base md:text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Subcategory
                </label>
                <select
                  id="subCategory"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow-sm hover:shadow-md transition-shadow duration-200"
                  style={{
                    border: '1px solid var(--color-secondary)',
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
                  <p className="mt-1 text-sm text-gray-500">
                    Please select a category to load subcategories.
                  </p>
                )}
              </div>
              {/* Location */}
              <div className="mb-6">
                <label htmlFor="location" className="block text-sm sm:text-base md:text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Location (Required)
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow-sm hover:shadow-md transition-shadow duration-200"
                  style={{
                    border: '1px solid var(--color-secondary)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                  placeholder="e.g., Main Hall, Room 101"
                  required
                />
              </div>
              {/* Image */}
              <div className="mb-6">
                <label htmlFor="image" className="block text-sm sm:text-base md:text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Image {formData.status === 'Found' ? '(Required)' : '(Optional)'}
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {formData.status === 'Found' ? (
                    <>
                      {showCamera ? (
                        <div className="flex flex-col items-center gap-2 w-full">
                          <video
                            id="item-create-video"
                            autoPlay
                            playsInline
                            style={{ width: '240px', height: '180px', borderRadius: '0.5rem', background: '#222' }}
                            ref={el => {
                              if (el && videoStream && !el.srcObject) {
                                el.srcObject = videoStream;
                              }
                            }}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700"
                              onClick={handleTakePhoto}
                            >
                              Take Photo
                            </button>
                            <button
                              type="button"
                              className="px-4 py-2 rounded bg-gray-300 text-gray-900 font-semibold shadow hover:bg-gray-400"
                              onClick={handleCloseCamera}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleOpenCamera}
                            className="w-full sm:w-auto p-2 border rounded-lg bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow-sm hover:shadow-md transition-shadow duration-200"
                            style={{ border: '1px solid var(--color-secondary)' }}
                          >
                            {imagePreview ? 'Retake Image' : 'Capture Image'}
                          </button>
                          {imagePreview && (
                            <div className="mt-2 sm:mt-0">
                              <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border shadow-sm" />
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full sm:w-auto p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow-sm hover:shadow-md transition-shadow duration-200"
                        style={{
                          border: '1px solid var(--color-secondary)',
                          background: 'var(--color-bg)',
                          color: 'var(--color-text)'
                        }}
                        required={formData.status === 'Found'}
                      />
                      {imagePreview && (
                        <div className="mt-2 sm:mt-0">
                          <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border shadow-sm" />
                        </div>
                      )}
                    </>
                  )}
                </div>
                <p className="mt-2 text-sm" style={{ color: 'var(--color-text)' }}>
                  {formData.status === 'Found'
                    ? 'Required: please capture an image for verification.'
                    : 'Optional: upload image if available.'}
                </p>
                {formData.status === 'Found' && (
                  <p className={`mt-1 text-sm ${image ? 'text-green-600' : 'text-red-600'}`}>
                    {image ? '✅ Image captured successfully.' : '❌ Image is required.'}
                  </p>
                )}
                {formData.status === 'Lost' && image && (
                  <p className="mt-1 text-sm text-green-600">
                    ✅ Image uploaded successfully.
                  </p>
                )}
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className={`w-full py-3 px-4 rounded-lg text-white text-base font-medium transition-colors duration-200 flex items-center justify-center shadow-md hover:shadow-lg ${loading || !isFormValid() ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                style={{ backgroundColor: loading || !isFormValid() ? '' : 'var(--color-primary)' }}
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemCreate;