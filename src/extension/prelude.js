const __psDefine = window.define;
Object.defineProperty(window, 'define', {
    value: undefined,
    configurable: true
});
// expose for later:
window.__psDefine = __psDefine;
