
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("App Render Error:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; text-align: center;">
      <h2>⚠️ অ্যাপ লোড হতে সমস্যা হচ্ছে</h2>
      <p>অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ চেক করুন এবং পেজটি রিফ্রেশ দিন।</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; background: #10b981; color: white; border: none; rounded: 8px;">রিফ্রেশ দিন</button>
    </div>
  `;
}
