// InsightAI Website JavaScript - Local Backend Version
// Created by NeuroGestAI

console.log('InsightAI JavaScript loaded successfully!');

// ============================================================================
// CONFIGURATION - UPDATE THESE FOR YOUR SETUP
// ============================================================================

// Your local IP address (find it by running 'ipconfig' in command prompt)
const LOCAL_IP = '192.168.1.102'; // ✅ CONFIGURED - Your actual IP address

// API endpoints
const API_BASE = `http://${LOCAL_IP}:5002`;
const PAYMENT_API = `http://${LOCAL_IP}:5004`;
const EMAIL_API = `http://${LOCAL_IP}:5003`;

// Backend status
let backendOnline = false;

// ============================================================================
// BACKEND STATUS CHECK
// ============================================================================

async function checkBackendStatus() {
    try {
        const response = await fetch(`${API_BASE}/api/health`, { 
            method: 'GET',
            timeout: 3000 
        });
        backendOnline = response.ok;
        
        if (backendOnline) {
            console.log('✅ Backend is online');
            hideBackendOfflineMessage();
        } else {
            console.log('❌ Backend is offline');
            showBackendOfflineMessage();
        }
    } catch (error) {
        console.log('❌ Backend is offline:', error.message);
        backendOnline = false;
        showBackendOfflineMessage();
    }
}

function showBackendOfflineMessage() {
    // Remove existing message
    const existing = document.getElementById('backend-offline-message');
    if (existing) existing.remove();
    
    // Create offline message
    const message = document.createElement('div');
    message.id = 'backend-offline-message';
    message.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(45deg, #ff6b35, #f7931e);
        color: white;
        text-align: center;
        padding: 15px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
    `;
    message.innerHTML = `
        🔧 Backend Offline - AI predictions and live data unavailable. 
        <span style="color: #ffd700;">Start your backend to enable full functionality!</span>
    `;
    
    document.body.appendChild(message);
    
    // Adjust body padding to account for message
    document.body.style.paddingTop = '60px';
}

function hideBackendOfflineMessage() {
    const message = document.getElementById('backend-offline-message');
    if (message) {
        message.remove();
        document.body.style.paddingTop = '0';
    }
}

// ============================================================================
// MODIFIED API FUNCTIONS
// ============================================================================

async function loadPicksFromFile() {
    console.log('🔄 Loading picks...');
    
    // First try backend API
    if (backendOnline) {
        try {
            const response = await fetch(`${API_BASE}/api/all-picks?t=${new Date().getTime()}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Loaded ${data.picks.length} picks from backend API`);
                return data.picks;
            }
        } catch (error) {
            console.log('❌ Backend API failed, falling back to local file');
        }
    }
    
    // Fallback to local JSON file
    try {
        const response = await fetch('lucklab_picks.json');
        const data = await response.json();
        console.log(`✅ Loaded ${data.length} picks from local file`);
        return data;
    } catch (error) {
        console.error('❌ Failed to load picks:', error);
        return [];
    }
}

async function loadAutoPicksFromFile() {
    console.log('🔄 Loading auto picks...');
    
    // First try backend API
    if (backendOnline) {
        try {
            const response = await fetch(`${API_BASE}/api/auto-picks?t=${new Date().getTime()}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Loaded ${data.picks.length} auto picks from backend API`);
                return data.picks;
            }
        } catch (error) {
            console.log('❌ Backend API failed, falling back to local file');
        }
    }
    
    // Fallback to local JSON file
    try {
        const response = await fetch('lucklab_auto_picks.json');
        const data = await response.json();
        console.log(`✅ Loaded ${data.length} auto picks from local file`);
        return data;
    } catch (error) {
        console.error('❌ Failed to load auto picks:', error);
        return [];
    }
}

// ============================================================================
// REST OF YOUR EXISTING CODE (copy from original insightai.js)
// ============================================================================

// Function to check if a game hasn't been played yet (is in the future)
function isGameUpcoming(dateString) {
    if (!dateString) return true; // If no date, show it
    
    try {
        const gameDate = new Date(dateString);
        const now = new Date();
        
        // Game is valid if it hasn't happened yet (future or happening now)
        // Add 4 hours buffer to account for games in progress
        const gameEndTime = new Date(gameDate.getTime() + (4 * 60 * 60 * 1000)); // Game time + 4 hours
        
        return gameEndTime > now;
    } catch (e) {
        console.error('Error parsing date:', dateString, e);
        return true; // If we can't parse the date, show it
    }
}

// ... (rest of your existing functions would go here)
// For now, I'll include the essential ones

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing InsightAI with local backend...');
    
    // Check backend status
    checkBackendStatus();
    
    // Check backend status every 30 seconds
    setInterval(checkBackendStatus, 30000);
    
    // Load picks
    loadPicksFromFile().then(picks => {
        window.picks = picks;
        console.log(`📊 Loaded ${picks.length} picks`);
    });
    
    // Load auto picks
    loadAutoPicksFromFile().then(autoPicks => {
        window.autoPicks = autoPicks;
        console.log(`📊 Loaded ${autoPicks.length} auto picks`);
    });
});

// ============================================================================
// INSTRUCTIONS FOR USER
// ============================================================================

console.log(`
🎯 LOCAL BACKEND SETUP INSTRUCTIONS:

1. Find your local IP address:
   - Open Command Prompt
   - Run: ipconfig
   - Look for "IPv4 Address" (usually 192.168.1.xxx or 10.0.0.xxx)

2. Update this file:
   - Change LOCAL_IP = '192.168.1.100' to your actual IP
   - Save the file

3. Deploy this frontend to your domain

4. Start your backend:
   - Run your batch file
   - Backend will be available at http://YOUR_IP:5002

5. Your website will work when backend is running!
`);
