import { useEffect, useMemo, useState } from 'react';
import { companyNewsApi } from '../../api/company-news.api';
import arrowIcon from '../../assets/auth/arrow.png';
import './create-news-modal.css';

type CreateNewsModalProps = {
    isOpen: boolean;
    companyId: string | null;
    onClose: () => void;
    onCreated?: () => void;
};

const TITLE_LIMIT = 50;
const DESCRIPTION_LIMIT = 50;

function countWords(value: string) {
    return value.trim().split(/\s+/).filter(Boolean).length;
}

export function CreateNewsModal({
    isOpen,
    companyId,
    onClose,
    onCreated,
}: CreateNewsModalProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setContent('');
            setError('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const titleWords = useMemo(() => countWords(title), [title]);
    const contentWords = useMemo(() => countWords(content), [content]);

    const isTitleTooLong = titleWords > TITLE_LIMIT;
    const isContentTooLong = contentWords > DESCRIPTION_LIMIT;

    const isDisabled =
        !companyId ||
        !title.trim() ||
        !content.trim() ||
        isTitleTooLong ||
        isContentTooLong ||
        isSubmitting;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!companyId) {
            setError('Company not found.');
            return;
        }

        if (!title.trim() || !content.trim()) {
            setError('Please fill in all fields.');
            return;
        }

        if (isTitleTooLong || isContentTooLong) {
            setError('Title and description must be no more than 10 words.');
            return;
        }

        try {
            setError('');
            setIsSubmitting(true);

            await companyNewsApi.create({
                companyId,
                title: title.trim(),
                content: content.trim(),
            });

            onCreated?.();
            onClose();
        } catch (error) {
            console.error('Failed to create news:', error);
            setError('Failed to create news.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;
    return (
    <div
        className="create-news-popover"
        onClick={(event) => event.stopPropagation()}
    >
        <form className="create-news-form" onSubmit={handleSubmit}>
            <div className="create-news-form__field">
                <label className="create-news-form__label">TITLE</label>
                <input
                    type="text"
                    className="create-news-form__input"
                    placeholder="Add Title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />
                <span className="create-news-form__counter">
                    {titleWords}/{TITLE_LIMIT}
                </span>
            </div>

            <div className="create-news-form__field">
                <label className="create-news-form__label">
                    DESCRIPTION
                </label>
                <textarea
                    className="create-news-form__textarea"
                    placeholder="Add Description"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                />
                <span className="create-news-form__counter">
                    {contentWords}/{DESCRIPTION_LIMIT}
                </span>
            </div>

            {error ? (
                <p className="create-news-form__error">{error}</p>
            ) : null}

            <div className="create-news-form__actions">
                <button
                    type="submit"
                    className="create-news-form__submit"
                    disabled={isDisabled}
                >
                    <span>{isSubmitting ? 'Creating...' : 'Create'}</span>
                    <img
                        src={arrowIcon}
                        alt=""
                        className="create-news-form__submit-icon"
                    />
                </button>
            </div>
        </form>
    </div>
);
}
