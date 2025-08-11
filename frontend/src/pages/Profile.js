import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { updateProfile, clearError } from '../store/slices/authSlice';
import { User, Mail, Calendar, MapPin, Edit, Save, X } from 'lucide-react';
import { fetchTrips } from '../store/slices/tripSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, profileLoading, profileError } = useSelector((state) => state.auth);
  const { trips, loading: tripsLoading } = useSelector((state) => state.trips);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(updateProfile(data)).unwrap();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    dispatch(clearError());
  };

  useEffect(() => {
    // Load trips for profile listings if not present
    if (!trips || trips.length === 0) {
      dispatch(fetchTrips({ limit: 50 }));
    }
  }, [dispatch]);

  const { preplannedTrips, previousTrips } = useMemo(() => {
    const list = Array.isArray(trips) ? trips : [];
    const preplanned = list.filter((t) => t.status === 'planning' || t.status === 'active');
    const previous = list.filter((t) => t.status === 'completed');
    return { preplannedTrips: preplanned, previousTrips: previous };
  }, [trips]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 py-6">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    {...register('location')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="City, Country"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              {profileError && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{profileError}</div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={user?.avatarUrl || 'https://i.pravatar.cc/120?img=12'}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border border-white shadow"/>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>

                {user.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-gray-900">{user.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Member since</p>
                    <p className="text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {user.bio && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">About</h3>
                  <p className="text-gray-600">{user.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Trip lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preplanned Trips */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Preplanned Trips</h3>
          </div>
          <div className="card-body">
            {tripsLoading ? (
              <div className="grid grid-cols-1 gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 rounded-lg bg-gray-100 animate-pulse"/>
                ))}
              </div>
            ) : preplannedTrips.length === 0 ? (
              <p className="text-gray-600">No preplanned trips yet.</p>
            ) : (
              <div className="space-y-4">
                 {preplannedTrips.map((t) => (
                  <div key={t._id} className="border border-gray-200 rounded-xl p-4 bg-white/80">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-base font-semibold text-gray-900">{t.name}</div>
                        <div className="mt-1 text-sm text-gray-600 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <a href={`/trips/${t._id}`} className="btn-secondary btn-sm">View</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Previous Trips */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Previous Trips</h3>
          </div>
          <div className="card-body">
            {tripsLoading ? (
              <div className="grid grid-cols-1 gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 rounded-lg bg-gray-100 animate-pulse"/>
                ))}
              </div>
            ) : previousTrips.length === 0 ? (
              <p className="text-gray-600">No previous trips.</p>
            ) : (
              <div className="space-y-4">
                 {previousTrips.map((t) => (
                  <div key={t._id} className="border border-gray-200 rounded-xl p-4 bg-white/80">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-base font-semibold text-gray-900">{t.name}</div>
                        <div className="mt-1 text-sm text-gray-600 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <a href={`/trips/${t._id}`} className="btn-secondary btn-sm">View</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 