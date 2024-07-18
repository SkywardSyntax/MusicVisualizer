import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders canvas element', () => {
  render(<App />);
  const canvasElement = screen.getByRole('img');
  expect(canvasElement).toBeInTheDocument();
});

test('renders visuals on canvas', () => {
  render(<App />);
  const canvasElement = screen.getByRole('img');
  const context = canvasElement.getContext('2d');
  expect(context).toBeDefined();
  // Additional checks for visuals can be added here
});
