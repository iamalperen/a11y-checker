import styles from './page.module.css';
import WebsiteInput from '@/components/website-input/WebsiteInput';

export default function Home() {
  return (
    <div className={styles.page}>
      <WebsiteInput />
    </div>
  );
}
