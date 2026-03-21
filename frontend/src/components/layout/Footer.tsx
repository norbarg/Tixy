import footerLogo from '../../assets/logo-white.png';
import footerBarcode from '../../assets/barcode.png';
import './footer.css';

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer__inner">
                <img src={footerLogo} alt="Tixy" className="footer__logo" />
                <div className="footer__top">
                    <div className="footer__left">
                        <div className="footer__description">
                            <p>
                                Tixy is an online service for purchasing tickets
                                to the most exciting events.
                            </p>

                            <p>
                                Its user-friendly interface, fast payments, and
                                one-click e-tickets make it easy to find and
                                attend your favorite events.
                            </p>
                        </div>
                    </div>

                    <div className="footer__nav">
                        <div className="footer__column">
                            <h3 className="footer__column-title">Account</h3>

                            <button type="button" className="footer__link">
                                Set Up Account
                            </button>
                            <button type="button" className="footer__link">
                                My tickets
                            </button>
                            <button type="button" className="footer__link">
                                Notifications
                            </button>
                            <button type="button" className="footer__link">
                                Create Event
                            </button>
                            <button type="button" className="footer__link">
                                My Events
                            </button>
                        </div>

                        <div className="footer__column">
                            <h3 className="footer__column-title">Tixy</h3>

                            <button type="button" className="footer__link">
                                About Us
                            </button>
                            <button type="button" className="footer__link">
                                Press
                            </button>
                            <button type="button" className="footer__link">
                                Contact Us
                            </button>
                            <button type="button" className="footer__link">
                                How it Works
                            </button>
                        </div>

                        <div className="footer__column">
                            <h3 className="footer__column-title">More</h3>

                            <button type="button" className="footer__link">
                                Refund policy
                            </button>
                            <button type="button" className="footer__link">
                                Privacy policy
                            </button>
                            <button type="button" className="footer__link">
                                Terms policy
                            </button>
                            <button type="button" className="footer__link">
                                Help Center
                            </button>
                        </div>
                    </div>
                </div>

                <div className="footer__divider" />

                <div className="footer__bottom">
                    <div className="footer__copyright">Copyright © 2026</div>

                    <img
                        src={footerBarcode}
                        alt="Tixy barcode"
                        className="footer__barcode"
                    />
                </div>
            </div>
        </footer>
    );
}
