// CreateCompanyPage.tsx
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { companiesApi } from '../api/companies.api';
import { api } from '../api/axios';
import uploadIcon from '../assets/company/upload-avatar-icon.png';
import './create-company.css';
import arrowRight from '../assets/auth/arrow.png';
import { searchPlaces, type PlaceSuggestion } from '../lib/photon';

type CreateCompanyForm = {
    name: string;
    description: string;
    placeAddress: string;
    email: string;
    avatarUrl: string;
    placeLat: string;
    placeLng: string;
    googlePlaceId: string;
    googleMapsUrl: string;
};

export function CreateCompanyPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [form, setForm] = useState<CreateCompanyForm>({
        name: '',
        description: '',
        placeAddress: '',
        email: '',
        avatarUrl: '',
        placeLat: '',
        placeLng: '',
        googlePlaceId: '',
        googleMapsUrl: '',
    });

    const [previewUrl, setPreviewUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    const [error, setError] = useState('');

    const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>(
        [],
    );
    const [isPlaceOpen, setIsPlaceOpen] = useState(false);
    const [isPlaceLoading, setIsPlaceLoading] = useState(false);

    const placeRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!error) return;

        const timer = setTimeout(() => {
            setError('');
        }, 3000);

        return () => clearTimeout(timer);
    }, [error]);

    useEffect(() => {
        const trimmed = form.placeAddress.trim();

        if (!trimmed) {
            setPlaceSuggestions([]);
            setIsPlaceOpen(false);
            return;
        }

        const timeoutId = window.setTimeout(async () => {
            try {
                setIsPlaceLoading(true);

                const suggestions = await searchPlaces(trimmed, {
                    limit: 6,
                    onlyUSA: true,
                });

                setPlaceSuggestions(suggestions);
                setIsPlaceOpen(true);
            } catch (error) {
                console.error('Failed to load place suggestions', error);
                setPlaceSuggestions([]);
                setIsPlaceOpen(false);
            } finally {
                setIsPlaceLoading(false);
            }
        }, 450);

        return () => window.clearTimeout(timeoutId);
    }, [form.placeAddress]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                placeRef.current &&
                !placeRef.current.contains(event.target as Node)
            ) {
                setIsPlaceOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    function handleSelectPlace(suggestion: PlaceSuggestion) {
        setForm((prev) => ({
            ...prev,
            placeAddress: suggestion.placeAddress,
            placeLat: suggestion.lat || '',
            placeLng: suggestion.lng || '',
            googlePlaceId: '',
            googleMapsUrl: '',
        }));

        setIsPlaceOpen(false);
    }

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) {
        const { name, value } = e.target;

        setForm((prev) => {
            if (name === 'placeAddress') {
                return {
                    ...prev,
                    placeAddress: value,
                    placeLat: '',
                    placeLng: '',
                    googlePlaceId: '',
                    googleMapsUrl: '',
                };
            }

            return {
                ...prev,
                [name]: value,
            };
        });
    }
    async function uploadAvatar(file: File) {
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
        ];

        if (!allowedTypes.includes(file.type)) {
            setError('Only jpg, jpeg, png and webp images are allowed');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Avatar size must be up to 5 MB');
            return;
        }

        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsUploadingAvatar(true);

            const { data } = await api.post<{ url: string }>(
                '/uploads/company-avatar',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );

            setForm((prev) => ({
                ...prev,
                avatarUrl: data.url,
            }));
        } catch (err) {
            setPreviewUrl('');

            if (axios.isAxiosError(err)) {
                const message = Array.isArray(err.response?.data?.message)
                    ? err.response?.data?.message[0]
                    : err.response?.data?.message;

                setError(message || 'Failed to upload avatar');
            } else {
                setError('Failed to upload avatar');
            }
        } finally {
            setIsUploadingAvatar(false);
            URL.revokeObjectURL(localPreview);
        }
    }

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        await uploadAvatar(file);
        e.target.value = '';
    }

    async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        await uploadAvatar(file);
    }

    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(false);
    }

    function handleAvatarClick() {
        fileInputRef.current?.click();
    }

    async function handleCreateCompany(e: React.FormEvent) {
        e.preventDefault();

        if (!form.name.trim()) {
            setError('Title is required');
            return;
        }

        if (!form.email.trim()) {
            setError('Email is required');
            return;
        }

        try {
            setIsCreatingCompany(true);
            setError('');

            await companiesApi.createCompany({
                name: form.name.trim(),
                email: form.email.trim(),
                description: form.description.trim() || undefined,
                avatarUrl: form.avatarUrl || undefined,
                placeAddress: form.placeAddress.trim() || undefined,
                placeLat: form.placeLat || undefined,
                placeLng: form.placeLng || undefined,
                googlePlaceId: form.googlePlaceId || undefined,
                googleMapsUrl: form.googleMapsUrl || undefined,
            });

            navigate('/account', { replace: true });
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = Array.isArray(err.response?.data?.message)
                    ? err.response?.data?.message[0]
                    : err.response?.data?.message;

                setError(message || 'Failed to create company');
            } else {
                setError('Failed to create company');
            }
        } finally {
            setIsCreatingCompany(false);
        }
    }

    return (
        <main className="create-company-page">
            <div className="create-company-page__inner">
                <form
                    className="create-company-form"
                    onSubmit={handleCreateCompany}
                >
                    <div className="create-company-form__header">
                        <h1 className="create-company-form__title">
                            Create Company
                        </h1>
                        <p className="create-company-form__subtitle">
                            *To create an event, you must have a company
                            account.
                        </p>
                    </div>

                    <div className="create-company-form__content">
                        <div className="create-company-form__avatar-wrap">
                            <div
                                className={`create-company-avatar ${isDragging ? 'is-dragging' : ''} ${previewUrl ? 'has-image' : 'no-image'}`}
                                onClick={handleAvatarClick}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                role="button"
                                tabIndex={0}
                            >
                                {previewUrl ? (
                                    <>
                                        <img
                                            src={previewUrl}
                                            alt="Company avatar"
                                            className="create-company-avatar__image"
                                        />
                                        <div className="create-company-avatar__shade" />
                                    </>
                                ) : (
                                    <img
                                        src={uploadIcon}
                                        alt="Upload avatar"
                                        className="create-company-avatar__icon"
                                    />
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp"
                                onChange={handleFileSelect}
                                className="create-company-avatar__input"
                            />

                            <p className="create-company-form__hint">
                                Drag and drop image here or click to upload
                            </p>
                        </div>

                        <div className="create-company-form__fields">
                            <label className="create-company-field">
                                <span className="create-company-field__label">
                                    TITLE
                                </span>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Add Title"
                                    className="create-company-field__input"
                                />
                            </label>

                            <label className="create-company-field">
                                <span className="create-company-field__label">
                                    DESCRIPTION
                                </span>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Add Description"
                                    className="create-company-field__textarea"
                                />
                            </label>

                            <div
                                className="create-company-field"
                                ref={placeRef}
                            >
                                <span className="create-company-field__label">
                                    LOCATION
                                </span>

                                <input
                                    type="text"
                                    name="placeAddress"
                                    value={form.placeAddress}
                                    onChange={handleChange}
                                    onFocus={() => {
                                        if (placeSuggestions.length > 0) {
                                            setIsPlaceOpen(true);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setIsPlaceOpen(false);
                                        }
                                    }}
                                    placeholder="Add Location"
                                    className="create-company-field__input"
                                    autoComplete="off"
                                />

                                {isPlaceOpen && (
                                    <div className="create-company-field__suggestions">
                                        {isPlaceLoading ? (
                                            <div className="create-company-field__suggestion create-company-field__suggestion--muted">
                                                Loading...
                                            </div>
                                        ) : placeSuggestions.length > 0 ? (
                                            placeSuggestions.map(
                                                (suggestion) => (
                                                    <button
                                                        key={suggestion.id}
                                                        type="button"
                                                        className="create-company-field__suggestion"
                                                        onClick={() =>
                                                            handleSelectPlace(
                                                                suggestion,
                                                            )
                                                        }
                                                    >
                                                        {suggestion.label}
                                                    </button>
                                                ),
                                            )
                                        ) : (
                                            <div className="create-company-field__suggestion create-company-field__suggestion--muted">
                                                No places found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <label className="create-company-field">
                                <span className="create-company-field__label">
                                    EMAIL
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Add Email"
                                    className="create-company-field__input"
                                />
                            </label>

                            {error ? (
                                <p className="create-company-form__error">
                                    {error}
                                </p>
                            ) : null}

                            <div className="create-company-form__actions">
                                <button
                                    type="submit"
                                    className="create-company-form__submit"
                                    disabled={
                                        isCreatingCompany || isUploadingAvatar
                                    }
                                >
                                    {isCreatingCompany
                                        ? 'Creating...'
                                        : 'Create'}
                                    <img
                                        src={arrowRight}
                                        alt=""
                                        className="auth-submit-btn__icon"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}
