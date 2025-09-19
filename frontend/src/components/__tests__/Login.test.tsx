import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock API
jest.mock('../../utils/api');

const MockedLogin = () => (
  <BrowserRouter>
    <AuthProvider>
      <Login />
    </AuthProvider>
  </BrowserRouter>
);

describe('Login Component', () => {
  test('renders login form', () => {
    render(<MockedLogin />);
    
    expect(screen.getByText('Hesabınıza Giriş Yapın')).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail adresi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument();
  });

  test('shows validation error for empty form', async () => {
    render(<MockedLogin />);
    
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    fireEvent.click(submitButton);

    // HTML5 validation should prevent submission
    const emailInput = screen.getByLabelText(/e-mail adresi/i);
    expect(emailInput).toBeRequired();
  });

  test('allows user input', () => {
    render(<MockedLogin />);
    
    const emailInput = screen.getByLabelText(/e-mail adresi/i);
    const passwordInput = screen.getByLabelText(/şifre/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('toggles password visibility', () => {
    render(<MockedLogin />);
    
    const passwordInput = screen.getByLabelText(/şifre/i);
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('shows loading state during login', async () => {
    const mockLogin = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(false), 100))
    );
    
    // Mock useAuth hook
    jest.doMock('../../contexts/AuthContext', () => ({
      useAuth: () => ({ login: mockLogin })
    }));
    
    render(<MockedLogin />);
    
    const emailInput = screen.getByLabelText(/e-mail adresi/i);
    const passwordInput = screen.getByLabelText(/şifre/i);
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/giriş yapılıyor/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.getByText(/giriş yap/i)).toBeInTheDocument();
    });
  });
});

describe('Task Component Tests', () => {
  test('renders task list', () => {
    // Task component tests will go here
    expect(true).toBe(true); // Placeholder
  });
});

// Integration Tests
describe('App Integration', () => {
  test('full user journey', async () => {
    // Test full user registration → login → create task → logout flow
    expect(true).toBe(true); // Placeholder
  });
});