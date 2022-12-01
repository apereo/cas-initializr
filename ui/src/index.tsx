import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.scss';
import App from './app/App';

const container = document.getElementById("app-root") as Element;
const root = createRoot(container);

root.render(<App />);

