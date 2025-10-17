// InsightAI Website JavaScript - Standalone Version (No Backend Required)
// Created by NeuroGestAI

console.log('InsightAI Standalone JavaScript loaded successfully!');

// ============================================================================
// CONFIGURATION
// ============================================================================

// Backend status - will be false initially since backend isn't running
let backendOnline = false;

// ============================================================================
// BACKEND STATUS CHECK
// ============================================================================

async function checkBackendStatus() {
    try {
        // Try to connect to backend (will fail initially)
        const response = await fetch(`http://192.168.1.102:5002/api/health`, { 
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
// PICK LOADING FUNCTIONS (Standalone)
// ============================================================================

async function loadPicksFromFile() {
    console.log('🔄 Loading picks...');
    
    try {
        // Try to load from local JSON file first
        const response = await fetch('lucklab_picks.json');
        const data = await response.json();
        console.log(`✅ Loaded ${data.length} picks from local file`);
        return data;
    } catch (error) {
        console.log('❌ Failed to load picks from local file:', error);
        
        // Return empty array if no picks file
        return [];
    }
}

async function loadAutoPicksFromFile() {
    console.log('🔄 Loading auto picks...');
    
    try {
        // Try to load from local JSON file first
        const response = await fetch('lucklab_auto_picks.json');
        const data = await response.json();
        console.log(`✅ Loaded ${data.length} auto picks from local file`);
        return data;
    } catch (error) {
        console.log('❌ Failed to load auto picks from local file:', error);
        
        // Return empty array if no auto picks file
        return [];
    }
}

// ============================================================================
// BASIC WEBSITE FUNCTIONALITY
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

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing InsightAI Standalone...');
    
    // Check backend status (will show offline message)
    checkBackendStatus();
    
    // Check backend status every 30 seconds
    setInterval(checkBackendStatus, 30000);
    
    // Load picks
    loadPicksFromFile().then(picks => {
        window.picks = picks;
        console.log(`📊 Loaded ${picks.length} picks`);
        
        // Try to display picks if the display functions exist
        if (typeof displayPicks === 'function') {
            displayPicks(picks);
        }
    });
    
    // Load auto picks
    loadAutoPicksFromFile().then(autoPicks => {
        window.autoPicks = autoPicks;
        console.log(`📊 Loaded ${autoPicks.length} auto picks`);
    });
    
    // Basic page functionality
    console.log('✅ Website loaded successfully!');
    console.log('🔧 Backend features will be available when you start your backend');
});

// ============================================================================
// PLACEHOLDER FUNCTIONS (to prevent errors)
// ============================================================================

// These functions prevent JavaScript errors if the main insightai.js functions aren't available
window.loadPicks = loadPicksFromFile;
window.loadAutoPicks = loadAutoPicksFromFile;
window.checkBackendStatus = checkBackendStatus;

// ============================================================================
// INSTRUCTIONS FOR USER
// ============================================================================

console.log(`
🎯 STANDALONE WEBSITE MODE:

✅ Website is working without backend
✅ Static content displays normally  
✅ Picks load from JSON files
❌ AI predictions require backend
❌ Live data requires backend

🚀 TO ENABLE FULL FUNCTIONALITY:
1. Start your backend: START-EVERYTHING.bat
2. Backend will be available at http://192.168.1.102:5002
3. Website will automatically detect backend and enable features

📊 CURRENT STATUS:
- Backend: ${backendOnline ? 'ONLINE' : 'OFFLINE'}
- Website: WORKING
- Picks: LOADING FROM FILES
`);
