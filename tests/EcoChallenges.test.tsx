import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EcoChallenges } from '../src/components/EcoChallenges.jsx';
import { api } from '../src/services/api.js';

// Mock the API service
vi.mock('../src/services/api.js', () => ({
  api: {
    listChallenges: vi.fn(),
    completeChallenge: vi.fn()
  }
}));

describe('EcoChallenges Component', () => {
  const mockOnChallengeCompleted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading states correctly', () => {
    vi.mocked(api.listChallenges).mockReturnValue(new Promise(() => {}));
    render(<EcoChallenges onChallengeCompleted={mockOnChallengeCompleted} />);
    expect(screen.getByText('Loading weekly eco-challenges...')).toBeDefined();
  });

  it('renders empty card when no challenges exist', async () => {
    vi.mocked(api.listChallenges).mockResolvedValue([]);
    render(<EcoChallenges onChallengeCompleted={mockOnChallengeCompleted} />);

    await waitFor(() => {
      expect(screen.getByText('No challenges available.')).toBeDefined();
    });
  });

  it('renders challenges listing and handles complete button actions successfully', async () => {
    const mockChallenges = [
      {
        id: 'chal-1',
        title: 'Meatless Monday',
        description: 'Skip meat for today.',
        points: 50,
        category: 'Food',
        difficulty: 'Easy',
        completed: false
      },
      {
        id: 'chal-2',
        title: 'Commute by Train',
        description: 'Take train instead of driving.',
        points: 100,
        category: 'Transportation',
        difficulty: 'Medium',
        completed: true
      }
    ];

    vi.mocked(api.listChallenges).mockResolvedValue(mockChallenges as any);
    vi.mocked(api.completeChallenge).mockResolvedValue({} as any);

    render(<EcoChallenges onChallengeCompleted={mockOnChallengeCompleted} />);

    await waitFor(() => {
      expect(screen.getByText('Meatless Monday')).toBeDefined();
      expect(screen.getByText('Commute by Train')).toBeDefined();
      expect(screen.getByText('Completed')).toBeDefined(); // Completed status for chal-2
      expect(screen.getByRole('button', { name: /Mark Completed/i })).toBeDefined(); // Button for chal-1
    });

    // Check SVG progress circle is in the DOM
    const progressChart = screen.getByRole('img', { name: /Challenges completion progress: 50%/i });
    expect(progressChart).toBeDefined();

    // Click Complete on Meatless Monday
    const completeBtn = screen.getByRole('button', { name: /Mark Completed/i });
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(api.completeChallenge).toHaveBeenCalledTimes(1);
      expect(api.completeChallenge).toHaveBeenCalledWith('chal-1');
      expect(mockOnChallengeCompleted).toHaveBeenCalledTimes(1);
    });
  });

  it('displays API error banner when completeChallenge fails', async () => {
    const mockChallenges = [
      {
        id: 'chal-1',
        title: 'Meatless Monday',
        description: 'Skip meat for today.',
        points: 50,
        category: 'Food',
        difficulty: 'Easy',
        completed: false
      }
    ];

    vi.mocked(api.listChallenges).mockResolvedValue(mockChallenges as any);
    vi.mocked(api.completeChallenge).mockRejectedValue(new Error('Complete challenge API error.'));

    render(<EcoChallenges onChallengeCompleted={mockOnChallengeCompleted} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Mark Completed/i })).toBeDefined();
    });

    const completeBtn = screen.getByRole('button', { name: /Mark Completed/i });
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(screen.getByText('Complete challenge API error.')).toBeDefined();
    });
  });
});
