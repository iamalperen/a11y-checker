import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import WebsiteInput from './WebsiteInput';
import styles from './WebsiteInput.module.css';

describe('WebsiteInput Component', () => {
  it('renders input and button', () => {
    render(<WebsiteInput />);

    // Check if the input field is rendered
    const input = screen.getByPlaceholderText('Enter website URL');
    expect(input).toBeInTheDocument();

    // Check if the button is rendered
    const button = screen.getByRole('button', { name: /analyze/i });
    expect(button).toBeInTheDocument();
  });

  it('allows user to enter text in input field', () => {
    render(<WebsiteInput />);

    const input = screen.getByPlaceholderText('Enter website URL');
    fireEvent.change(input, { target: { value: 'https://example.com' } });

    expect(input).toHaveValue('https://example.com');
  });

  it('triggers an action when the button is clicked', () => {
    const handleClick = jest.fn();
    render(
      <div className={styles.inputContainer}>
        <input
          type="text"
          className={styles.input}
          placeholder="Enter website URL"
        />
        <button className={styles.button} onClick={handleClick}>
          Analyze
        </button>
      </div>
    );

    const button = screen.getByRole('button', { name: /analyze/i });
    fireEvent.click(button);

    // Check if handleClick was called
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
