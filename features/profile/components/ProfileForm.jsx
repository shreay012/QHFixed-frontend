'use client';
import { showError, showSuccess } from '@/lib/utils/toast';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslations } from 'next-intl';
import { getProfile } from '../../../lib/redux/slices/authSlice/authSlice';
import { updateUserProfile } from '../../../lib/redux/slices/userProfileSlice/userProfileSlice';

// Skeleton Loader Component
const FormSkeleton = () => (
  <div className="w-full lg:flex-1">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between mb-6 lg:mb-8">
      <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
    </div>

    {/* Card Skeleton */}
    <div className="bg-white rounded-2xl p-6 lg:p-8">
      <div className="space-y-6 animate-pulse">
        {/* First Name & Last Name Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Email & Phone Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProfileForm = () => {
  const dispatch = useDispatch();
  const t = useTranslations('profile');
  const { user, isLoading } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Fetch profile data on component mount if user data is not available
  useEffect(() => {
    // if (!user?.firstName || !user?.email) {
      dispatch(getProfile());
    // }
  }, [dispatch]);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Transform formData to match API payload format
      const payload = {
        id: user?._id || user?.id,
        email: formData.email,
        role: user?.role || 'user',
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        mobile: formData.phone,
      };
      
      const result = await dispatch(updateUserProfile(payload));
      
      if (result.type === 'userProfile/updateUserProfile/fulfilled') {
        setIsEditing(false);
      } else if (result.type === 'userProfile/updateUserProfile/rejected') {
        showError(result.payload || t('errorUpdate'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError(t('errorUpdate'));
    } finally {
      setIsSaving(false);
    }
  };

  // Show skeleton while loading
  if (isLoading || !formData.firstName) {
    return <FormSkeleton />;
  }

  return (
    <div className={`w-full lg:flex-1`}>
      {/* Header - Outside card */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <h1 className="font-[700] text-[18px] sm:text-[20px] lg:text-[24px]" style={{ color: '#202224' }}>{t('title')}</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 text-[#45A735] hover:text-[#3d9230] transition-colors font-semibold font-opensauce"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t('edit')}
          </button>
        )}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl">
        {/* Form */}
        <form className="space-y-6">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              {t('firstName')}
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-opensauce text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#45A735] transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              {t('lastName')}
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-opensauce text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#45A735] transition-all"
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              {t('emailId')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-opensauce text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#45A735] transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              {t('phoneNumber')}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={true}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-opensauce text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#45A735] transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors font-opensauce"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 bg-[#45A735] text-white font-semibold py-3 rounded-lg hover:bg-[#3d9230] transition-colors font-opensauce disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? t('saving') : t('saveChanges')}
            </button>
          </div>
        )}
      </form>
      </div>
    </div>
  );
};

export default ProfileForm;
