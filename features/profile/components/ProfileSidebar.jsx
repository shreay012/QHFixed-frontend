'use client';

import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslations } from 'next-intl';
import { updateUserProfile } from '@/lib/redux/slices/userProfileSlice/userProfileSlice';
import { getProfile } from '@/lib/redux/slices/authSlice/authSlice';

const ProfileSidebar = ({ activeSection, onSectionChange }) => {
  const { user } = useSelector((state) => state.auth);
  const t = useTranslations('profile');
  const fileInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [prevImagePath, setPrevImagePath] = useState(null);
  const dispatch = useDispatch();

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return 'U';
  };

  // Update profile image URL when user data changes - with strong cache busting
  useEffect(() => {
    if (user?.profileImage) {
      // If the image path changed, force refresh with new timestamp
      if (prevImagePath !== user.profileImage) {
        setPrevImagePath(user.profileImage);
        const timestamp = new Date().getTime();
        const imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.profileImage}?v=${timestamp}`;
        setProfileImageUrl(imageUrl);
      }
    } else {
      setProfileImageUrl(null);
      setPrevImagePath(null);
    }
  }, [user?.profileImage]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);

      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setProfileImageUrl(previewUrl);

      // Create FormData with the image and other profile data
      const formDataPayload = {
        id: user?._id || user?.id,
        email: user?.email,
        role: user?.role || 'user',
        name: `${user?.firstName} ${user?.lastName}`.trim(),
        mobile: user?.phone || user?.mobile,
        profileImage: file,
      };

      // Upload the image
      const uploadResult = await dispatch(updateUserProfile(formDataPayload));
      
      // Check if upload was successful
      if (uploadResult?.payload?.user?.profileImage) {
        // Fetch fresh profile data - this will trigger the useEffect above
        await dispatch(getProfile());
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // Reset to previous image on error
      if (user?.profileImage) {
        const timestamp = new Date().getTime();
        setProfileImageUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}${user.profileImage}?v=${timestamp}`);
      }
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };




  const handleAddImageClick = () => {
    fileInputRef.current?.click();
  };

  const menuItems = [
    { id: 'profile', label: t('title'), icon: '/UserCircle.svg' },
    { id: 'bookings', label: t('bookings'), icon: '/bookingp.svg' },
    { id: 'payments', label: t('payments'), icon: '/paymentp.svg' },
    { id: 'support', label: t('supportTickets'), icon: '/supportp.svg' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-full lg:w-[400px] bg-white rounded-2xl border border-gray-200 p-6 lg:p-4 h-fit">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-24 h-24 lg:w-28 lg:h-28 rounded-full flex items-center justify-center mb-4 overflow-hidden relative"
            style={{ backgroundColor: '#F2F9F1', border: '3px solid #45A735' }}
          >
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt="Profile"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            ) : (
              <span className="text-3xl lg:text-4xl font-bold text-black">
                {getInitials()}
              </span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            aria-label={t('uploadProfileImage')}
          />
          <button
            onClick={handleAddImageClick}
            disabled={isUploadingImage}
            className="flex items-center justify-center gap-2 border-2 border-[#45A735] text-[#45A735] px-4 py-2 rounded-[8px] font-opensauce disabled:opacity-50 cursor-pointer"
          >
            <Image src="/PencilSimple.svg" alt="Add" width={24} height={24} loading="lazy" />
            <span className="text-[#45A735] font-[500] text-[14px]">
              {isUploadingImage ? t('uploading') : profileImageUrl ? t('editImage') : t('addImage')}
            </span>
          </button>
        </div>

        {/* Booking Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* On-Going Booking */}
          <div className="border border-gray-300 bg-white rounded-xl p-4 text-left">
            <p className="font-[600] text-[12px] mb-2" style={{ color: '#000000' }}>{t('ongoingBooking')}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{user?.ongoingJobs || 0}</span>
              <div className="w-8 h-8 bg-[#45A735] rounded-lg flex items-center justify-center">
                <Image src="/goingBooking.svg" alt="Booking" width={18} height={18} loading="lazy" />
              </div>
            </div>
          </div>

          {/* Completed Bookings */}
          <div className="border border-gray-300 bg-white rounded-xl p-4 text-left">
            <p className="font-[600] text-[12px] mb-2" style={{ color: '#000000' }}>{t('completedBookings')}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{user?.completedJobs || 0}</span>
              <div className="w-8 h-8 bg-[#45A735] rounded-lg flex items-center justify-center">
                <Image src="/Booking.svg" alt="Booking" width={18} height={18} loading="lazy" />
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items - Desktop */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full text-left rounded-xl p-4 flex items-center justify-between font-semibold font-opensauce transition-colors ${activeSection === item.id
                  ? 'bg-[#45A735] text-white'
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={activeSection === item.id ? 'filter brightness-0 invert' : ''}>
                  <Image src={item.icon} alt={item.label} width={24} height={24} loading="lazy" />
                </div>
                <span className="font-[500] text-[14px]">{item.label}</span>
              </div>
              {activeSection === item.id && (
                <Image src="/ArrowCircleRight.svg" alt="arrow" width={30} height={30} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile View */}
      {/* <div className="lg:hidden w-full">
      
        <div className="flex flex-col items-center mb-6 bg-white rounded-2xl p-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: '#D4F3D6', border: '3px solid #45A735' }}
          >
            <span className="text-3xl font-bold text-black">
              {getInitials()}
            </span>
          </div>
          <button className="flex items-center justify-center gap-2 border-2 border-[#45A735] text-[#45A735] px-4 py-2 rounded-[8px] hover:bg-[#45A735] hover:text-white transition-colors duration-200 font-opensauce">
            <Image src="/PencilSimple.svg" alt="Add" width={16} height={16} loading="lazy" />
            <span className="text-[#45A735] font-[500] text-[14px]">Add Image</span>
          </button>
        </div>

      
        <div className="grid grid-cols-2 gap-4 mb-6">
        
          <div className="border border-gray-300 bg-white rounded-xl p-4 text-left">
            <p className="font-[600] text-[12px] mb-2" style={{ color: '#000000' }}>On - Going Booking</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{user?.ongoingJobs || 0}</span>
              <div className="w-8 h-8 bg-[#45A735] rounded-lg flex items-center justify-center">
                <Image src="/Booking.svg" alt="Booking" width={16} height={16} />
              </div>
            </div>
          </div>

         
          <div className="border border-gray-300 bg-white rounded-xl p-4 text-left">
            <p className="font-[600] text-[12px] mb-2" style={{ color: '#000000' }}>{t('completedBookings')}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{user?.completedJobs || 0}</span>
              <div className="w-8 h-8 bg-[#45A735] rounded-lg flex items-center justify-center">
                <Image src="/Booking.svg" alt="Booking" width={16} height={16} />
              </div>
            </div>
          </div>
        </div>

       
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {menuItems.map((item) => (
              <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold font-opensauce whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeSection === item.id
                  ? 'bg-[#45A735] text-white'
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >              <div className={activeSection === item.id ? 'filter brightness-0 invert' : ''}>
                <Image src={item.icon} alt={item.label} width={24} height={24} />
              </div>              <span className="font-[500] text-[14px]">{item.label}</span>
            </button>
          ))}
        </div>
      </div> */}

      <div className="lg:hidden w-full">
        {/* Mobile Avatar Section */}
        <div className="flex flex-col items-center mb-6 bg-white rounded-2xl p-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-4 overflow-hidden relative"
            style={{ backgroundColor: '#D4F3D6', border: '3px solid #45A735' }}
          >
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt="Profile"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            ) : (
              <span className="text-3xl font-bold text-black">
                {getInitials()}
              </span>
            )}
          </div>
          <button
            onClick={handleAddImageClick}
            disabled={isUploadingImage}
            className="flex items-center justify-center gap-2 border-2 border-[#45A735] text-[#45A735] px-4 py-2 rounded-[8px] font-opensauce disabled:opacity-50 cursor-pointer"
          >
            <Image src="/PencilSimple.svg" alt="Add" width={16} height={16} loading="lazy" />
            <span className="text-[#45A735] font-[500] text-[14px]">
              {isUploadingImage ? t('uploading') : profileImageUrl ? t('editImage') : t('addImage')}
            </span>
          </button>
        </div>

        {/* Mobile Booking Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* On-Going Booking */}
          <div className="border border-gray-300 bg-white rounded-xl p-4 text-left">
            <p className="font-[600] text-[12px] mb-2" style={{ color: '#000000' }}>{t('ongoingBooking')}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{user?.ongoingJobs || 0}</span>
              <div className="w-8 h-8 bg-[#45A735] rounded-lg flex items-center justify-center">
                <Image src="/Booking.svg" alt="Booking" width={16} height={16} />
              </div>
            </div>
          </div>

          {/* Completed Bookings */}
          <div className="border border-gray-300 bg-white rounded-xl p-4 text-left">
            <p className="font-[600] text-[12px] mb-2" style={{ color: '#000000' }}>{t('completedBookings')}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{user?.completedJobs || 0}</span>
              <div className="w-8 h-8 bg-[#45A735] rounded-lg flex items-center justify-center">
                <Image src="/Booking.svg" alt="Booking" width={16} height={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Horizontal Carousel/Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold font-opensauce whitespace-nowrap transition-colors flex items-center gap-2 ${activeSection === item.id
                  ? 'bg-[#45A735] text-white'
                  : 'bg-white border border-[#45A735] text-[#45A735]'
                }`}
            >
              <div
                className={`${activeSection === item.id
                    ? 'filter brightness-0 invert'
                    : 'filter'
                  }`}
                style={
                  activeSection !== item.id
                    ? {
                      filter:
                        'invert(48%) sepia(79%) saturate(420%) hue-rotate(75deg) brightness(90%) contrast(90%)',
                    }
                    : {}
                }
              >
                <Image src={item.icon} alt={item.label} width={24} height={24} />
              </div>
              <span className="font-[500] text-[14px]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProfileSidebar;
