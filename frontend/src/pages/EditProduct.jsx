import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, useWatch } from 'react-hook-form';
import { updateProduct, getProductDetails, reset } from '../features/products/productSlice';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';
import { UploadCloud, X, Loader2, IndianRupee, ArrowLeft, Eye, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Hostel Essentials', 'Cycles', 'Sports', 'Lab Equipment', 'Stationery'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [keepingOldImages, setKeepingOldImages] = useState(true);

  const { register, handleSubmit, control, formState: { errors }, reset: resetForm } = useForm({
    defaultValues: {
      title: '',
      price: '',
      category: '',
      condition: '',
      hostelNumber: '',
      contactNumber: '',
      description: ''
    }
  });

  const formValues = useWatch({ control });

  const { singleProduct, isLoading, isError, isUpdateSuccess, message } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(getProductDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (singleProduct) {
      resetForm({
        title: singleProduct.title,
        description: singleProduct.description,
        price: singleProduct.price,
        category: singleProduct.category,
        condition: singleProduct.condition,
        hostelNumber: singleProduct.hostelNumber,
        contactNumber: singleProduct.contactNumber || ''
      });
      
      if (singleProduct.images && singleProduct.images.length > 0) {
        setImagePreviews(singleProduct.images);
      }
    }
  }, [singleProduct, resetForm]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isUpdateSuccess) {
      toast.success('Product updated successfully!');
      dispatch(reset());
      navigate(`/products/${id}`);
    }

    return () => {
      if (isUpdateSuccess || isError) {
        dispatch(reset());
      }
    };
  }, [isError, isUpdateSuccess, message, navigate, dispatch, id]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 3) {
      toast.error('You can only upload a maximum of 3 images.');
      return;
    }

    setKeepingOldImages(false); 
    setImages(files);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (indexToRemove) => {
    if (keepingOldImages) {
      toast.error('Please upload a new set of images to replace the old ones entirely.');
      return;
    }

    setImages(images.filter((_, index) => index !== indexToRemove));
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    setImagePreviews(imagePreviews.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('category', data.category);
    formData.append('condition', data.condition);
    formData.append('hostelNumber', data.hostelNumber);
    if (data.contactNumber) {
      formData.append('contactNumber', data.contactNumber);
    }
    
    if (!keepingOldImages) {
      if (images.length === 0) {
        toast.error('Please upload at least one image if replacing existing ones.');
        return;
      }
      images.forEach(image => {
        formData.append('images', image);
      });
    }

    dispatch(updateProduct({ id, formData }));
  };

  if (isLoading && !singleProduct) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-brand-600" />
          <p className="text-slate-500 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <Navbar />
      
      <div className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 flex items-center gap-4">
          <div className="bg-brand-600/30 p-3 rounded-2xl backdrop-blur-md">
            <Edit3 className="h-8 w-8 text-brand-100" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Edit Listing</h1>
            <p className="text-slate-400 mt-1">Update your marketplace listing details.</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6 relative z-20">
        <Link to={`/products/${id}`} className="inline-flex items-center text-sm font-semibold text-white/80 hover:text-white mb-6 absolute top-0 -translate-y-12 transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Cancel Edit
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Form */}
          <div className="w-full lg:w-7/12">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-8 sm:p-10">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Product Images */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Product Images (Max 3)
                    </label>
                    
                    {imagePreviews.length > 0 && (
                      <div className="flex gap-4 mb-4 overflow-x-auto py-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative h-32 w-32 flex-shrink-0 rounded-2xl overflow-hidden border border-slate-200 group shadow-sm">
                            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                            {!keepingOldImages && (
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-slate-300 border-dashed rounded-3xl hover:border-brand-500 hover:bg-brand-50/50 transition-all cursor-pointer relative group">
                      <div className="space-y-2 text-center">
                        <div className="bg-slate-100 p-3 rounded-full inline-block group-hover:bg-brand-100 transition-colors">
                          <UploadCloud className="h-8 w-8 text-slate-400 group-hover:text-brand-500" />
                        </div>
                        <div className="flex text-sm text-slate-600 justify-center font-medium">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-bold text-brand-600 hover:text-brand-500 focus-within:outline-none"
                          >
                            <span>Replace existing images</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              multiple
                              accept="image/jpeg, image/png, image/webp"
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-8" />

                  {/* Title & Price Row */}
                  <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2">
                        Listing Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Minimum 3 characters' } })}
                        className={`block w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${errors.title ? 'border-red-300' : 'border-slate-200'}`}
                      />
                      {errors.title && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.title.message}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="price" className="block text-sm font-bold text-slate-700 mb-2">
                        Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <IndianRupee className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="number"
                          id="price"
                          min="0"
                          {...register('price', { required: 'Price is required', min: 0 })}
                          className={`block w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${errors.price ? 'border-red-300' : 'border-slate-200'}`}
                        />
                      </div>
                      {errors.price && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.price.message}</p>}
                    </div>
                  </div>

                  {/* Category, Condition & Hostel Row */}
                  <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="category" className="block text-sm font-bold text-slate-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="category"
                        {...register('category', { required: 'Please select a category' })}
                        className={`block w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${errors.category ? 'border-red-300' : 'border-slate-200'}`}
                      >
                        <option value="">Select a category</option>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      {errors.category && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.category.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="condition" className="block text-sm font-bold text-slate-700 mb-2">
                        Condition <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="condition"
                        {...register('condition', { required: 'Please select condition' })}
                        className={`block w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${errors.condition ? 'border-red-300' : 'border-slate-200'}`}
                      >
                        <option value="">Select condition</option>
                        {CONDITIONS.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                      </select>
                      {errors.condition && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.condition.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="hostelNumber" className="block text-sm font-bold text-slate-700 mb-2">
                        Hostel / Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="hostelNumber"
                        {...register('hostelNumber', { required: 'Hostel number is required' })}
                        className={`block w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${errors.hostelNumber ? 'border-red-300' : 'border-slate-200'}`}
                      />
                      {errors.hostelNumber && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.hostelNumber.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="contactNumber" className="block text-sm font-bold text-slate-700 mb-2">
                        Contact Number <span className="text-slate-400 font-normal text-xs ml-1">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        id="contactNumber"
                        {...register('contactNumber', { 
                          pattern: {
                            value: /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/,
                            message: 'Please enter a valid Indian phone number'
                          }
                        })}
                        className={`block w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${errors.contactNumber ? 'border-red-300' : 'border-slate-200'}`}
                      />
                      {errors.contactNumber && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.contactNumber.message}</p>}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      rows={5}
                      {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'Please provide more details' } })}
                      className={`block w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${errors.description ? 'border-red-300' : 'border-slate-200'}`}
                    />
                    {errors.description && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.description.message}</p>}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-brand-200 text-base font-bold text-white bg-slate-900 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          Saving Changes...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column: Live Preview (Sticky) */}
          <div className="w-full lg:w-5/12">
            <div className="sticky top-28">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-slate-400" />
                Live Preview
              </h2>
              
              <div className="bg-white rounded-3xl shadow-[0_2px_20px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden flex flex-col pointer-events-none">
                <div className="relative h-64 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  {imagePreviews.length > 0 ? (
                    <img 
                      src={imagePreviews[0]} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UploadCloud className="h-12 w-12 text-slate-300" />
                  )}
                  
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {formValues.condition && (
                      <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                        {formValues.condition}
                      </span>
                    )}
                    {formValues.category && (
                      <span className="bg-brand-600/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm capitalize">
                        {formValues.category}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-bold text-slate-900 text-xl leading-tight line-clamp-2 break-words flex-1">
                      {formValues.title || 'Your Listing Title'}
                    </h3>
                    <span className="flex items-center font-black text-brand-600 text-xl flex-shrink-0">
                      <IndianRupee className="h-5 w-5 mr-0.5 stroke-[3]" />
                      {formValues.price || '0'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-500 mb-6 flex-1">
                    NITS Marketplace
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                      <Eye className="h-4 w-4" />
                      <span className="font-medium">{singleProduct?.views || 0} views</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
                      Preview Mode
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default EditProduct;
