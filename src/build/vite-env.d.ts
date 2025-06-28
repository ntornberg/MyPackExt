/// <reference types="vite/client" />
export {}; // Makes this a module so it doesn't pollute global scope

declare global {
    interface Window {
        receiver_ready?: boolean;
        __myPackHookLoaded?: boolean;

    }
}
