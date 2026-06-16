import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuditLogViewer } from '../src/components/AuditLogViewer.jsx';
import { api } from '../src/services/api.js';

// Mock the API service
vi.mock('../src/services/api.js', () => ({
  api: {
    getAuditLogs: vi.fn()
  }
}));

describe('AuditLogViewer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading states correctly', () => {
    vi.mocked(api.getAuditLogs).mockReturnValue(new Promise(() => {}));
    render(<AuditLogViewer />);
    expect(screen.getByText('Querying audit trail database...')).toBeDefined();
  });

  it('renders empty log message when no logs exist', async () => {
    vi.mocked(api.getAuditLogs).mockResolvedValue([]);
    render(<AuditLogViewer />);
    await waitFor(() => {
      expect(screen.getByText('Audit log file is empty.')).toBeDefined();
    });
  });

  it('renders audit logs listing successfully', async () => {
    const mockLogs = [
      {
        id: 'audit-1',
        eventType: 'CALCULATION_CREATED',
        timestamp: '2026-06-16T12:00:00.000Z',
        userId: 'judge-user',
        metadata: { score: 91 }
      }
    ];

    vi.mocked(api.getAuditLogs).mockResolvedValue(mockLogs as any);
    render(<AuditLogViewer />);

    await waitFor(() => {
      expect(screen.getByText('Audit Trail Logs Terminal')).toBeDefined();
      expect(screen.getByText('CALCULATION_CREATED')).toBeDefined();
      expect(screen.getByText(/ID: audit-1/)).toBeDefined();
    });
  });

  it('triggers reload when refresh button is clicked', async () => {
    vi.mocked(api.getAuditLogs).mockResolvedValue([]);
    render(<AuditLogViewer />);

    await waitFor(() => {
      expect(screen.getByText('Audit log file is empty.')).toBeDefined();
    });

    const refreshBtn = screen.getByRole('button');
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(api.getAuditLogs).toHaveBeenCalledTimes(2);
    });
  });

  it('renders error states correctly on API failure', async () => {
    vi.mocked(api.getAuditLogs).mockRejectedValue(new Error('Audit DB is corrupt.'));
    render(<AuditLogViewer />);

    await waitFor(() => {
      expect(screen.getByText('Audit DB is corrupt.')).toBeDefined();
    });
  });
});
