import React from 'react';
import { Plan } from '../types';

interface PlanViewProps {
    currentPlan: Plan;
    setCurrentPlan: (plan: Plan) => void;
}

const plans = {
    free: {
        name: 'Free',
        price: '$0',
        features: ['Up to 3 projects', '480p video exports', '1 Font Style', 'Basic Fade Animation', 'Community support'],
        cta: 'Your Current Plan',
        style: 'border-gray-500'
    },
    pro: {
        name: 'Pro',
        price: '$15',
        features: ['Unlimited projects', '1080p video exports', '5+ Premium Fonts', 'Advanced Animations (Slide, Zoom)', 'Cross-Fade Transitions', 'Custom Colors & Text Stroke', 'Email support'],
        cta: 'Upgrade to Pro',
        style: 'border-indigo-500'
    },
    studio: {
        name: 'Studio',
        price: '$40',
        features: ['Everything in Pro', 'AI Background Generation', 'Exclusive Animations (Karaoke, Typewriter)', 'Collaborative tools', 'Dedicated support'],
        cta: 'Upgrade to Studio',
        style: 'border-violet-500'
    }
};

const PlanCard: React.FC<{
    plan: 'free' | 'pro' | 'studio';
    isCurrent: boolean;
    onSelect: () => void;
}> = ({ plan, isCurrent, onSelect }) => {
    const { name, price, features, cta, style } = plans[plan];
    return (
        <div className={`dark:bg-gray-800/50 bg-white/50 rounded-lg p-6 flex flex-col border-2 ${isCurrent ? style : 'dark:border-gray-700 border-gray-200'} shadow-lg transform hover:scale-105 transition-transform`}>
            <h3 className={`text-2xl font-bold ${isCurrent ? (plan === 'pro' ? 'text-indigo-400' : 'text-violet-400') : ''}`}>{name}</h3>
            <p className="text-4xl font-extrabold my-4">{price}<span className="text-base font-normal dark:text-gray-400 text-gray-500">/month</span></p>
            <ul className="space-y-3 flex-grow mb-6">
                {features.map(feature => (
                    <li key={feature} className="flex items-center">
                        <CheckIcon />
                        <span className="ml-3 dark:text-gray-300 text-gray-700">{feature}</span>
                    </li>
                ))}
            </ul>
             <button
                onClick={onSelect}
                disabled={isCurrent}
                className={`w-full font-bold py-3 px-4 rounded-md transition duration-300 ${isCurrent ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
            >
                {isCurrent ? 'Your Current Plan' : cta}
            </button>
        </div>
    );
};

const PlanView: React.FC<PlanViewProps> = ({ currentPlan, setCurrentPlan }) => {
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">Choose Your Plan</h1>
                <p className="text-lg dark:text-gray-400 text-gray-600 max-w-2xl mx-auto">Unlock more features and take your lyric videos to the next level.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <PlanCard plan="free" isCurrent={currentPlan === 'free'} onSelect={() => setCurrentPlan('free')} />
                <PlanCard plan="pro" isCurrent={currentPlan === 'pro'} onSelect={() => setCurrentPlan('pro')} />
                <PlanCard plan="studio" isCurrent={currentPlan === 'studio'} onSelect={() => setCurrentPlan('studio')} />
            </div>
        </div>
    );
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


export default PlanView;