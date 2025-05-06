import React from 'react';
import { createRoot } from 'react-dom/client';

const Popup: React.FC = () => {
    return (
        <div style={{ padding: '1rem', width: '300px' }}>
            <h2>📚 MyPack Helper</h2>
            <p>This extension makes course selection easier.</p>
            <button
                onClick={() => {
                    chrome.tabs.create({ url: 'https://portalsp.acs.ncsu.edu/' });
                }}
                style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#0066cc',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Open MyPack
            </button>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
