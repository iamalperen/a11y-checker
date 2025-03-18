# A11Y Checker

A comprehensive web accessibility analysis tool that helps developers identify and fix accessibility issues in their websites.

## Features

- **Website Analyzer**: Comprehensive accessibility analysis of any website by entering its URL.
- **Enhanced ARIA Validation**: In-depth analysis of ARIA attributes and roles, checking for:
  - Deprecated ARIA roles
  - Redundant ARIA roles on semantic HTML elements
  - Empty ARIA attributes
  - Invalid ARIA references
  - Proper parent-child relationships according to WAI-ARIA specifications
  - Interactive elements with `aria-hidden="true"`
- **Color Contrast Analysis**: Advanced color contrast checking that:
  - Extracts colors from CSS and inline styles
  - Calculates contrast ratios according to WCAG formula
  - Identifies color combinations that don't meet WCAG 2.1 AA standards (4.5:1 for normal text)
- **Keyboard Accessibility Testing**: Identifies elements that may not be accessible without a mouse.
- **Form Accessibility Checking**: Ensures form elements have proper labels and IDs.
- **HTML Structure Analysis**: Checks for proper heading hierarchy and image alt attributes.

## Technology Stack

- Next.js 15
- TypeScript
- React
- CSS Modules
- Font Awesome

## Getting Started

### Prerequisites

- Node.js (18.x or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/a11y-checker.git
   cd a11y-checker
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. Enter a website URL in the input field on the homepage
2. Click "Analyze" to start the accessibility analysis
3. View the detailed results, including:
   - HTML structure issues
   - ARIA implementation problems
   - Color contrast warnings
   - Keyboard accessibility concerns
   - Form accessibility recommendations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WAI-ARIA Specifications](https://www.w3.org/TR/wai-aria-1.2/)
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
