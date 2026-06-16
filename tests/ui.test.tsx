import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../src/components/UI/Button.jsx';
import { Card } from '../src/components/UI/Card.jsx';
import { Input } from '../src/components/UI/Input.jsx';
import { ErrorBoundary } from '../src/components/UI/ErrorBoundary.jsx';

describe('UI Primitives Unit Tests', () => {
  // 1. Button component tests
  describe('Button Component', () => {
    it('renders children content correctly', () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByText('Click Me')).toBeDefined();
    });

    it('displays loading spinner and is disabled when loading is true', () => {
      render(<Button loading={true}>Submit</Button>);
      const spinner = screen.getByRole('status', { name: 'Loading' });
      expect(spinner).toBeDefined();
      
      const button = screen.getByRole('button');
      expect(button.getAttribute('disabled')).not.toBeNull();
    });

    it('triggers onClick callback when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      fireEvent.click(screen.getByText('Click Me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is set to true', () => {
      render(<Button disabled={true}>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button.getAttribute('disabled')).not.toBeNull();
    });
  });

  // 2. Card component tests
  describe('Card Component', () => {
    it('renders children content correctly', () => {
      render(
        <Card>
          <div data-testid="card-child">Inner Child</div>
        </Card>
      );
      expect(screen.getByTestId('card-child')).toBeDefined();
      expect(screen.getByText('Inner Child')).toBeDefined();
    });

    it('applies custom className binding correctly', () => {
      const { container } = render(<Card className="custom-class-name">Card Content</Card>);
      expect(container.firstChild).toBeDefined();
      expect((container.firstChild as HTMLElement).className).toContain('custom-class-name');
    });
  });

  // 3. Input component tests
  describe('Input Component', () => {
    it('renders with label and id binding correctly', () => {
      render(<Input label="Username" id="username-input" placeholder="Enter username" />);
      const label = screen.getByText('Username');
      expect(label).toBeDefined();
      expect(label.getAttribute('for')).toBe('username-input');

      const input = screen.getByPlaceholderText('Enter username');
      expect(input).toBeDefined();
      expect(input.id).toBe('username-input');
    });

    it('propagates value changes on user input typing', () => {
      const handleChange = vi.fn();
      render(<Input placeholder="Type here" onChange={handleChange} />);
      const input = screen.getByPlaceholderText('Type here') as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: 'Eco Green' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(input.value).toBe('Eco Green');
    });

    it('renders danger border layout styles when error string is present', () => {
      render(<Input error="Field required" placeholder="Validation Input" />);
      const errorText = screen.getByText('Field required');
      expect(errorText).toBeDefined();

      const input = screen.getByPlaceholderText('Validation Input');
      expect(input.className).toContain('border-brand-danger');
    });
  });

  // 4. ErrorBoundary component tests
  describe('ErrorBoundary Component', () => {
    const ProblematicComponent = () => {
      throw new Error('Component crashed');
    };

    it('renders children normally when there is no error thrown', () => {
      render(
        <ErrorBoundary>
          <p data-testid="safe-element">Safe content</p>
        </ErrorBoundary>
      );
      expect(screen.getByTestId('safe-element')).toBeDefined();
      expect(screen.queryByText('Something went wrong.')).toBeNull();
    });

    it('catches exceptions and displays fallback UI when a child crashes', () => {
      // Prevent console.error output polluting test logs
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ProblematicComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong.')).toBeDefined();
      expect(screen.getByText('Component crashed')).toBeDefined();

      consoleErrorSpy.mockRestore();
    });
  });
});
