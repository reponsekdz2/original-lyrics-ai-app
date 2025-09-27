import React from 'react';
import { AppSettings, VideoQuality } from '../types';
import { VIDEO_QUALITIES } from '../constants';

interface SettingsViewProps {
    settings: AppSettings;
    setSettings: (settings: AppSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings }) => {
    
    const handleThemeChange = (theme: 'dark' | 'light') => {
        setSettings({ ...settings, theme });
    };

    const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSettings({ ...settings, defaultQuality: e.target.value as VideoQuality });
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">Settings</h1>

            <div className="space-y-8">
                {/* Theme Settings */}
                <div className="dark:bg-gray-800/50 bg-white/50 p-6 rounded-lg shadow-lg border dark:border-gray-700/50 border-gray-200/50">
                    <h2 className="text-xl font-semibold mb-4">Appearance</h2>
                    <p className="dark:text-gray-400 text-gray-600 mb-1">Theme</p>
                    <div className="flex space-x-2 rounded-lg dark:bg-gray-900/50 bg-gray-200/50 p-1">
                        <button
                            onClick={() => handleThemeChange('light')}
                            className={`w-full p-2 rounded-md font-semibold transition-colors ${settings.theme === 'light' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'}`}
                        >
                            Light
                        </button>
                        <button
                            onClick={() => handleThemeChange('dark')}
                            className={`w-full p-2 rounded-md font-semibold transition-colors ${settings.theme === 'dark' ? 'bg-gray-700 text-white shadow' : 'text-gray-500'}`}
                        >
                            Dark
                        </button>
                    </div>
                </div>

                {/* Export Settings */}
                <div className="dark:bg-gray-800/50 bg-white/50 p-6 rounded-lg shadow-lg border dark:border-gray-700/50 border-gray-200/50">
                    <h2 className="text-xl font-semibold mb-4">Export</h2>
                     <div>
                        <label htmlFor="defaultQuality" className="block text-sm font-medium dark:text-gray-300 text-gray-700">Default Export Quality</label>
                        <select
                            id="defaultQuality"
                            value={settings.defaultQuality}
                            onChange={handleQualityChange}
                            className="mt-1 block w-full dark:bg-gray-900 bg-white border dark:border-gray-600 border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            {Object.entries(VIDEO_QUALITIES).map(([key, { name }]) => (
                                <option key={key} value={key}>{name}</option>
                            ))}
                        </select>
                        <p className="mt-2 text-xs dark:text-gray-400 text-gray-500">This will be the default selection in the editor's export panel.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;