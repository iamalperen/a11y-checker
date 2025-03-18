import { NextRequest, NextResponse } from 'next/server';

interface AnalysisError {
  message: string;
  status: number;
}

// Erişilebilirlik kontrol araçları
const accessibilityTools = {
  // Basit HTML yapısı kontrolü
  htmlStructure: async (html: string) => {
    const issues = [];

    // Heading seviyelerini kontrol et (h1-h6 hiyerarşisi)
    const headings = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g) || [];
    let previousLevel = 0;

    for (const heading of headings) {
      const level = parseInt(heading.match(/<h([1-6])/)?.[1] || '0');

      // H1 kontrolü
      if (level === 1 && previousLevel === 1) {
        issues.push({
          type: 'error',
          message:
            'Multiple h1 tags found. A page should have only one h1 element.',
          code: 'heading-order',
        });
      }

      // Heading sırası kontrolü
      if (level > previousLevel && level - previousLevel > 1) {
        issues.push({
          type: 'warning',
          message: `Heading level skipped from h${previousLevel} to h${level}. This breaks heading hierarchy.`,
          code: 'heading-order',
        });
      }

      previousLevel = level;
    }

    // Alt etiketleri kontrol et
    const images = html.match(/<img[^>]*>/g) || [];
    for (const img of images) {
      if (!img.includes('alt=')) {
        issues.push({
          type: 'error',
          message:
            'Image missing alt attribute. All images should have alt text for screen readers.',
          code: 'img-alt',
        });
      }
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  },

  // ARIA kullanımı kontrolü
  ariaUsage: async (html: string) => {
    const issues = [];

    // Role kullanımı kontrolü
    const elementsWithRole =
      html.match(/<[^>]*role=["'][^"']*["'][^>]*>/g) || [];
    for (const element of elementsWithRole) {
      // Semantik HTML elemanlarında gereksiz role kullanımı
      if (
        (element.includes('<button') && element.includes('role="button"')) ||
        (element.includes('<a') && element.includes('role="link"')) ||
        (element.includes('<nav') && element.includes('role="navigation"'))
      ) {
        issues.push({
          type: 'warning',
          message:
            'Redundant ARIA role used on semantic HTML element. Remove unnecessary roles.',
          code: 'aria-redundant-role',
        });
      }
    }

    // ARIA labelledby ve describedby kontrolleri
    const ariaLabelledBy = html.match(/aria-labelledby=["'][^"']*["']/g) || [];
    for (const label of ariaLabelledBy) {
      const id = label.match(/aria-labelledby=["']([^"']*)["']/)?.[1];
      if (id && !html.includes(`id="${id}"`)) {
        issues.push({
          type: 'error',
          message: `aria-labelledby references non-existent ID: ${id}`,
          code: 'aria-valid-reference',
        });
      }
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  },

  // Keyboard erişilebilirlik kontrolü
  keyboardAccessibility: async (html: string) => {
    const issues = [];

    // tabindex kontrolü
    const tabindexElements = html.match(/tabindex=["']-?[0-9]+["']/g) || [];
    for (const tabindex of tabindexElements) {
      const value = parseInt(
        tabindex.match(/tabindex=["'](-?[0-9]+)["']/)?.[1] || '0'
      );
      if (value > 0) {
        issues.push({
          type: 'warning',
          message: `tabindex value is greater than 0: ${value}. This can disrupt the natural tab order.`,
          code: 'tabindex-positive',
        });
      }
    }

    // onClick olup keyboard event olmayanlar
    const onClickElements =
      html.match(/<[^>]*onclick=["'][^"']*["'][^>]*>/g) || [];
    for (const element of onClickElements) {
      if (
        !element.includes('onkeydown') &&
        !element.includes('onkeyup') &&
        !element.includes('onkeypress') &&
        !element.includes('<button') &&
        !element.includes('<a') &&
        !element.includes('role="button"')
      ) {
        issues.push({
          type: 'error',
          message:
            'Element with onClick has no keyboard event handlers and is not a button or link.',
          code: 'keyboard-event-handler',
        });
      }
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  },

  // Form erişilebilirlik kontrolü
  formAccessibility: async (html: string) => {
    const issues = [];

    // Label kontrolü
    const inputs = html.match(/<input[^>]*>/g) || [];
    for (const input of inputs) {
      // Hidden input hariç diğer inputlar için label kontrolü
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

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // URL doğrulama
    try {
      new URL(url);
    } catch (_) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Web sayfasını getir
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
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return NextResponse.json(
        { error: `Network error: ${errorMessage}` },
        { status: 500 }
      );
    }

    // HTML içeriğini al
    const html = await response.text();

    // Kontrolleri gerçekleştir
    const results = {
      url,
      timestamp: new Date().toISOString(),
      summary: {
        passed: 0,
        warnings: 0,
        errors: 0,
        total: 0,
      },
      tests: {
        htmlStructure: await accessibilityTools.htmlStructure(html),
        ariaUsage: await accessibilityTools.ariaUsage(html),
        keyboardAccessibility:
          await accessibilityTools.keyboardAccessibility(html),
        formAccessibility: await accessibilityTools.formAccessibility(html),
      },
    };

    // Özet hesapla
    let errors = 0;
    let warnings = 0;
    let total = 0;

    for (const test of Object.values(results.tests)) {
      // TypeScript için tip güvenliği
      const testResult = test as { passed: boolean; issues: { type: string }[] };
      total += testResult.issues.length;

      for (const issue of testResult.issues) {
        if (issue.type === 'error') {
          errors++;
        } else if (issue.type === 'warning') {
          warnings++;
        }
      }
    }

    results.summary = {
      passed: Object.values(results.tests).filter((test: unknown) => {
        const testObj = test as { passed: boolean };
        return testObj.passed;
      }).length,
      warnings,
      errors,
      total,
    };

    return NextResponse.json(results);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in accessibility analysis:', errorMessage);
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
