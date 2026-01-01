/**
 * Enhanced render utilities for testing
 */

import type { RenderResult } from '@testing-library/react';
import { render, waitFor } from '@testing-library/react';

/**
 * Wait for all loading indicators to disappear
 */
export const waitForLoadingToFinish = async (container?: HTMLElement) => {
  await waitFor(
    () => {
      const spinners = (container || document.body).querySelectorAll('[data-testid="loading"]');
      const loadingTexts = (container || document.body).querySelectorAll('[aria-busy="true"]');
      expect(spinners.length + loadingTexts.length).toBe(0);
    },
    { timeout: 5000 }
  );
};

/**
 * Wait for element to be removed from DOM
 */
export const waitForElementToBeRemoved = async (selector: string, timeout = 3000) => {
  await waitFor(
    () => {
      expect(document.querySelector(selector)).not.toBeInTheDocument();
    },
    { timeout }
  );
};

/**
 * Debug render with better formatting
 */
export const debugRender = (result: RenderResult, maxLength = 7000) => {
  const { container } = result;
  console.log('\n=== DOM Debug ===');
  const html = container.innerHTML;
  if (html.length > maxLength) {
    console.log(html.substring(0, maxLength) + '\n... (truncated)');
  } else {
    console.log(html);
  }
  console.log('=================\n');
};

/**
 * Find all elements with text content matching pattern
 */
export const findAllByTextContent = (text: string | RegExp, container?: HTMLElement): Element[] => {
  const root = container || document.body;
  const elements: Element[] = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);

  while (walker.nextNode()) {
    const node = walker.currentNode as Element;
    const textContent = node.textContent || '';

    if (typeof text === 'string') {
      if (textContent.includes(text)) {
        elements.push(node);
      }
    } else {
      if (text.test(textContent)) {
        elements.push(node);
      }
    }
  }

  return elements;
};

/**
 * Check if element is visible (not hidden by CSS)
 */
export const isElementVisible = (element: HTMLElement): boolean => {
  if (!element) return false;

  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetHeight > 0 &&
    element.offsetWidth > 0
  );
};

/**
 * Get all form validation errors
 */
export const getFormErrors = (container?: HTMLElement): string[] => {
  const root = container || document.body;
  const errorElements = root.querySelectorAll('[role="alert"], .error-message, [aria-invalid="true"]');

  return Array.from(errorElements)
    .map((el) => el.textContent?.trim() || '')
    .filter(Boolean);
};

/**
 * Fill form with data using custom query function
 */
export const fillFormWithQuery = async (
  formData: Record<string, string>,
  getByLabelText: (text: string | RegExp) => HTMLElement
) => {
  const userEvent = (await import('@testing-library/user-event')).default;
  const user = userEvent.setup();

  for (const [label, value] of Object.entries(formData)) {
    const input = getByLabelText(new RegExp(label, 'i'));
    await user.clear(input);
    await user.type(input, value);
  }
};

/**
 * Render with automatic cleanup logging
 */
export const renderWithCleanup = (ui: React.ReactElement, options?: any) => {
  const result = render(ui, options);

  // Log cleanup for debugging
  const originalUnmount = result.unmount;
  result.unmount = () => {
    console.log('🧹 Cleaning up component...');
    originalUnmount();
  };

  return result;
};
