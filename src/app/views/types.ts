/** Contract every route view implements. */
export interface View {
    mount(el: HTMLElement, params: Record<string, string>): void | Promise<void>;
    unmount(): void;
}
