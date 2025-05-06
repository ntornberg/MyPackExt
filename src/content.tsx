import React from 'react';
import { createRoot } from 'react-dom/client';

const App: React.FC = () => {
    return (
        <div style={{ padding: '1rem' }}>
            <h2>📚 MyPack Enhancer</h2>
            <p>React injected into MyPack via Chrome Extension!</p>
        </div>
    );
};

const mount = document.createElement('div');
mount.id = 'mypack-sidebar';
Object.assign(mount.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    width: '300px',
    height: '100%',
    backgroundColor: '#fff',
    zIndex: '999999',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
});

document.body.appendChild(mount);
const root = createRoot(mount);
root.render(<App />);
const observer = new MutationObserver(() => {
    const results = document.querySelectorAll(".some-class-you-identify");
    if (results.length > 0) {
        console.log("Course results found", results);
        observer.disconnect(); // stop watching
    }
});

observer.observe(document.body, { childList: true, subtree: true });