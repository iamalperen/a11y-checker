import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import * as axeCore from 'axe-core';

// Legacy accessibility checking tools for fallback
const legacyAccessibilityTools = {
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

    return {
      passed: issues.length === 0,
      issues,
    };
  },
};

// Fallback for when axe-core cannot run
const runBasicAccessibilityChecks = async (html: string) => {
  // Simple HTML structure checks
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

  // Simple form accessibility check
  const formResult = await legacyAccessibilityTools.formAccessibility(html);

  // Simple ARIA checks
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
      passed: true,
      issues: [
        {
          type: 'warning',
          message: 'Color contrast could not be automatically checked',
          code: 'color-contrast-info',
        },
      ],
    },
    formAccessibility: formResult,
    keyboardAccessibility: {
      passed: true,
      issues: [
        {
          type: 'warning',
          message: 'Keyboard accessibility could not be automatically checked',
          code: 'keyboard-info',
        },
      ],
    },
  };
};

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
    } catch (_unused) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the web page
    let response;
    try {
      response = await fetch(url);
      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch URL: ${response.statusText}` },
          { status: response.status }
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Network error';
      return NextResponse.json(
        { error: `Network error: ${errorMessage}` },
        { status: 500 }
      );
    }

    // Get HTML content
    const html = await response.text();

    // Set up JSDOM environment with proper configuration
    const dom = new JSDOM(html, {
      url,
      runScripts: 'outside-only',
      resources: 'usable',
      pretendToBeVisual: true,
    });

    // Create proper window and document objects for axe
    const window = dom.window;
    const document = window.document;

    let results;

    try {
      // Configure axe-core with the JSDOM window
      axeCore.configure({
        // Ensure we don't try to use browser features that aren't available
        allowedOrigins: ['<safe_origin>', 'http://localhost'],
      });

      // Run axe accessibility tests
      const axeResults = await axeCore.run(document, {
        rules: {
          'color-contrast': { enabled: true },
          'page-has-heading-one': { enabled: true },
          'landmark-one-main': { enabled: true },
          region: { enabled: true },
          'image-alt': { enabled: true },
          'input-button-name': { enabled: true },
          label: { enabled: true },
          'link-name': { enabled: true },
          list: { enabled: true },
          listitem: { enabled: true },
          'aria-roles': { enabled: true },
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
          'button-name': { enabled: true },
          'duplicate-id-active': { enabled: true },
          'duplicate-id-aria': { enabled: true },
          'form-field-multiple-labels': { enabled: true },
          'frame-title': { enabled: true },
          'heading-order': { enabled: true },
          'html-has-lang': { enabled: true },
          'html-lang-valid': { enabled: true },
          'meta-viewport': { enabled: true },
          'document-title': { enabled: true },
        },
      });

      // Process the axe results
      const formattedViolations = axeResults.violations.map((violation) => {
        return {
          type: 'error',
          code: violation.id,
          message: violation.help,
          description: violation.description,
          helpUrl: violation.helpUrl,
          impact: violation.impact,
          nodes: violation.nodes.map((node) => ({
            html: node.html,
            failureSummary: node.failureSummary,
            impact: node.impact,
            target: node.target,
          })),
        };
      });

      const formattedIncomplete = axeResults.incomplete.map((check) => {
        return {
          type: 'warning',
          code: check.id,
          message: check.help,
          description: check.description,
          helpUrl: check.helpUrl,
          impact: check.impact,
          nodes: check.nodes.map((node) => ({
            html: node.html,
            failureSummary: node.failureSummary,
            impact: node.impact,
            target: node.target,
          })),
        };
      });

      const formattedPasses = axeResults.passes.map((pass) => {
        return {
          type: 'pass',
          code: pass.id,
          message: pass.help,
          description: pass.description,
          helpUrl: pass.helpUrl,
          nodes: pass.nodes.length,
        };
      });

      // Create structured results by category
      const structuredResults = {
        HTMLStructure: {
          passed: !axeResults.violations.some((v) =>
            [
              'page-has-heading-one',
              'heading-order',
              'document-title',
              'html-has-lang',
              'html-lang-valid',
            ].includes(v.id)
          ),
          issues: [
            ...formattedViolations.filter((v) =>
              [
                'page-has-heading-one',
                'heading-order',
                'document-title',
                'html-has-lang',
                'html-lang-valid',
              ].includes(v.code)
            ),
            ...formattedIncomplete.filter((v) =>
              [
                'page-has-heading-one',
                'heading-order',
                'document-title',
                'html-has-lang',
                'html-lang-valid',
              ].includes(v.code)
            ),
          ],
        },
        ariaUsage: {
          passed: !axeResults.violations.some((v) =>
            [
              'aria-roles',
              'aria-valid-attr',
              'aria-valid-attr-value',
              'region',
              'landmark-one-main',
            ].includes(v.id)
          ),
          issues: [
            ...formattedViolations.filter((v) =>
              [
                'aria-roles',
                'aria-valid-attr',
                'aria-valid-attr-value',
                'region',
                'landmark-one-main',
              ].includes(v.code)
            ),
            ...formattedIncomplete.filter((v) =>
              [
                'aria-roles',
                'aria-valid-attr',
                'aria-valid-attr-value',
                'region',
                'landmark-one-main',
              ].includes(v.code)
            ),
          ],
        },
        colorContrast: {
          passed: !axeResults.violations.some((v) => v.id === 'color-contrast'),
          issues: [
            ...formattedViolations.filter((v) => v.code === 'color-contrast'),
            ...formattedIncomplete.filter((v) => v.code === 'color-contrast'),
          ],
        },
        keyboardAccessibility: {
          passed: !axeResults.violations.some((v) =>
            ['button-name', 'link-name', 'input-button-name'].includes(v.id)
          ),
          issues: [
            ...formattedViolations.filter((v) =>
              ['button-name', 'link-name', 'input-button-name'].includes(v.code)
            ),
            ...formattedIncomplete.filter((v) =>
              ['button-name', 'link-name', 'input-button-name'].includes(v.code)
            ),
          ],
        },
        formAccessibility: {
          passed: !axeResults.violations.some((v) =>
            [
              'label',
              'form-field-multiple-labels',
              'input-button-name',
            ].includes(v.id)
          ),
          issues: [
            ...formattedViolations.filter((v) =>
              [
                'label',
                'form-field-multiple-labels',
                'input-button-name',
              ].includes(v.code)
            ),
            ...formattedIncomplete.filter((v) =>
              [
                'label',
                'form-field-multiple-labels',
                'input-button-name',
              ].includes(v.code)
            ),
          ],
        },
      };

      // Calculate summary statistics
      const errorCount = formattedViolations.length;
      const warningCount = formattedIncomplete.length;
      const totalIssues = errorCount + warningCount;

      // Create the final response
      results = {
        url,
        timestamp: new Date().toISOString(),
        summary: {
          passed: Object.values(structuredResults).filter(
            (category) => (category as any).passed
          ).length,
          warnings: warningCount,
          errors: errorCount,
          total: totalIssues,
        },
        tests: {
          htmlStructure: structuredResults.HTMLStructure,
          ariaUsage: structuredResults.ariaUsage,
          colorContrast: structuredResults.colorContrast,
          keyboardAccessibility: structuredResults.keyboardAccessibility,
          formAccessibility: structuredResults.formAccessibility,
        },
        axeVersion: axeResults.testEngine.version,
        passedRules: formattedPasses,
      };
    } catch (axeError) {
      console.warn('Error running axe-core analysis:', axeError);
      console.log('Falling back to basic accessibility checks');

      // If axe-core fails, fall back to basic accessibility checks
      const basicResults = await runBasicAccessibilityChecks(html);

      // Calculate summary statistics for basic results
      const errorCount = Object.values(basicResults as Record<string, { issues: Array<{ type: string }> }>).reduce(
        (count, category: { issues: Array<{ type: string }> }) =>
          count +
          category.issues.filter(
            (issue: { type: string }) => issue.type === 'error'
          ).length,
        0
      );

      const warningCount = Object.values(basicResults).reduce(
        (count, category: { issues: Array<{ type: string }> }) =>
          count +
          category.issues.filter(
            (issue: { type: string }) => issue.type === 'warning'
          ).length,
        0
      );

      const passedCount = Object.values(basicResults).filter(
        (category: { passed: boolean }) => category.passed
      ).length;

      // Create the final response with basic results
      results = {
        url,
        timestamp: new Date().toISOString(),
        summary: {
          passed: passedCount,
          warnings: warningCount,
          errors: errorCount,
          total: errorCount + warningCount,
        },
        tests: basicResults,
        usingFallback: true,
        fallbackReason:
          'Advanced accessibility testing could not run in this environment. Using basic checks instead.',
      };
    }

    return NextResponse.json(results);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in accessibility analysis:', errorMessage);
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
