import React from 'react';
import styles from './WebsiteInput.module.css';

export default function WebsiteInput() {
  return (
    <div className={styles.inputContainer}>
      <input
        type="url"
        className={styles.input}
        placeholder="Enter website URL"
      />
      <button className={styles.button}>Analyze</button>
    </div>
  );
}
