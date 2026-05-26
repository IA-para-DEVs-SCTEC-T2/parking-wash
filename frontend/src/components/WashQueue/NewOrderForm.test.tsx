import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NewOrderForm } from './NewOrderForm';
import * as washOrdersApi from '../../api/washOrders';
import * as washServicesApi from '../../api/washServices';

// Mock the API modules
vi.mock('../../api/washOrders');
vi.mock('../../api/washServices');

describe('NewOrderForm', () => {
  const mockWashServices = [
    { id: '1', name: 'Lavagem Simples', price: 30.0, duration_estimate: 15 },
    { id: '2', name: 'Lavagem Completa', price: 50.0, duration_estimate: 30 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(washServicesApi.listWashServices).mockResolvedValue(mockWashServices);
  });

  it('should render the form with all fields', async () => {
    const onSuccess = vi.fn();
    render(<NewOrderForm onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Placa do Veículo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Serviço de Lavagem/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Nova Ordem/i })).toBeInTheDocument();
    });
  });

  it('should load wash services on mount', async () => {
    const onSuccess = vi.fn();
    render(<NewOrderForm onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(washServicesApi.listWashServices).toHaveBeenCalled();
    });

    // Check that services are rendered in the select
    const select = screen.getByLabelText(/Serviço de Lavagem/i) as HTMLSelectElement;
    expect(select.options.length).toBe(2);
    expect(select.options[0].text).toContain('Lavagem Simples');
    expect(select.options[1].text).toContain('Lavagem Completa');
  });

  it('should disable the button when license plate is empty', async () => {
    const onSuccess = vi.fn();
    render(<NewOrderForm onSuccess={onSuccess} />);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /Nova Ordem/i });
      expect(button).toBeDisabled();
    });
  });

  it('should disable the button when license plate is invalid', async () => {
    const onSuccess = vi.fn();
    render(<NewOrderForm onSuccess={onSuccess} />);

    await waitFor(() => {
      const input = screen.getByLabelText(/Placa do Veículo/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'INVALID' } });
    });

    const button = screen.getByRole('button', { name: /Nova Ordem/i });
    expect(button).toBeDisabled();
  });

  it('should enable the button when license plate is valid (legacy format)', async () => {
    const onSuccess = vi.fn();
    render(<NewOrderForm onSuccess={onSuccess} />);

    await waitFor(() => {
      const input = screen.getByLabelText(/Placa do Veículo/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'ABC-1234' } });
    });

    const button = screen.getByRole('button', { name: /Nova Ordem/i });
    expect(button).not.toBeDisabled();
  });

  it('should enable the button when license plate is valid (Mercosul format)', async () => {
    const onSuccess = vi.fn();
    render(<NewOrderForm onSuccess={onSuccess} />);

    await waitFor(() => {
      const input = screen.getByLabelText(/Placa do Veículo/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'ABC1D23' } });
    });

    const button = screen.getByRole('button', { name: /Nova Ordem/i });
    expect(button).not.toBeDisabled();
  });

  it('should show validation error for invalid license plate', async () => {
    const onSuccess = vi.fn();
    render(<NewOrderForm onSuccess={onSuccess} />);

    await waitFor(() => {
      const input = screen.getByLabelText(/Placa do Veículo/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'INVALID' } });
    });

    expect(screen.getByText(/Placa inválida/i)).toBeInTheDocument();
  });

  it('should submit the form with valid data', async () => {
    const onSuccess = vi.fn();
    vi.mocked(washOrdersApi.createWashOrder).mockResolvedValue({
      id: '123',
      licensePlate: 'ABC-1234',
      washService: { id: '1', name: 'Lavagem Simples', price: 30.0 },
      status: 'Waiting',
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
    });

    render(<NewOrderForm onSuccess={onSuccess} />);

    await waitFor(() => {
      const input = screen.getByLabelText(/Placa do Veículo/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'ABC-1234' } });
    });

    const button = screen.getByRole('button', { name: /Nova Ordem/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(washOrdersApi.createWashOrder).toHaveBeenCalledWith('ABC-1234', '1');
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should clear the form after successful submission', async () => {
    const onSuccess = vi.fn();
    vi.mocked(washOrdersApi.createWashOrder).mockResolvedValue({
      id: '123',
      licensePlate: 'ABC-1234',
      washService: { id: '1', name: 'Lavagem Simples', price: 30.0 },
      status: 'Waiting',
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
    });

    render(<NewOrderForm onSuccess={onSuccess} />);

    await waitFor(() => {
      const input = screen.getByLabelText(/Placa do Veículo/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'ABC-1234' } });
    });

    const button = screen.getByRole('button', { name: /Nova Ordem/i });
    fireEvent.click(button);

    await waitFor(() => {
      const input = screen.getByLabelText(/Placa do Veículo/i) as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });

  it('should display API error message on failure', async () => {
    const onSuccess = vi.fn();
    vi.mocked(washOrdersApi.createWashOrder).mockRejectedValue({
      error: 'Serviço de lavagem não encontrado',
      statusCode: 422,
    });

    render(<NewOrderForm onSuccess={onSuccess} />);

    await waitFor(() => {
      const input = screen.getByLabelText(/Placa do Veículo/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'ABC-1234' } });
    });

    const button = screen.getByRole('button', { name: /Nova Ordem/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Serviço de lavagem não encontrado/i)).toBeInTheDocument();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  it('should display fallback error message when API error has no message', async () => {
    const onSuccess = vi.fn();
    vi.mocked(washOrdersApi.createWashOrder).mockRejectedValue({
      statusCode: 500,
    });

    render(<NewOrderForm onSuccess={onSuccess} />);

    await waitFor(() => {
      const input = screen.getByLabelText(/Placa do Veículo/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'ABC-1234' } });
    });

    const button = screen.getByRole('button', { name: /Nova Ordem/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Erro inesperado/i)).toBeInTheDocument();
    });
  });
});
