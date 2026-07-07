import { describe, it, expect } from 'vitest';

describe('test environment', () => {
    it('has a DOM', () => {
        document.body.innerHTML = '<p id="x">hi</p>';
        expect(document.getElementById('x')?.textContent).toBe('hi');
    });
});
