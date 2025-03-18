'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationTriangle,
  faCircleExclamation,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import PdfReport from '@/components/pdf-report/PdfReport';

// TypeScript definitions for result types
interface AnalysisIssue {
  type: 'error' | 'warning';
  message: string;
  code: string;
}

interface TestResult {
  passed: boolean;
  issues: AnalysisIssue[];
}

interface AnalysisResults {
  url: string;
  timestamp: string;
  summary: {
    passed: number;
    warnings: number;
    errors: number;
    total: number;
  };
  tests: {
    htmlStructure: TestResult;
    ariaUsage: TestResult;
    colorContrast: TestResult;
    keyboardAccessibility: TestResult;
    formAccessibility: TestResult;
  };
}

type ErrorWithMessage = {
  message: string;
};

// Function to determine color and icon based on issue type
const getIssueStyles = (type: string) => {
  switch (type) {
    case 'error':
      return {
        color: 'var(--color-error)',
        icon: faCircleExclamation,
        label: 'Error',
      };
    case 'warning':
      return {
        color: 'var(--color-warning)',
        icon: faExclamationTriangle,
        label: 'Warning',
      };
    default:
      return {
        color: 'var(--color-success)',
        icon: faCheckCircle,
        label: 'Passed',
      };
  }
};

// Helper function to make test names more readable
const getTestName = (testKey: string) => {
  switch (testKey) {
    case 'htmlStructure':
      return 'HTML Structure';
    case 'ariaUsage':
      return 'ARIA Implementation';
    case 'colorContrast':
      return 'Color Contrast';
    case 'keyboardAccessibility':
      return 'Keyboard Accessibility';
    case 'formAccessibility':
      return 'Form Controls';
    default:
      return testKey;
  }
};

// Issue resolution suggestions
const getSuggestion = (code: string) => {
  const suggestions: Record<string, string> = {
    'heading-order':
      'Use headings in a logical order (h1, then h2, etc.) to create a proper document outline.',
    'img-alt':
      'Add alt attributes to all images. Use descriptive text for informative images, or alt="" for decorative images.',
    'aria-redundant-role':
      'Remove redundant ARIA roles that duplicate the semantic meaning of HTML elements.',
    'aria-valid-reference':
      'Ensure all aria-labelledby and aria-describedby attributes reference valid element IDs.',
    'aria-deprecated-role':
      'Use current ARIA roles instead of deprecated ones. Check the WAI-ARIA specification for appropriate alternatives.',
    'aria-empty-value':
      'Provide a valid value for the ARIA attribute. Empty ARIA attributes are ignored by screen readers.',
    'aria-hidden-interactive':
      'Remove aria-hidden="true" from interactive elements, or make them non-interactive.',
    'aria-required-context':
      'Ensure that elements with ARIA roles are used within the appropriate parent contexts as required by the WAI-ARIA specification.',
    'color-contrast':
      'Ensure text has sufficient contrast against its background. The WCAG AA standard requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.',
    'color-contrast-info':
      'For accurate color contrast analysis, use a dedicated tool like the WebAIM Color Contrast Checker or axe DevTools.',
    'tabindex-positive':
      'Avoid positive tabindex values. Use the natural document order or tabindex="0" for interactive elements.',
    'keyboard-event-handler':
      'Ensure all clickable elements are keyboard accessible by using proper semantic elements or adding keyboard event handlers.',
    'input-id': 'Add a unique ID to every form input element.',
    'input-label':
      'Associate labels with input elements using the for attribute that matches the input ID.',
  };

  return (
    suggestions[code] ||
    'Review WCAG guidelines for more information on this issue.'
  );
};

export default function Results() {
  const searchParams = useSearchParams();
  const url = searchParams?.get('url') || null;

  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeWebsite = async () => {
      if (!url) {
        setError('No URL provided for analysis.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to analyze website');
        }

        const data = await response.json();
        setResults(data);
      } catch (err: unknown) {
        const errorMessage = 
          err instanceof Error 
            ? err.message 
            : 'An error occurred during analysis';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    analyzeWebsite();
  }, [url]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className="container">
          <h1>Analyzing Website</h1>
          <div className={styles.loadingContainer}>
            <FontAwesomeIcon
              icon={faSpinner}
              className={styles.spinner}
              size="3x"
            />
            <p>Analyzing {url}...</p>
            <p className={styles.loadingHint}>
              This may take a few moments as we check multiple accessibility
              criteria.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className="container">
          <h1>Analysis Error</h1>
          <div className={styles.errorContainer}>
            <FontAwesomeIcon
              icon={faCircleExclamation}
              className={styles.errorIcon}
              size="2x"
            />
            <p>Sorry, we encountered an error: {error}</p>
            <Link href="/" className={styles.backButton}>
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className={styles.page}>
        <div className="container">
          <h1>No Results</h1>
          <p>No analysis results are available.</p>
          <Link href="/" className={styles.backButton}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Create appropriate component to display results
  return (
    <div className={styles.page}>
      <div className="container">
        <h1>Accessibility Analysis Results</h1>

        <div className={styles.resultsSummary}>
          <div>
            <h2>
              Website:{' '}
              <a href={results.url} target="_blank" rel="noopener noreferrer">
                {results.url}
              </a>
            </h2>
            <p className={styles.timestamp}>
              Analyzed on: {new Date(results.timestamp).toLocaleString()}
            </p>
          </div>

          <div className={styles.summaryStats}>
            <div className={`${styles.statItem} ${styles.statSuccess}`}>
              <FontAwesomeIcon icon={faCheckCircle} size="lg" />
              <span className={styles.statValue}>{results.summary.passed}</span>
              <span className={styles.statLabel}>Passed</span>
            </div>

            <div className={`${styles.statItem} ${styles.statWarning}`}>
              <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />
              <span className={styles.statValue}>
                {results.summary.warnings}
              </span>
              <span className={styles.statLabel}>Warnings</span>
            </div>

            <div className={`${styles.statItem} ${styles.statError}`}>
              <FontAwesomeIcon icon={faCircleExclamation} size="lg" />
              <span className={styles.statValue}>{results.summary.errors}</span>
              <span className={styles.statLabel}>Errors</span>
            </div>
          </div>
        </div>

        <div className={styles.resultsContainer}>
          {Object.entries(results.tests).map(([testKey, testResult]) => (
            <div key={testKey} className={styles.testSection}>
              <h2 className={styles.testTitle}>
                <FontAwesomeIcon
                  icon={testResult.passed ? faCheckCircle : faCircleExclamation}
                  style={{
                    color: testResult.passed
                      ? 'var(--color-success)'
                      : 'var(--color-error)',
                  }}
                />
                {getTestName(testKey)}
              </h2>

              {testResult.passed ? (
                <p className={styles.passedMessage}>
                  No issues detected in this category.
                </p>
              ) : (
                <div className={styles.issuesList}>
                  {testResult.issues.map((issue, index) => {
                    const issueStyle = getIssueStyles(issue.type);

                    return (
                      <div
                        key={`${testKey}-${index}`}
                        className={styles.issueItem}
                      >
                        <div className={styles.issueHeader}>
                          <FontAwesomeIcon
                            icon={issueStyle.icon}
                            style={{ color: issueStyle.color }}
                            className={styles.issueIcon}
                          />
                          <span
                            className={styles.issueType}
                            style={{ color: issueStyle.color }}
                          >
                            {issueStyle.label}
                          </span>
                          <span className={styles.issueCode}>{issue.code}</span>
                        </div>

                        <div className={styles.issueContent}>
                          <p className={styles.issueMessage}>{issue.message}</p>
                          <div className={styles.issueSuggestion}>
                            <h4>Suggested Fix:</h4>
                            <p>{getSuggestion(issue.code)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.resultsActions}>
          <div className={styles.actionButtons}>
            <Link href="/" className={styles.backButton}>
              Analyze Another Website
            </Link>
            <PdfReport results={results} />
          </div>
        </div>
      </div>
    </div>
  );
}
