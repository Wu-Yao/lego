import React from 'react';
import { HashRouter, Routes } from 'react-router-dom';
import './index.css';
import AppLayout from './AppLayout';

class App extends React.PureComponent {
    render() {
        return (
            <HashRouter>
                <Routes>
                    <AppLayout />
                </Routes>
            </HashRouter>
        );
    }
}

export default App;
/* jscpd:ignore-end */
