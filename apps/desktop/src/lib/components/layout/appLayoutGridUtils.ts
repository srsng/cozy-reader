function applyAppLayoutGridVar(name: string, value: string): () => void {
    const appLayout = document.querySelector<HTMLElement>('.app-layout');
    if (!appLayout) {
        return () => {};
    }

    appLayout.style.setProperty(name, value);

    return () => {
        appLayout.style.removeProperty(name);
    };
}

export function hideAppLayoutHeader(): () => void {
    return applyAppLayoutGridVar('--header-h', '0');
}

export function setAppLayoutHeaderHeight(value: string): () => void {
    return applyAppLayoutGridVar('--header-h', value);
}

export function hideAppLayoutFooter(): () => void {
    return applyAppLayoutGridVar('--footer-h', '0');
}

export function setAppLayoutFooterHeight(value: string): () => void {
    return applyAppLayoutGridVar('--footer-h', value);
}

export function closeAppLayoutLeftAside(): () => void {
    return applyAppLayoutGridVar('--aside-l-width', '0');
}

export function setAppLayoutLeftAsideWidth(value: string): () => void {
    return applyAppLayoutGridVar('--aside-l-width', value);
}

export function closeAppLayoutRightAside(): () => void {
    return applyAppLayoutGridVar('--aside-r-width', '0');
}

export function setAppLayoutRightAsideWidth(value: string): () => void {
    return applyAppLayoutGridVar('--aside-r-width', value);
}
