import React, { useState, useRef, ChangeEvent } from 'react';
import { User } from '../types';

interface ProfileViewProps {
    user: User;
    setUser: (user: User) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, setUser }) => {
    const [formData, setFormData] = useState<User>(user);
    const [isEditing, setIsEditing] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, avatar: reader.result as string });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setUser(formData);
        setIsEditing(false);
        alert("Profile updated successfully!");
    };


    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">My Profile</h1>
            
            <div className="dark:bg-gray-800/50 bg-white/50 p-8 rounded-lg shadow-lg border dark:border-gray-700/50 border-gray-200/50">
                <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center md:border-r dark:border-gray-700 border-gray-200 md:pr-8">
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="User Avatar" className="w-32 h-32 rounded-full object-cover mb-4" />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-indigo-500 flex items-center justify-center mb-4 font-bold text-5xl text-white">
                                {formData.name.charAt(0)}
                            </div>
                        )}
                         <button
                            type="button"
                            onClick={() => isEditing && avatarInputRef.current?.click()}
                            disabled={!isEditing}
                            className="text-sm text-indigo-500 dark:text-indigo-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                            Change Avatar
                        </button>
                        <input
                            type="file"
                            ref={avatarInputRef}
                            onChange={handleAvatarChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    
                    <div className="md:col-span-2 space-y-6">
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium dark:text-gray-300 text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="mt-1 block w-full dark:bg-gray-900 bg-white border dark:border-gray-600 border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-70"
                            />
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium dark:text-gray-300 text-gray-700">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="mt-1 block w-full dark:bg-gray-900 bg-white border dark:border-gray-600 border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-70"
                            />
                        </div>
                         <div className="flex justify-end space-x-4 mt-6">
                            {isEditing ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => { setFormData(user); setIsEditing(false); }}
                                        className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium dark:text-gray-200 text-gray-700 dark:bg-gray-600 bg-white hover:dark:bg-gray-500 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ProfileView;