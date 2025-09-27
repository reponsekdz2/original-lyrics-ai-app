// Fix: Create PlanView component placeholder.
import React from 'react';

const PlanView: React.FC = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold">Subscription Plan</h1>
            <p className="mt-4 text-gray-400">This feature is coming soon!</p>
        </div>
    );
};

export default PlanView;
