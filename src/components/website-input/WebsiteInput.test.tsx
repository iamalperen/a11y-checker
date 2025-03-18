/// <reference types="jest" />
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import WebsiteInput from './WebsiteInput';
import { jest } from '@jest/globals';

// Mock the Next.js useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('WebsiteInput Component', () => {
  it('renders input and button', () => {
    render(<WebsiteInput />);

    // Check if the input field is rendered
    const input = screen.getByPlaceholderText('https://example.com');
    expect(input).toBeInTheDocument();

    // Check if the button is rendered
    const button = screen.getByRole('button', { name: /analyze/i });
    expect(button).toBeInTheDocument();
  });

  it('allows user to enter text in input field', () => {
    render(<WebsiteInput />);

    const input = screen.getByPlaceholderText('https://example.com');
    fireEvent.change(input, { target: { value: 'https://example.com' } });

    expect(input).toHaveValue('https://example.com');
  });

  it('shows error message for invalid URL', () => {
    render(<WebsiteInput />);

    const input = screen.getByPlaceholderText('https://example.com');
    const button = screen.getByRole('button', { name: /analyze/i });

    // Enter invalid URL
    fireEvent.change(input, { target: { value: 'invalid-url' } });
    fireEvent.click(button);

    // Check error message
    const errorMessage = screen.getByText(/Please enter a valid URL/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
