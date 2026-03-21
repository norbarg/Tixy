import googleLogo from '../../assets/auth/google.png';

export function GoogleButton() {
    const handleGoogleAuth = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    };

    return (
        <button
            type="button"
            className="google-auth-btn"
            onClick={handleGoogleAuth}
        >
            <img
                src={googleLogo}
                alt="Google"
                className="google-auth-btn__icon-image"
            />
            <span>Continue with Google</span>
        </button>
    );
}
