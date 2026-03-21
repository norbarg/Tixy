//СreateEventPage.tsx
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { eventsApi } from '../api/events.api';
import { promoCodesApi } from '../api/promo-codes.api';

import 'react-datepicker/dist/react-datepicker.css';

import posterPlaceholder from '../assets/events/poster-placeholder.png';
import bannerPlaceholder from '../assets/events/banner-placeholder.png';
import selectArrow from '../assets/events/arrow3.png';
import Arrow2 from '../assets/auth/arrow.png';

import './create-event.css';

type PromoCodeFormItem = {
  code: string;
  discountPercent: string;
};

type CreateEventForm = {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  publishedAt: string;
  format: string;
  category: string;
  price: string;
  ticketsLimit: string;
  visitorsVisibility: string;
  notifyOnNewVisitor: boolean;
  posterUrl: string;
  bannerUrl: string;
};

const FORMAT_OPTIONS = [
  { value: 'CONFERENCE', label: 'Conference' },
  { value: 'LECTURE', label: 'Lecture' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'CONCERT', label: 'Concert' },
  { value: 'FEST', label: 'Fest' },
];

const CATEGORY_OPTIONS = [
  { value: 'business', label: 'Business' },
  { value: 'politics', label: 'Politics' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'music', label: 'Music' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'film', label: 'Film' },
  { value: 'technology', label: 'Technology' },
  { value: 'design', label: 'Design' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'sports', label: 'Sports' },
];

const VISIBILITY_OPTIONS = [
  {
    value: 'PUBLIC',
    label: 'Allow everyone to see the list of event attendees',
  },
  {
    value: 'ATTENDEES_ONLY',
    label: 'Allow only ticket holders to see the list of event attendees',
  },
];

function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function parseDateTimeLocal(value: string): Date | null {
  if (!value) return null;

  const [datePart, timePart] = value.split('T');
  if (!datePart || !timePart) return null;

  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  if ([year, month, day, hours, minutes].some((item) => Number.isNaN(item))) {
    return null;
  }

  return new Date(year, month - 1, day, hours, minutes);
}

function formatDateInputLabel(value?: string): string {
  if (!value) return '';

  const date = parseDateTimeLocal(value);
  if (!date) return '';

  return date.toLocaleString([], {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type CustomDateInputProps = {
  selectedValue?: string;
  onClick?: () => void;
  placeholder: string;
  className?: string;
};

const CustomDateInput = forwardRef<HTMLButtonElement, CustomDateInputProps>(
  ({ selectedValue, onClick, placeholder, className = '' }, ref) => {
    const displayValue = formatDateInputLabel(selectedValue);

    return (
      <button
        type="button"
        ref={ref}
        onClick={onClick}
        className={`event-field__input event-field__input--datepicker ${className}`.trim()}
      >
        <span className={displayValue ? '' : 'event-field__datepicker-placeholder'}>
          {displayValue || placeholder}
        </span>
      </button>
    );
  },
);

CustomDateInput.displayName = 'CustomDateInput';

export function CreateEventPage() {
  const navigate = useNavigate();

  const posterInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  const defaultPosterUrl = useMemo(
    () => `${window.location.origin}/defaults/event-poster-default.png`,
    [],
  );
  const defaultBannerUrl = useMemo(
    () => `${window.location.origin}/defaults/event-banner-default.png`,
    [],
  );

  const [form, setForm] = useState<CreateEventForm>({
    title: '',
    description: '',
    location: '',
    startsAt: '',
    endsAt: '',
    publishedAt: '',
    format: '',
    category: '',
    price: '',
    ticketsLimit: '',
    visitorsVisibility: 'PUBLIC',
    notifyOnNewVisitor: true,
    posterUrl: '',
    bannerUrl: '',
  });

  const [promoCodes, setPromoCodes] = useState<PromoCodeFormItem[]>([
    { code: '', discountPercent: '' },
  ]);

  const [posterPreviewUrl, setPosterPreviewUrl] = useState('');
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState('');

  const [isDraggingPoster, setIsDraggingPoster] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);

  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type } = e.target as HTMLInputElement;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handlePromoCodeChange(
    index: number,
    field: keyof PromoCodeFormItem,
    value: string,
  ) {
    setPromoCodes((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function addPromoCodeRow() {
    setPromoCodes((prev) => [...prev, { code: '', discountPercent: '' }]);
  }

  function removePromoCodeRow(index: number) {
    setPromoCodes((prev) => prev.filter((_, i) => i !== index));
  }

  function handleStartsAtChange(date: Date | null) {
    setForm((prev) => {
      const nextStartsAt = date ? formatDateTimeLocal(date) : '';
      const prevEndsAtDate = parseDateTimeLocal(prev.endsAt);

      return {
        ...prev,
        startsAt: nextStartsAt,
        endsAt:
          date && prevEndsAtDate && prevEndsAtDate.getTime() < date.getTime()
            ? ''
            : prev.endsAt,
      };
    });
  }

  function handleEndsAtChange(date: Date | null) {
    setForm((prev) => ({
      ...prev,
      endsAt: date ? formatDateTimeLocal(date) : '',
    }));
  }

  function handlePublishedAtChange(date: Date | null) {
    setForm((prev) => ({
      ...prev,
      publishedAt: date ? formatDateTimeLocal(date) : '',
    }));
  }

  async function uploadImage(
    file: File,
    endpoint: '/uploads/event-poster' | '/uploads/event-banner',
    type: 'poster' | 'banner',
  ) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setError('Only jpg, jpeg, png and webp images are allowed');
      return;
    }

    const maxSize = type === 'poster' ? 7 * 1024 * 1024 : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        `${type === 'poster' ? 'Poster' : 'Banner'} size must be up to ${
          type === 'poster' ? '7' : '10'
        } MB`,
      );
      return;
    }

    const localPreview = URL.createObjectURL(file);

    if (type === 'poster') {
      setPosterPreviewUrl(localPreview);
      setIsUploadingPoster(true);
    } else {
      setBannerPreviewUrl(localPreview);
      setIsUploadingBanner(true);
    }

    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post<{ url: string }>(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (type === 'poster') {
        setPosterPreviewUrl(data.url);
      } else {
        setBannerPreviewUrl(data.url);
      }

      setForm((prev) => ({
        ...prev,
        posterUrl: type === 'poster' ? data.url : prev.posterUrl,
        bannerUrl: type === 'banner' ? data.url : prev.bannerUrl,
      }));
    } catch (err) {
      if (type === 'poster') {
        setPosterPreviewUrl('');
      } else {
        setBannerPreviewUrl('');
      }

      if (axios.isAxiosError(err)) {
        const message = Array.isArray(err.response?.data?.message)
          ? err.response?.data?.message[0]
          : err.response?.data?.message;

        setError(message || `Failed to upload ${type}`);
      } else {
        setError(`Failed to upload ${type}`);
      }
    } finally {
      if (type === 'poster') {
        setIsUploadingPoster(false);
      } else {
        setIsUploadingBanner(false);
      }
    }
  }

  async function handlePosterSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadImage(file, '/uploads/event-poster', 'poster');
    e.target.value = '';
  }

  async function handleBannerSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadImage(file, '/uploads/event-banner', 'banner');
    e.target.value = '';
  }

  async function handlePosterDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingPoster(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    await uploadImage(file, '/uploads/event-poster', 'poster');
  }

  async function handleBannerDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingBanner(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    await uploadImage(file, '/uploads/event-banner', 'banner');
  }

  function openPosterPicker() {
    posterInputRef.current?.click();
  }

  function openBannerPicker() {
    bannerInputRef.current?.click();
  }

  function toIsoOrEmpty(value: string) {
    if (!value) return '';
    return new Date(value).toISOString();
  }

  function getFormatLabel() {
    return FORMAT_OPTIONS.find((item) => item.value === form.format)?.label || 'Choose Format';
  }

  function getCategoryLabel() {
    return CATEGORY_OPTIONS.find((item) => item.value === form.category)?.label || 'Choose Theme';
  }

  function getVisibilityLabel() {
    return (
      VISIBILITY_OPTIONS.find((item) => item.value === form.visitorsVisibility)?.label ||
      'Choose Visibility'
    );
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!form.description.trim()) {
      setError('Description is required');
      return;
    }

    if (!form.location.trim()) {
      setError('Location is required');
      return;
    }

    if (!form.startsAt || !form.endsAt) {
      setError('Start date and end date are required');
      return;
    }

    if (!form.format) {
      setError('Format is required');
      return;
    }

    if (!form.category) {
      setError('Theme is required');
      return;
    }

    if (!form.price.trim()) {
      setError('Price is required');
      return;
    }

    if (!form.ticketsLimit.trim()) {
      setError('Quantity is required');
      return;
    }

    const invalidPromo = promoCodes.some(
      (item) =>
        (item.code.trim() && !item.discountPercent.trim()) ||
        (!item.code.trim() && item.discountPercent.trim()),
    );

    if (invalidPromo) {
      setError('Fill promo code name and discount percent together');
      return;
    }

    try {
      setIsCreatingEvent(true);
      setError('');

      const createdEvent = await eventsApi.createEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        format: form.format,
        category: form.category,
        bannerUrl: form.bannerUrl || defaultBannerUrl,
        posterUrl: form.posterUrl || defaultPosterUrl,
        placeName: form.location.trim(),
        placeAddress: form.location.trim(),
        startsAt: toIsoOrEmpty(form.startsAt),
        endsAt: toIsoOrEmpty(form.endsAt),
        publishedAt: form.publishedAt ? toIsoOrEmpty(form.publishedAt) : undefined,
        price: form.price.trim(),
        ticketsLimit: Number(form.ticketsLimit),
        visitorsVisibility: form.visitorsVisibility,
        notifyOnNewVisitor: form.notifyOnNewVisitor,
      });

      const validPromoCodes = promoCodes.filter(
        (item) => item.code.trim() && item.discountPercent.trim(),
      );

      for (const promo of validPromoCodes) {
        await promoCodesApi.createPromoCode({
          eventId: createdEvent.id,
          code: promo.code.trim().toUpperCase(),
          discountPercent: Number(promo.discountPercent),
        });
      }

      navigate('/account', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = Array.isArray(err.response?.data?.message)
          ? err.response?.data?.message[0]
          : err.response?.data?.message;

        setError(message || 'Failed to create event');
      } else {
        setError('Failed to create event');
      }
    } finally {
      setIsCreatingEvent(false);
    }
  }

  return (
    <main className="create-event-page">
      <div className="create-event-page__inner">
        <form className="create-event-form" onSubmit={handleCreateEvent}>
          <div className="create-event-form__header">
            <h1 className="create-event-form__title">Create Event</h1>
          </div>

          <div className="create-event-form__grid">
            <div className="create-event-media">
              <div className="create-event-media__poster-block">
                <div
                  className={`event-upload event-upload--poster ${isDraggingPoster ? 'is-dragging' : ''} ${posterPreviewUrl ? 'has-image' : 'has-placeholder'}`}
                  onClick={openPosterPicker}
                  onDrop={handlePosterDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingPoster(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDraggingPoster(false);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={posterPreviewUrl || posterPlaceholder}
                    alt="Event poster"
                    className={posterPreviewUrl ? 'event-upload__image' : 'event-upload__icon'}
                  />
                  <div className="event-upload__shade" />
                  <div className="event-upload__overlay-text">
                    {isUploadingPoster ? (
                      <div className="event-upload__overlay-text">Uploading...</div>
                    ) : null}
                  </div>
                </div>

                <input
                  ref={posterInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handlePosterSelect}
                  className="event-upload__input"
                />
              </div>

              <div className="create-event-media__banner-row">
                <div className="create-event-media__banner-main">
                  <div className="create-event-media__banner-label">BANNER</div>

                  <div
                    className={`event-upload event-upload--banner ${isDraggingBanner ? 'is-dragging' : ''} ${bannerPreviewUrl ? 'has-image' : 'has-placeholder'}`}
                    onClick={openBannerPicker}
                    onDrop={handleBannerDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingBanner(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDraggingBanner(false);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <img
                      src={bannerPreviewUrl || bannerPlaceholder}
                      alt="Event banner"
                      className={bannerPreviewUrl ? 'event-upload__image' : 'event-upload__icon'}
                    />
                    <div className="event-upload__shade" />
                    <div className="event-upload__overlay-text">
                      {isUploadingBanner ? (
                        <div className="event-upload__overlay-text">Uploading...</div>
                      ) : null}
                    </div>
                  </div>

                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleBannerSelect}
                    className="event-upload__input"
                  />
                </div>

                <div className="event-field promo-field promo-field--side">
                  <span className="event-field__label">PROMO CODE</span>

                  {promoCodes.map((item, index) => (
                    <div key={index} className="promo-field__row">
                      <input
                        type="text"
                        value={item.code}
                        onChange={(e) => handlePromoCodeChange(index, 'code', e.target.value)}
                        placeholder="Add"
                        className="event-field__input promo-field__code"
                      />

                      <div className="promo-field__discount-wrap">
                        <span className="promo-field__prefix">%</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={item.discountPercent}
                          onChange={(e) =>
                            handlePromoCodeChange(index, 'discountPercent', e.target.value)
                          }
                          className="event-field__input promo-field__discount promo-field__discount--with-prefix"
                        />
                      </div>

                      {index === promoCodes.length - 1 ? (
                        <button
                          type="button"
                          className="promo-field__action"
                          onClick={addPromoCodeRow}
                        >
                          +
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="promo-field__action"
                          onClick={() => removePromoCodeRow(index)}
                        >
                          −
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="create-event-fields">
              <div className="create-event-fields__left">
                <label className="event-field">
                  <span className="event-field__label">TITLE</span>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Add Title"
                    className="event-field__input event-field__input--wide"
                  />
                </label>

                <label className="event-field">
                  <span className="event-field__label">DESCRIPTION</span>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Add Description"
                    className="event-field__textarea event-field__textarea--wide"
                  />
                </label>

                <label className="event-field">
                  <span className="event-field__label">LOCATION</span>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Add Location"
                    className="event-field__input event-field__input--wide"
                  />
                </label>

                <div className="create-event-fields__row create-event-fields__row--price">
                  <label className="event-field">
                    <span className="event-field__label">PRICE</span>

                    <div className="event-field__input-wrap">
                      <span className="event-field__prefix">$</span>
                      <input
                        type="text"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="Add Price"
                        className="event-field__input event-field__input--short event-field__input--with-prefix"
                      />
                    </div>
                  </label>

                  <label className="event-field">
                    <span className="event-field__label">QUANTITY</span>
                    <input
                      type="number"
                      min="1"
                      name="ticketsLimit"
                      value={form.ticketsLimit}
                      onChange={handleChange}
                      placeholder="Add Quantity"
                      className="event-field__input event-field__input--short"
                    />
                  </label>
                </div>
              </div>

              <div className="create-event-fields__right">
                <div className="event-field">
                  <span className="event-field__label">DATE</span>

                  <div className="create-event-fields__row create-event-fields__row--dates">
                    <div className="event-field__date-picker">
                      <DatePicker
                        selected={parseDateTimeLocal(form.startsAt)}
                        onChange={handleStartsAtChange}
                        showTimeSelect
                        timeIntervals={15}
                        dateFormat="MM/dd/yyyy h:mm aa"
                        placeholderText="Start in"
                        customInput={
                          <CustomDateInput
                            placeholder="Start in"
                            selectedValue={form.startsAt}
                            className="event-field__input--date"
                          />
                        }
                      />
                    </div>

                    <div className="event-field__date-picker">
                      <DatePicker
                        selected={parseDateTimeLocal(form.endsAt)}
                        onChange={handleEndsAtChange}
                        showTimeSelect
                        timeIntervals={15}
                        dateFormat="MM/dd/yyyy h:mm aa"
                        minDate={parseDateTimeLocal(form.startsAt) || undefined}
                        placeholderText="End in"
                        customInput={
                          <CustomDateInput
                            placeholder="End in"
                            selectedValue={form.endsAt}
                            className="event-field__input--date"
                          />
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="event-field event-select">
                  <span className="event-field__label">FORMAT</span>
                  <button
                    type="button"
                    className="event-select__trigger"
                    onClick={() => {
                      setIsFormatOpen((prev) => !prev);
                      setIsCategoryOpen(false);
                      setIsVisibilityOpen(false);
                    }}
                  >
                    <span>{getFormatLabel()}</span>
                    <img src={selectArrow} alt="" className="event-select__arrow" />
                  </button>

                  {isFormatOpen && (
                    <div className="event-select__menu">
                      {FORMAT_OPTIONS.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          className="event-select__item"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, format: item.value }));
                            setIsFormatOpen(false);
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="event-field event-select">
                  <span className="event-field__label">THEME</span>
                  <button
                    type="button"
                    className="event-select__trigger"
                    onClick={() => {
                      setIsCategoryOpen((prev) => !prev);
                      setIsFormatOpen(false);
                      setIsVisibilityOpen(false);
                    }}
                  >
                    <span>{getCategoryLabel()}</span>
                    <img src={selectArrow} alt="" className="event-select__arrow" />
                  </button>

                  {isCategoryOpen && (
                    <div className="event-select__menu">
                      {CATEGORY_OPTIONS.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          className="event-select__item"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, category: item.value }));
                            setIsCategoryOpen(false);
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="create-event-bottom">
              <div className="create-event-bottom__left">
                <label className="event-field">
                  <span className="event-field__label">DATE OF PUBLICATION</span>

                  <div className="event-field__publication-picker">
                    <DatePicker
                      selected={parseDateTimeLocal(form.publishedAt)}
                      onChange={handlePublishedAtChange}
                      showTimeSelect
                      timeIntervals={15}
                      dateFormat="MM/dd/yyyy h:mm aa"
                      placeholderText="Add Date"
                      customInput={
                        <CustomDateInput
                          placeholder="Add Date"
                          selectedValue={form.publishedAt}
                          className="event-field__input--publication"
                        />
                      }
                    />
                  </div>
                </label>

                <div className="event-field event-select event-select--visibility">
                  <span className="event-field__label">VISIBILITY OF ATTENDEES</span>
                  <button
                    type="button"
                    className="event-select__trigger"
                    onClick={() => {
                      setIsVisibilityOpen((prev) => !prev);
                      setIsFormatOpen(false);
                      setIsCategoryOpen(false);
                    }}
                  >
                    <span>{getVisibilityLabel()}</span>
                    <img src={selectArrow} alt="" className="event-select__arrow" />
                  </button>

                  {isVisibilityOpen && (
                    <div className="event-select__menu">
                      {VISIBILITY_OPTIONS.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          className="event-select__item"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              visitorsVisibility: item.value,
                            }));
                            setIsVisibilityOpen(false);
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="create-event-bottom__right">
                <label className="event-checkbox">
                  <input
                    type="checkbox"
                    name="notifyOnNewVisitor"
                    checked={form.notifyOnNewVisitor}
                    onChange={handleChange}
                  />
                  <span>Receive notifications about new attendees to your event</span>
                </label>

                <button
                  type="submit"
                  className="create-event-form__submit"
                  disabled={isCreatingEvent || isUploadingPoster || isUploadingBanner}
                >
                  {isCreatingEvent ? 'Creating...' : 'Create'}
                  <img src={Arrow2} alt="" className="event-select__arrow" />
                </button>
              </div>
            </div>

            {error ? <p className="create-event-form__error">{error}</p> : null}
          </div>
        </form>
      </div>
    </main>
  );
}
