import React from 'react';
import ReactDOM from 'react-dom';
import './styles/globals.css'; // Make sure this points to the correct file
import App from './App';
// import reportWebVitals from './reportWebVitals';
import { initDevSetup } from './setupDev';

// Initialize development setup
if (process.env.NODE_ENV === 'development') {
  initDevSetup();
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
