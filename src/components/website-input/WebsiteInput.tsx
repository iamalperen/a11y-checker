'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './WebsiteInput.module.css';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function WebsiteInput() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Input doğrulama
    if (!url || !url.trim() || !isValidUrl(url)) {
      setIsError(true);
      return;
    }

    // Yükleme durumunu başlat
    setIsError(false);
    setIsLoading(true);

    // Analiz sayfasına yönlendir
    router.push(`/results?url=${encodeURIComponent(url)}`);
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (isError) setIsError(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.inputContainer}>
      <div className={styles.inputWrapper}>
        <input
          type="url"
          className={`${styles.input} ${isError ? styles.inputError : ''}`}
          placeholder="https://example.com"
          value={url}
          onChange={handleInputChange}
          disabled={isLoading}
          aria-label="Website URL"
          aria-invalid={isError}
        />
        {isError && (
          <div className={styles.errorMessage}>
            Please enter a valid URL (e.g., https://example.com)
          </div>
        )}
      </div>

      <button
        type="submit"
        className={styles.button}
        disabled={isLoading}
        aria-label="Analyze website accessibility"
      >
        {isLoading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} className={styles.spinner} />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faSearch} />
            <span>Analyze</span>
          </>
        )}
      </button>
    </form>
  );
}
