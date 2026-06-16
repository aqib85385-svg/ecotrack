import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Layout } from '../src/components/Layout.jsx';
import { api } from '../src/services/api.js';

// Mock the API service
vi.mock('../src/services/api.js', () => ({
  api: {
    seedDemo: vi.fn()
  }
}));

describe('Layout & JudgePanel Component', () => {
  const mockSetActiveTab = vi.fn();
  const mockOnRefresh = vi.fn();

  const mockStats = {
    points: 120,
    streak: 3,
    completedChallenges: ['chal-1'],
    unlockedAchievements: ['ach-1'],
    lastActive: '2026-06-16T12:00:00Z'
  };

  const mockConfig = {
    ENABLE_AI: true,
    ENABLE_CARBON_TWIN: true,
    ENABLE_GAMIFICATION: true,
    ENABLE_BENCHMARKING: true,
    ENABLE_SCENARIO_PLANNER: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Judge Panel headers, user stats, and navigation items correctly', () => {
    render(
      <Layout
        activeTab="calculator"
        setActiveTab={mockSetActiveTab}
        stats={mockStats}
        riskLevel="Low"
        persona="Student"
        onRefresh={mockOnRefresh}
        config={mockConfig}
      >
        <div data-testid="child-content">Workspace Workspace</div>
      </Layout>
    );

    // Verify Judge Panel is visible
    expect(screen.getByText('JUDGE PANEL')).toBeDefined();
    expect(screen.getAllByText('Student')).toHaveLength(2); // Student persona button & active persona status label
    expect(screen.getByText('Eco-Pro')).toBeDefined(); // Eco-Conscious User persona button label mapping
    
    // Verify Header stats display
    expect(screen.getByText('Points:')).toBeDefined();
    expect(screen.getByText('120')).toBeDefined();
    expect(screen.getByText('Streak:')).toBeDefined();
    expect(screen.getByText('3w')).toBeDefined();
    expect(screen.getByText('Risk:')).toBeDefined();
    expect(screen.getByText('Low')).toBeDefined();

    // Verify Child content rendered
    expect(screen.getByTestId('child-content')).toBeDefined();
  });

  it('handles user clicking navigation items to set active tabs', () => {
    render(
      <Layout
        activeTab="calculator"
        setActiveTab={mockSetActiveTab}
        stats={mockStats}
        riskLevel="Low"
        persona="Student"
        onRefresh={mockOnRefresh}
        config={mockConfig}
      >
        <div>Workspace</div>
      </Layout>
    );

    const coachTab = screen.getByRole('button', { name: /AI Coach/i });
    fireEvent.click(coachTab);

    expect(mockSetActiveTab).toHaveBeenCalledTimes(1);
    expect(mockSetActiveTab).toHaveBeenCalledWith('coach');
  });

  it('submits seed requests and shows success status on seeder button click', async () => {
    vi.mocked(api.seedDemo).mockResolvedValue({ message: 'Demo profile seeded successfully.' });

    render(
      <Layout
        activeTab="calculator"
        setActiveTab={mockSetActiveTab}
        stats={mockStats}
        riskLevel="Low"
        persona="Student"
        onRefresh={mockOnRefresh}
        config={mockConfig}
      >
        <div>Workspace</div>
      </Layout>
    );

    // Click on Professional profile seed button
    const professionalBtn = screen.getByRole('button', { name: 'Professional' });
    fireEvent.click(professionalBtn);

    await waitFor(() => {
      expect(api.seedDemo).toHaveBeenCalledTimes(1);
      expect(api.seedDemo).toHaveBeenCalledWith('Professional');
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Demo profile seeded successfully.')).toBeDefined();
    });
  });
});
