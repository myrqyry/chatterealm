import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HealthBar } from './HealthBar';
import { renderWithProviders } from '@/test/utils';

describe('HealthBar Component', () => {
  describe('Health Percentage Calculation', () => {
    it('should calculate correct percentage for full health', () => {
      renderWithProviders(<HealthBar currentHealth={100} maxHealth={100} />);

      const healthBar = screen.getByText('100/100');
      expect(healthBar).toBeInTheDocument();
    });

    it('should calculate correct percentage for half health', () => {
      renderWithProviders(<HealthBar currentHealth={50} maxHealth={100} />);

      const healthBar = screen.getByText('50/100');
      expect(healthBar).toBeInTheDocument();
    });

    it('should calculate correct percentage for low health', () => {
      renderWithProviders(<HealthBar currentHealth={10} maxHealth={100} />);

      const healthBar = screen.getByText('10/100');
      expect(healthBar).toBeInTheDocument();
    });

    it('should calculate correct percentage for zero health', () => {
      renderWithProviders(<HealthBar currentHealth={0} maxHealth={100} />);

      const healthBar = screen.getByText('0/100');
      expect(healthBar).toBeInTheDocument();
    });
  });

  describe('Health Status Visualization', () => {
    it('should show green status for full health (100%)', () => {
      renderWithProviders(<HealthBar currentHealth={100} maxHealth={100} />);

      const healthBarFill = screen.getByText('100/100').parentElement?.firstChild;
      expect(healthBarFill).toHaveClass('health-status-full');
    });

    it('should show yellow status for medium health (50%)', () => {
      renderWithProviders(<HealthBar currentHealth={50} maxHealth={100} />);

      const healthBarFill = screen.getByText('50/100').parentElement?.firstChild;
      expect(healthBarFill).toHaveClass('health-status-medium');
    });

    it('should show red status for low health (10%)', () => {
      renderWithProviders(<HealthBar currentHealth={10} maxHealth={100} />);

      const healthBarFill = screen.getByText('10/100').parentElement?.firstChild;
      expect(healthBarFill).toHaveClass('health-status-low');
    });

    it('should show critical status for very low health (0-10%)', () => {
      renderWithProviders(<HealthBar currentHealth={5} maxHealth={100} />);

      const healthBarFill = screen.getByText('5/100').parentElement?.firstChild;
      expect(healthBarFill).toHaveClass('health-status-critical');
    });
  });

  describe('Width Calculation', () => {
    it('should set correct width for full health', () => {
      renderWithProviders(<HealthBar currentHealth={100} maxHealth={100} />);

      const healthBarFill = screen.getByText('100/100').parentElement?.firstChild as HTMLElement;
      expect(healthBarFill.style.width).toBe('100%');
    });

    it('should set correct width for half health', () => {
      renderWithProviders(<HealthBar currentHealth={50} maxHealth={100} />);

      const healthBarFill = screen.getByText('50/100').parentElement?.firstChild as HTMLElement;
      expect(healthBarFill.style.width).toBe('50%');
    });

    it('should set correct width for quarter health', () => {
      renderWithProviders(<HealthBar currentHealth={25} maxHealth={100} />);

      const healthBarFill = screen.getByText('25/100').parentElement?.firstChild as HTMLElement;
      expect(healthBarFill.style.width).toBe('25%');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero max health without crashing', () => {
      expect(() => {
        renderWithProviders(<HealthBar currentHealth={0} maxHealth={0} />);
      }).not.toThrow();
    });

    it('should handle negative health values gracefully', () => {
      renderWithProviders(<HealthBar currentHealth={-10} maxHealth={100} />);
      const healthBar = screen.getByText('-10/100');
      expect(healthBar).toBeInTheDocument();
    });

    it('should handle health exceeding max health', () => {
      renderWithProviders(<HealthBar currentHealth={150} maxHealth={100} />);

      const healthBarFill = screen.getByText('150/100').parentElement?.firstChild as HTMLElement;
      // Should clamp at 100% width
      expect(healthBarFill.style.width).toBe('100%');
    });
  });

  describe('Visual Structure', () => {
    it('should have the correct container structure', () => {
      renderWithProviders(<HealthBar currentHealth={75} maxHealth={100} />);

      const container = screen.getByText('75/100').parentElement;
      expect(container).toHaveClass('relative');
      expect(container).toHaveClass('w-full');
      expect(container).toHaveClass('h-4');
    });

    it('should have the correct fill element structure', () => {
      renderWithProviders(<HealthBar currentHealth={75} maxHealth={100} />);

      const fill = screen.getByText('75/100').parentElement?.firstChild;
      expect(fill).toHaveClass('absolute');
      expect(fill).toHaveClass('left-0');
      expect(fill).toHaveClass('top-0');
      expect(fill).toHaveClass('h-full');
    });

    it('should display health text in the center', () => {
      renderWithProviders(<HealthBar currentHealth={75} maxHealth={100} />);

      const text = screen.getByText('75/100');
      expect(text).toHaveClass('absolute');
      expect(text).toHaveClass('left-1/2');
      expect(text).toHaveClass('top-1/2');
      expect(text).toHaveClass('-translate-x-1/2');
      expect(text).toHaveClass('-translate-y-1/2');
      expect(text).toHaveClass('text-xs');
    });
  });
});