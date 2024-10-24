import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { ThemeContext } from '../../context/ThemeContext';

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }) => (
    <span data-testid={icon.iconName}>faIcon</span>
  ),
}));

describe('Header Component', () => {
  const mockToggleTheme = jest.fn();

  const renderHeader = (theme = 'light') => {
    render(
      <ThemeContext.Provider value={{ theme, toggleTheme: mockToggleTheme }}>
        <Header />
      </ThemeContext.Provider>
    );
  };

  it('renders the logo text', () => {
    renderHeader();

    const logoText = screen.getByText(/A11Y Checker/i);
    expect(logoText).toBeInTheDocument();
  });

  it('renders the sun icon in light mode', () => {
    renderHeader('light');

    const sunIcon = screen.getByTestId('sun');
    expect(sunIcon).toBeInTheDocument();
  });

  it('renders the moon icon in dark mode', () => {
    renderHeader('dark');

    const moonIcon = screen.getByTestId('moon');
    expect(moonIcon).toBeInTheDocument();
  });

  it('calls toggleTheme when the button is clicked', () => {
    renderHeader();

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
