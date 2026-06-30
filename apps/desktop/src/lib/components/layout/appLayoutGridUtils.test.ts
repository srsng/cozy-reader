import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    closeAppLayoutLeftAside,
    closeAppLayoutRightAside,
    hideAppLayoutFooter,
    hideAppLayoutHeader,
    setAppLayoutFooterHeight,
    setAppLayoutHeaderHeight,
    setAppLayoutLeftAsideWidth,
    setAppLayoutRightAsideWidth
} from './appLayoutGridUtils';

describe('app layout grid utils', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it.each([
        ['setAppLayoutHeaderHeight', () => setAppLayoutHeaderHeight('4rem'), '--header-h', '4rem'],
        ['hideAppLayoutHeader', () => hideAppLayoutHeader(), '--header-h', '0'],
        ['setAppLayoutFooterHeight', () => setAppLayoutFooterHeight('1rem'), '--footer-h', '1rem'],
        ['hideAppLayoutFooter', () => hideAppLayoutFooter(), '--footer-h', '0'],
        ['setAppLayoutLeftAsideWidth', () => setAppLayoutLeftAsideWidth('16rem'), '--aside-l-width', '16rem'],
        ['closeAppLayoutLeftAside', () => closeAppLayoutLeftAside(), '--aside-l-width', '0'],
        ['setAppLayoutRightAsideWidth', () => setAppLayoutRightAsideWidth('20rem'), '--aside-r-width', '20rem'],
        ['closeAppLayoutRightAside', () => closeAppLayoutRightAside(), '--aside-r-width', '0']
    ])('%s sets the expected grid override and removes it on dispose', (_name, run, variableName, value) => {
        const setProperty = vi.fn();
        const removeProperty = vi.fn();
        const appLayout = {
            style: {
                setProperty,
                removeProperty
            }
        };
        const querySelector = vi.fn((_selector: string) => appLayout);

        vi.stubGlobal('document', {
            querySelector
        });

        const dispose = run();

        expect(querySelector).toHaveBeenCalledWith('.app-layout');
        expect(setProperty).toHaveBeenCalledWith(variableName, value);

        dispose();

        expect(removeProperty).toHaveBeenCalledWith(variableName);
    });

    it('is a no-op when app layout is missing', () => {
        const querySelector = vi.fn((_selector: string) => null);

        vi.stubGlobal('document', {
            querySelector
        });

        const dispose = hideAppLayoutHeader();

        expect(querySelector).toHaveBeenCalledWith('.app-layout');
        expect(() => dispose()).not.toThrow();
    });
});
