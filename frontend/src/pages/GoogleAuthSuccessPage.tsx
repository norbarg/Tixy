import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function GoogleAuthSuccessPage() {
    const { completeGoogleAuth } = useAuth();

    useEffect(() => {
        const run = async () => {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get('accessToken');
            const refreshToken = params.get('refreshToken');

            if (!accessToken || !refreshToken) {
                window.location.href = '/';
                return;
            }

            try {
                await completeGoogleAuth({ accessToken, refreshToken });
            } catch (error) {
                console.error('Google auth failed', error);
            } finally {
                window.history.replaceState({}, document.title, '/');
                window.location.href = '/';
            }
        };

        run();
    }, [completeGoogleAuth]);

    return <div>Signing in with Google...</div>;
}
