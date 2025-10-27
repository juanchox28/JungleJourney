import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HotelBookingPage from './HotelBookingPage';

describe('HotelBookingPage', () => {
  it('should render the date selection form', () => {
    render(<HotelBookingPage />);
    expect(screen.getByLabelText('Fecha de Entrada')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha de Salida')).toBeInTheDocument();
    expect(screen.getByText('Número de Huéspedes')).toBeInTheDocument();
  });

  it('should increment and decrement the number of guests', () => {
    render(<HotelBookingPage />);
    const incrementButton = screen.getByText('+');
    const decrementButton = screen.getByText('-');
    const guestCount = screen.getByText('1');

    fireEvent.click(incrementButton);
    expect(guestCount.textContent).toBe('2');

    fireEvent.click(decrementButton);
    expect(guestCount.textContent).toBe('1');
  });
});
