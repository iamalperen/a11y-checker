import styles from '../page.module.css';

export default function FAQ() {
  return (
    <div className={styles.page}>
      <div className="container">
        <h1>Frequently Asked Questions</h1>

        <div className={styles.faqContainer}>
          <div className={styles.faqItem}>
            <h2>What is web accessibility?</h2>
            <p>
              Web accessibility means that websites, tools, and technologies are
              designed and developed so that people with disabilities can use
              them. More specifically, people can perceive, understand,
              navigate, and interact with the web, and they can contribute to
              the web.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h2>What is WCAG?</h2>
            <p>
              WCAG stands for Web Content Accessibility Guidelines. These
              guidelines, published by the World Wide Web Consortium (W3C),
              explain how to make web content more accessible to people with
              disabilities. WCAG is structured around four principles:
              perceivable, operable, understandable, and robust.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h2>What does A11Y mean?</h2>
            <p>
              A11Y is a numeronym for &quot;accessibility,&quot; where the
              number 11 refers to the number of letters between the first
              &apos;a&apos; and the last &apos;y&apos;. It&apos;s similar to
              other numeronyms like &quot;i18n&quot; for internationalization
              and &quot;l10n&quot; for localization.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h2>How does the A11Y Checker work?</h2>
            <p>
              A11Y Checker scans your website for common accessibility issues
              based on WCAG guidelines. It analyzes HTML structure, color
              contrast, keyboard navigation, and other factors that affect
              accessibility. After scanning, it provides a detailed report with
              recommendations for improvements.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h2>Is automatic testing enough for accessibility?</h2>
            <p>
              No, automatic testing can identify many technical issues, but it
              can&apos;t replace human judgment. Some aspects of accessibility,
              like clear language or logical navigation, require manual review.
              A11Y Checker is a great starting point, but I recommend combining
              it with manual testing and user feedback.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h2>How do I fix the issues identified by A11Y Checker?</h2>
            <p>
              A11Y Checker provides specific recommendations for each issue it
              finds. These recommendations include code examples and
              explanations of why the issue matters. If you need more help,
              check out the resources section or refer to the WCAG
              documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
