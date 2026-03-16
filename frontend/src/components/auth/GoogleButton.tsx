import googleLogo from '../../assets/google.png';

export function GoogleButton() {
  return (
    <button
      type="button"
      className="google-auth-btn"
      onClick={() => {
        // заглушка
      }}
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
