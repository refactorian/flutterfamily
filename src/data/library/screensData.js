export const TAGS_SCREENS = {
    auth: { label: 'Auth & Onboarding', color: '#0175C2' },
    profile: { label: 'Profile & Settings', color: '#8b5cf6' },
    dashboard: { label: 'Dashboards', color: '#10b981' },
};

export const SCREENS_DATA = [
    {
        id: 'login-screen',
        title: 'Modern Login & OTP Screen',
        description: 'Clean authentication UI featuring floating inputs, phone OTP, and social buttons.',
        tags: ['auth'],
        image: 'https://placehold.co/600x350/0D1525/3B9EFF?text=Login+Screen',
        docUrl: '/library/screens/login-screen',
    },
    {
        id: 'user-profile-screen',
        title: 'User Profile & Settings',
        description: 'Profile layout with editable avatar, toggle switches, and stats counter.',
        tags: ['profile'],
        image: 'https://placehold.co/600x350/0D1525/8b5cf6?text=Profile+Screen',
        docUrl: '/library/screens/login-screen',
    },
];