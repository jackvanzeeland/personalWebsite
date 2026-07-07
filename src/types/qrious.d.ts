declare module 'qrious' {
    interface QRiousOptions {
        element?: HTMLCanvasElement;
        value?: string;
        size?: number;
        level?: 'L' | 'M' | 'Q' | 'H';
        foreground?: string;
        background?: string;
        backgroundAlpha?: number;
        foregroundAlpha?: number;
        padding?: number;
        mime?: string;
    }

    export default class QRious {
        constructor(options?: QRiousOptions);
        value: string;
        size: number;
        toDataURL(mime?: string): string;
    }
}
