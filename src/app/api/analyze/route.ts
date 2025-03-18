import { NextRequest, NextResponse } from 'next/server';
// Accessibility checking tools
const accessibilityTools = {
  // Simple HTML structure check
  htmlStructure: async (html: string) => {
    const issues = [];

    // Check heading levels (h1-h6 hierarchy)
    const headings = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g) || [];
    let previousLevel = 0;

    for (const heading of headings) {
      const level = parseInt(heading.match(/<h([1-6])/)?.[1] || '0');

      // H1 check
      if (level === 1 && previousLevel === 1) {
        issues.push({
          type: 'error',
          message:
            'Multiple h1 tags found. A page should have only one h1 element.',
          code: 'heading-order',
        });
      }

      // Heading order check
      if (level > previousLevel && level - previousLevel > 1) {
        issues.push({
          type: 'warning',
          message: `Heading level skipped from h${previousLevel} to h${level}. This breaks heading hierarchy.`,
          code: 'heading-order',
        });
      }

      previousLevel = level;
    }

    // Check alt tags
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

  // ARIA usage check - Enhanced
  ariaUsage: async (html: string) => {
    const issues = [];

    // ARIA Roles
    const elementsWithRole =
      html.match(/<[^>]*role=["'][^"']*["'][^>]*>/g) || [];

    // List of invalid or deprecated ARIA roles
    const deprecatedRoles = [
      'dialog', // should use alertdialog or dialog instead
      'menu', // not sufficient for menu items
      'menuitem', // not sufficient for menu items
      'toolbar', // better alternatives exist
    ];

    // Redundant roles for semantic HTML elements
    const redundantRoleMappings = {
      button: 'button',
      a: 'link',
      nav: 'navigation',
      header: 'banner',
      footer: 'contentinfo',
      main: 'main',
      aside: 'complementary',
      'input[type="checkbox"]': 'checkbox',
      'input[type="radio"]': 'radio',
      'input[type="search"]': 'searchbox',
      form: 'form',
      table: 'table',
      ul: 'list',
      ol: 'list',
      select: 'listbox',
      details: 'disclosure',
    };

    for (const element of elementsWithRole) {
      const roleMatch = element.match(/role=["']([^"']*)["']/);
      if (roleMatch && roleMatch[1]) {
        const role = roleMatch[1];

        // Check for deprecated roles
        if (deprecatedRoles.includes(role)) {
          issues.push({
            type: 'warning',
            message: `Deprecated ARIA role '${role}' found. Consider using a more appropriate role.`,
            code: 'aria-deprecated-role',
          });
        }

        // Check for redundant roles
        for (const [tag, expectedRole] of Object.entries(
          redundantRoleMappings
        )) {
          if (element.includes(`<${tag}`) && role === expectedRole) {
            issues.push({
              type: 'warning',
              message: `Redundant ARIA role '${role}' used on <${tag}> element. This semantic element already has this role by default.`,
              code: 'aria-redundant-role',
            });
            break;
          }
        }
      }
    }

    // ARIA attribute checks
    const ariaAttributes = [
      ...html.matchAll(/aria-[a-z]+=["|']([^"|']*)["|']/g),
    ];

    // Check all ARIA states and properties
    for (const match of ariaAttributes) {
      const [fullMatch, value] = match;
      const attributeName = fullMatch.split('=')[0];

      // Empty ARIA values
      if (!value || value.trim() === '') {
        issues.push({
          type: 'error',
          message: `Empty ARIA attribute: ${attributeName} has no value.`,
          code: 'aria-empty-value',
        });
      }

      // aria-labelledby and aria-describedby ID references
      if (
        (attributeName === 'aria-labelledby' ||
          attributeName === 'aria-describedby') &&
        !html.includes(`id="${value}"`)
      ) {
        issues.push({
          type: 'error',
          message: `${attributeName} references non-existent ID: ${value}`,
          code: 'aria-valid-reference',
        });
      }

      // aria-hidden="true" with interactive elements
      if (
        attributeName === 'aria-hidden' &&
        value === 'true' &&
        (fullMatch.includes('<button') ||
          fullMatch.includes('<a') ||
          fullMatch.includes('input') ||
          fullMatch.includes('select') ||
          fullMatch.includes('textarea'))
      ) {
        issues.push({
          type: 'error',
          message: `Interactive element with aria-hidden="true". This will hide the element from screen readers but it will still be focusable.`,
          code: 'aria-hidden-interactive',
        });
      }
    }

    // ARIA required context checks
    // Some ARIA roles require a specific parent role
    const roleContextRequirements: Record<string, string[]> = {
      option: ['listbox', 'combobox'],
      menuitem: ['menu', 'menubar'],
      listitem: ['list'],
      row: ['grid', 'rowgroup', 'table', 'treegrid'],
      gridcell: ['row'],
    };

    const elementsWithSpecificRoles =
      html.match(/<[^>]*role=["']([^"']*)["'][^>]*>/g) || [];

    for (const element of elementsWithSpecificRoles) {
      const roleMatch = element.match(/role=["']([^"']*)["']/);
      if (roleMatch && roleMatch[1]) {
        const role = roleMatch[1];

        if (role in roleContextRequirements) {
          // This regex is very simple, a more sophisticated approach would be needed in a real application
          let hasValidParent = false;

          for (const parentRole of roleContextRequirements[role]) {
            if (html.includes(`role="${parentRole}"`)) {
              hasValidParent = true;
              break;
            }
          }

          if (!hasValidParent) {
            issues.push({
              type: 'warning',
              message: `ARIA role '${role}' may be used without required parent context. It should be contained by elements with role: ${roleContextRequirements[role].join(', ')}.`,
              code: 'aria-required-context',
            });
          }
        }
      }
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  },

  // Color contrast analysis
  colorContrast: async (html: string) => {
    const issues = [];

    // Extract CSS definitions
    const styleBlocks = html.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [];
    const inlineStyles = html.match(/style=["']([^"']*)["']/g) || [];

    // Regex for color definitions
    const colorRegex =
      /(#[0-9A-Fa-f]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|hsl\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*\)|black|white|gray|red|green|blue|yellow|purple|orange|pink|brown)/g;

    // Convert Hex color to RGB
    const hexToRgb = (hex: string) => {
      // Expand #RGB format to #RRGGBB
      if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }

      const r = parseInt(hex.substring(1, 3), 16);
      const g = parseInt(hex.substring(3, 5), 16);
      const b = parseInt(hex.substring(5, 7), 16);

      return { r, g, b };
    };

    // Calculate color contrast ratio (WCAG formula)
    const calculateContrast = (
      rgb1: { r: number; g: number; b: number },
      rgb2: { r: number; g: number; b: number }
    ) => {
      // Calculate relative luminance
      const luminance1 = calculateLuminance(rgb1);
      const luminance2 = calculateLuminance(rgb2);

      // Contrast ratio = (L1 + 0.05) / (L2 + 0.05) with L1 > L2
      const lighter = Math.max(luminance1, luminance2);
      const darker = Math.min(luminance1, luminance2);

      return (lighter + 0.05) / (darker + 0.05);
    };

    // Calculate relative luminance (WCAG formula)
    const calculateLuminance = (rgb: { r: number; g: number; b: number }) => {
      // Normalize sRGB values
      let r = rgb.r / 255;
      let g = rgb.g / 255;
      let b = rgb.b / 255;

      // Apply gamma correction
      r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
      g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
      b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

      // Calculate weighted luminance
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    // Simplified color extraction
    const extractColors = (cssText: string): string[] => {
      const colors = cssText.match(colorRegex) || [];
      return colors;
    };

    // Extract colors from CSS
    let allColors: string[] = [];

    styleBlocks.forEach((styleBlock) => {
      const innerCss = styleBlock.replace(/<style[^>]*>|<\/style>/g, '');
      allColors = [...allColors, ...extractColors(innerCss)];
    });

    inlineStyles.forEach((inlineStyle) => {
      const styleContent = inlineStyle.replace(/style=["']|["']/g, '');
      allColors = [...allColors, ...extractColors(styleContent)];
    });

    // Make colors unique
    const uniqueColors = [...new Set(allColors)];

    // Check colors in pairs
    // NOTE: This is a very simplified approach, in the real world you would need to analyze CSS selectors and structure in more detail
    if (uniqueColors.length >= 2) {
      // Let's sample - first 10 color combinations
      for (let i = 0; i < Math.min(10, uniqueColors.length); i++) {
        for (let j = i + 1; j < Math.min(10, uniqueColors.length); j++) {
          const color1 = uniqueColors[i];
          const color2 = uniqueColors[j];

          // Simple sampling - only hex colors
          if (color1.startsWith('#') && color2.startsWith('#')) {
            const rgb1 = hexToRgb(color1);
            const rgb2 = hexToRgb(color2);

            const contrastRatio = calculateContrast(rgb1, rgb2);

            // WCAG 2.1 AA Level: 4.5:1 for normal text, 3:1 for large text
            if (contrastRatio < 4.5) {
              issues.push({
                type: 'warning',
                message: `Potential low contrast ratio (${contrastRatio.toFixed(2)}:1) detected between colors ${color1} and ${color2}. WCAG AA requires at least 4.5:1 for normal text.`,
                code: 'color-contrast',
              });
            }
          }
        }
      }
    }

    // Important note
    if (uniqueColors.length > 0) {
      issues.push({
        type: 'info',
        message:
          'Color contrast analysis is limited. For accurate results, use tools like the WebAIM Color Contrast Checker or Axe for direct testing.',
        code: 'color-contrast-info',
      });
    }

    return {
      passed: issues.filter((issue) => issue.type !== 'info').length === 0,
      issues,
    };
  },

  // Keyboard accessibility check
  keyboardAccessibility: async (html: string) => {
    const issues = [];

    // tabindex check
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

    // Elements with onClick but no keyboard event
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
    } catch (_) {
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

    // Perform the checks
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
        colorContrast: await accessibilityTools.colorContrast(html),
        keyboardAccessibility:
          await accessibilityTools.keyboardAccessibility(html),
        formAccessibility: await accessibilityTools.formAccessibility(html),
      },
    };

    // Calculate summary
    let errors = 0;
    let warnings = 0;
    let total = 0;

    for (const test of Object.values(results.tests)) {
      // Type safety for TypeScript
      const testResult = test as {
        passed: boolean;
        issues: { type: string }[];
      };
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
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in accessibility analysis:', errorMessage);
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
