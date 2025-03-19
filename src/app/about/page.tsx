import styles from '../page.module.css';
import aboutStyles from './About.module.css';

export default function About() {
  return (
    <div className={styles.page}>
      <div className="container">
        <h1>About A11Y Checker</h1>

        <section
          className={`${styles.aboutSection} ${aboutStyles.developmentNotice}`}
        >
          <h2>Development Status</h2>
          <p>
            A11Y Checker is currently in <strong>beta</strong>. I am actively
            developing new features and improving existing ones. Your feedback
            is invaluable to me during this development phase.
          </p>
          <p>
            I welcome your comments, suggestions, and bug reports. Please feel
            free to contact me or open an issue on my{' '}
            <a
              href="https://github.com/iamalperen/a11y-checker"
              target="_blank"
              rel="noopener noreferrer"
            >
              {' '}
              GitHub repository
            </a>
            .
          </p>
        </section>

        <section className={styles.aboutSection}>
          <h2>Mission</h2>
          <p>
            A11Y Checker aims to make the web more accessible for everyone. I
            believe that digital accessibility is a fundamental right, not a
            luxury. The mission is to provide simple yet powerful tools that
            help developers, designers, and content creators build more
            inclusive websites and applications.
          </p>
        </section>

        <section className={styles.aboutSection}>
          <h2>Why Accessibility Matters</h2>
          <p>
            According to the World Health Organization, over 1 billion people
            worldwide live with some form of disability. That&apos;s about 15%
            of the global population. By making your website accessible,
            you&apos;re not only complying with legal requirements but also
            expanding your audience and demonstrating social responsibility.
          </p>
        </section>

        <section className={styles.aboutSection}>
          <h2>How It Works</h2>
          <p>
            A11Y Checker uses a combination of automated tests and guidelines to
            evaluate the accessibility of web pages. It checks for compliance
            with WCAG 2.1 standards, identifies issues, and provides actionable
            recommendations to improve accessibility.
          </p>
        </section>

        <section className={styles.aboutSection}>
          <h2>About the Developer</h2>
          <p>
            A11Y Checker is developed and maintained by a passionate web
            developer committed to making the internet more accessible for
            everyone. With a background in web development and a strong interest
            in accessibility standards, this tool was created to help others
            build more inclusive digital experiences.
          </p>
        </section>
      </div>
    </div>
  );
}
