import { NextRequest, NextResponse } from 'next/server';

// Basic HTML analysis functions
const runBasicAccessibilityChecks = async (html: string) => {
  console.log('Running basic accessibility checks...');
  
  // HTML structure checks
  const htmlStructureIssues = [];

  if (!html.includes('<h1')) {
    htmlStructureIssues.push({
      type: 'error',
      message: 'Page does not have an h1 heading',
      code: 'page-has-heading-one',
    });
  }

  if (!html.match(/<html[^>]*lang=/)) {
    htmlStructureIssues.push({
      type: 'error',
      message: 'HTML element should have a lang attribute',
      code: 'html-has-lang',
    });
  }

  if (!html.match(/<title[^>]*>/)) {
    htmlStructureIssues.push({
      type: 'error',
      message: 'Document should have a title',
      code: 'document-title',
    });
  }

  // Check for images without alt attributes
  const imgRegex = /<img(?![^>]*alt=(['"]).*?\1)[^>]*>/g;
  const imagesWithoutAlt = html.match(imgRegex);
  if (imagesWithoutAlt && imagesWithoutAlt.length > 0) {
    htmlStructureIssues.push({
      type: 'error',
      message: 'Images should have alt attributes',
      code: 'img-alt',
      description: `${imagesWithoutAlt.length} images found without alt attributes.`,
    });
  }

  // Form accessibility
  const formResult = await accessibilityCheckers.formAccessibility(html);

  // ARIA checks
  const ariaIssues = [];
  const ariaAttributes = html.match(/aria-[a-z]+=["'][^"']*["']/g) || [];
  for (const attr of ariaAttributes) {
    if (
      attr.includes('aria-hidden="true"') &&
      (attr.includes('button') || attr.includes('a href'))
    ) {
      ariaIssues.push({
        type: 'warning',
        message:
          'aria-hidden="true" should not be used on interactive elements',
        code: 'aria-hidden-interactive',
      });
    }
  }

  // Color contrast warning
  const colorContrastIssue = {
    type: 'warning',
    message: 'Color contrast cannot be automatically checked',
    code: 'color-contrast-info',
    description: 'For color contrast, use specialized tools like WebAIM Contrast Checker or axe DevTools.'
  };

  // Keyboard accessibility checks
  const keyboardIssues = [];
  
  // tabindex > 0 check
  const tabindexPattern = /tabindex=["'](\d+)["']/g;
  let match;
  while ((match = tabindexPattern.exec(html)) !== null) {
    if (parseInt(match[1]) > 0) {
      keyboardIssues.push({
        type: 'warning',
        message: 'Avoid positive tabindex values',
        code: 'tabindex-positive',
        description: 'Positive tabindex values can disrupt the natural document order and cause accessibility issues.',
      });
      break;
    }
  }

  // Warning for onclick without onkeydown/onkeyup/onkeypress
  const onclickPattern = /onclick=["'][^"']*["']/g;
  const onkeyPattern = /onkey(down|up|press)=["'][^"']*["']/g;
  
  const onclickElements = html.match(onclickPattern) || [];
  const onkeyElements = html.match(onkeyPattern) || [];
  
  if (onclickElements.length > onkeyElements.length) {
    keyboardIssues.push({
      type: 'warning',
      message: 'Keyboard event handlers may be missing',
      code: 'keyboard-event-handler',
      description: 'Elements with onclick handlers should generally have corresponding onkey* handlers for keyboard users.',
    });
  }

  return {
    htmlStructure: {
      passed: htmlStructureIssues.length === 0,
      issues: htmlStructureIssues,
    },
    ariaUsage: {
      passed: ariaIssues.length === 0,
      issues: ariaIssues,
    },
    colorContrast: {
      passed: false,
      issues: [colorContrastIssue],
    },
    formAccessibility: formResult,
    keyboardAccessibility: {
      passed: keyboardIssues.length === 0,
      issues: keyboardIssues.length > 0 ? keyboardIssues : [
        {
          type: 'warning',
          message: 'Keyboard accessibility cannot be fully checked',
          code: 'keyboard-info',
        },
      ],
    },
  };
};

// Helper functions for accessibility checks
const accessibilityCheckers = {
  // Form accessibility check
  formAccessibility: async (html: string) => {
    const issues = [];

    // Label check
    const inputs = html.match(/<input[^>]*>/g) || [];
    for (const input of inputs) {
      // Check labels for all inputs except hidden
      if (!input.includes('type="hidden"')) {
        const id = input.match(/id=["']([^"']*)["']/)?.[1];

        if (!id) {
          issues.push({
            type: 'error',
            message:
              'Input element without an ID. Form controls should have IDs for label association.',
            code: 'input-id',
          });
        } else if (!html.includes(`for="${id}"`)) {
          issues.push({
            type: 'error',
            message: `Input with ID "${id}" has no associated label element.`,
            code: 'input-label',
          });
        }
      }
    }

    // Select elements label check
    const selects = html.match(/<select[^>]*>/g) || [];
    for (const select of selects) {
      const id = select.match(/id=["']([^"']*)["']/)?.[1];
      
      if (!id) {
        issues.push({
          type: 'error',
          message: 'Select element without an ID. Form controls should have IDs for label association.',
          code: 'select-id',
        });
      } else if (!html.includes(`for="${id}"`)) {
        issues.push({
          type: 'error',
          message: `Select with ID "${id}" has no associated label element.`,
          code: 'select-label',
        });
      }
    }

    // Textarea elements label check
    const textareas = html.match(/<textarea[^>]*>/g) || [];
    for (const textarea of textareas) {
      const id = textarea.match(/id=["']([^"']*)["']/)?.[1];
      
      if (!id) {
        issues.push({
          type: 'error',
          message: 'Textarea element without an ID. Form controls should have IDs for label association.',
          code: 'textarea-id',
        });
      } else if (!html.includes(`for="${id}"`)) {
        issues.push({
          type: 'error',
          message: `Textarea with ID "${id}" has no associated label element.`,
          code: 'textarea-label',
        });
      }
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  },
};

// Main accessibility analysis function
async function runAccessibilityAnalysis(url: string) {
  try {
    // Get HTML content from URL
    console.log(`Fetching HTML content from ${url}...`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'A11Y-Checker/1.0 Accessibility Analyzer'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Apply basic checks and get results
    const basicResults = await runBasicAccessibilityChecks(html);
    
    // Calculate statistics
    const errorCount = Object.values(basicResults).reduce(
      (count, category: any) => 
        count + category.issues.filter((issue: any) => issue.type === 'error').length,
      0
    );
    
    const warningCount = Object.values(basicResults).reduce(
      (count, category: any) => 
        count + category.issues.filter((issue: any) => issue.type === 'warning').length,
      0
    );
    
    const passCount = Object.values(basicResults).filter(
      (category: any) => category.passed
    ).length;
    
    // Create response
    return {
      url,
      timestamp: new Date().toISOString(),
      summary: {
        passed: passCount,
        warnings: warningCount,
        errors: errorCount,
        total: errorCount + warningCount,
      },
      tests: basicResults,
      analysisNote: 'Basic accessibility checks are being applied. For more comprehensive analysis, use browser extensions like WAVE, axe DevTools, or Lighthouse.',
    };
  } catch (error) {
    console.error('Accessibility analysis error:', error);
    return {
      url,
      timestamp: new Date().toISOString(),
      summary: {
        passed: 0,
        warnings: 0,
        errors: 1,
        total: 1,
      },
      tests: {
        htmlStructure: { passed: false, issues: [] },
        ariaUsage: { passed: false, issues: [] },
        colorContrast: { passed: false, issues: [] },
        formAccessibility: { passed: false, issues: [] },
        keyboardAccessibility: { passed: false, issues: [] },
      },
      error: error instanceof Error ? error.message : String(error),
      analysisNote: 'An error occurred during the accessibility analysis. Please try again later or analyze another URL.',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // URL validation
    try {
      new URL(url);
    } catch (/* eslint-disable-next-line @typescript-eslint/no-unused-vars */ _) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Run the analysis
    const results = await runAccessibilityAnalysis(url);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Unexpected error in API:', error);
    return NextResponse.json(
      { 
        error: 'Server error processing your request',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
