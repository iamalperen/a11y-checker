import styles from '../page.module.css';

export default function Tools() {
  return (
    <div className={styles.page}>
      <div className="container">
        <h1>Accessibility Tools</h1>
        <p>
          This page contains various accessibility tools to help you improve
          your website&apos;s accessibility and comply with WCAG standards.
        </p>

        <div className={styles.toolsGrid}>
          <div className={styles.toolCard}>
            <h2>Website Analyzer</h2>
            <p>
              Comprehensive accessibility analysis of any website by entering
              its URL. Checks HTML structure, ARIA usage, color contrast,
              keyboard navigation, and form accessibility.
            </p>
          </div>
          <div className={styles.toolCard}>
            <h2>Color Contrast Checker</h2>
            <p>
              Advanced color contrast analysis that detects potential issues in
              your website&apos;s color palette. Verifies if your color 
              combinations meet WCAG 2.1 AA standards (4.5:1 for normal text).
            </p>
          </div>
          <div className={styles.toolCard}>
            <h2>Enhanced ARIA Validator</h2>
            <p>
              In-depth ARIA validation that checks for deprecated roles,
              redundant attributes, empty values, valid references, and proper
              parent-child relationships according to WAI-ARIA specifications.
            </p>
          </div>
          <div className={styles.toolCard}>
            <h2>Keyboard Navigation Tester</h2>
            <p>
              Tests keyboard accessibility by identifying elements that may not
              be accessible without a mouse and checking for proper tab order
              and focus indicators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
