import styles from './page.module.css';
import WebsiteInput from '@/components/website-input/WebsiteInput';

export default function Home() {
  return (
    <div className={styles.page}>
      <div className="container">
        <h1>Check Accessibility of Your Website</h1>
        <p className={styles.description}>
          Enter your website URL below to analyze its accessibility and get
          recommendations. Our enhanced analyzer now includes color contrast checking and advanced ARIA validation to help you meet WCAG standards.
        </p>
        <WebsiteInput />
      </div>
    </div>
  );
}
