/**
 * iframe 事件处理器
 * 用于处理 iframe 内的鼠标、触摸、滚轮等事件
 */

// 常量定义
const DOUBLE_CLICK_INTERVAL_THRESHOLD_MS = 300;
const LONG_HOLD_THRESHOLD = 500;

let lastClickTime = 0;
let longHoldTimeout: ReturnType<typeof setTimeout> | null = null;

interface KeyboardState {
    key: string;
    code: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
}

let keyboardState: KeyboardState = {
    key: '',
    code: '',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false
};

const getKeyStatus = (event?: MouseEvent | WheelEvent | TouchEvent): KeyboardState => {
    if (event && 'ctrlKey' in event) {
        return {
            key: keyboardState.key,
            code: keyboardState.code,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey
        };
    }
    return { ...keyboardState };
};

/**
 * 处理键盘按下事件
 */
export const handleKeydown = (bookKey: string, event: KeyboardEvent): void => {
    keyboardState = {
        key: event.key,
        code: event.code,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey
    };

    if (['Backspace'].includes(event.key)) {
        event.preventDefault();
    }

    window.postMessage(
        {
            type: 'iframe-keydown',
            bookKey,
            key: event.key,
            code: event.code,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey
        },
        '*'
    );
};

/**
 * 处理键盘释放事件
 */
export const handleKeyup = (bookKey: string, event: KeyboardEvent): void => {
    keyboardState = {
        key: '',
        code: '',
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey
    };

    window.postMessage(
        {
            type: 'iframe-keyup',
            bookKey,
            key: event.key,
            code: event.code,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey
        },
        '*'
    );
};

/**
 * 处理鼠标按下事件
 */
export const handleMousedown = (bookKey: string, event: MouseEvent): void => {
    longHoldTimeout = setTimeout(() => {
        longHoldTimeout = null;
    }, LONG_HOLD_THRESHOLD);

    window.postMessage(
        {
            type: 'iframe-mousedown',
            bookKey,
            button: event.button,
            screenX: event.screenX,
            screenY: event.screenY,
            clientX: event.clientX,
            clientY: event.clientY,
            offsetX: event.offsetX,
            offsetY: event.offsetY,
            ...getKeyStatus(event)
        },
        '*'
    );
};

/**
 * 处理鼠标释放事件
 */
export const handleMouseup = (bookKey: string, event: MouseEvent): void => {
    if (longHoldTimeout) {
        clearTimeout(longHoldTimeout);
        longHoldTimeout = null;
    }

    const now = Date.now();
    const isDoubleClick = now - lastClickTime < DOUBLE_CLICK_INTERVAL_THRESHOLD_MS;
    lastClickTime = now;

    window.postMessage(
        {
            type: 'iframe-mouseup',
            bookKey,
            button: event.button,
            screenX: event.screenX,
            screenY: event.screenY,
            clientX: event.clientX,
            clientY: event.clientY,
            offsetX: event.offsetX,
            offsetY: event.offsetY,
            isDoubleClick,
            ...getKeyStatus(event)
        },
        '*'
    );
};

/**
 * 处理鼠标点击事件
 */
export const handleClick = (bookKey: string, event: MouseEvent): void => {
    const now = Date.now();
    const isDoubleClick = now - lastClickTime < DOUBLE_CLICK_INTERVAL_THRESHOLD_MS;
    lastClickTime = now;

    window.postMessage(
        {
            type: 'iframe-single-click',
            bookKey,
            screenX: event.screenX,
            screenY: event.screenY,
            clientX: event.clientX,
            clientY: event.clientY,
            isDoubleClick,
            ...getKeyStatus(event)
        },
        '*'
    );
};

/**
 * 处理滚轮事件
 */
export const handleWheel = (bookKey: string, event: WheelEvent): void => {
    window.postMessage(
        {
            type: 'iframe-wheel',
            bookKey,
            deltaX: event.deltaX,
            deltaY: event.deltaY,
            deltaZ: event.deltaZ,
            deltaMode: event.deltaMode,
            ...getKeyStatus(event)
        },
        '*'
    );
};

/**
 * 处理触摸开始事件
 */
export const handleTouchStart = (bookKey: string, event: TouchEvent): void => {
    longHoldTimeout = setTimeout(() => {
        longHoldTimeout = null;
    }, LONG_HOLD_THRESHOLD);

    const touches = Array.from(event.touches).map((touch) => ({
        identifier: touch.identifier,
        screenX: touch.screenX,
        screenY: touch.screenY,
        clientX: touch.clientX,
        clientY: touch.clientY
    }));

    window.postMessage(
        {
            type: 'iframe-touchstart',
            bookKey,
            touches
        },
        '*'
    );
};

/**
 * 处理触摸移动事件
 */
export const handleTouchMove = (bookKey: string, event: TouchEvent): void => {
    const touches = Array.from(event.touches).map((touch) => ({
        identifier: touch.identifier,
        screenX: touch.screenX,
        screenY: touch.screenY,
        clientX: touch.clientX,
        clientY: touch.clientY
    }));

    window.postMessage(
        {
            type: 'iframe-touchmove',
            bookKey,
            touches
        },
        '*'
    );
};

/**
 * 处理触摸结束事件
 */
export const handleTouchEnd = (bookKey: string, event: TouchEvent): void => {
    if (longHoldTimeout) {
        clearTimeout(longHoldTimeout);
        longHoldTimeout = null;
    }

    const changedTouches = Array.from(event.changedTouches).map((touch) => ({
        identifier: touch.identifier,
        screenX: touch.screenX,
        screenY: touch.screenY,
        clientX: touch.clientX,
        clientY: touch.clientY
    }));

    window.postMessage(
        {
            type: 'iframe-touchend',
            bookKey,
            changedTouches
        },
        '*'
    );
};
