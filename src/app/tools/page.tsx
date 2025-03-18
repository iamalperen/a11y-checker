import styles from '../page.module.css';

export default function Tools() {
  return (
    <div className={styles.page}>
      <div className="container">
        <h1>Accessibility Tools</h1>
        <p>
          This page will contain various accessibility tools to help you improve
          your website.
        </p>

        <div className={styles.toolsGrid}>
          <div className={styles.toolCard}>
            <h2>Website Analyzer</h2>
            <p>Check the accessibility of any website by entering its URL.</p>
          </div>
          <div className={styles.toolCard}>
            <h2>Color Contrast Checker</h2>
            <p>
              Verify if your color combinations meet accessibility standards.
            </p>
          </div>
          <div className={styles.toolCard}>
            <h2>ARIA Validator</h2>
            <p>
              Validate your ARIA attributes and ensure proper implementation.
            </p>
          </div>
          <div className={styles.toolCard}>
            <h2>Keyboard Navigation Tester</h2>
            <p>Test how keyboard-friendly your site is.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
