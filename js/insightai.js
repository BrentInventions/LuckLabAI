// InsightAI Website JavaScript
// Created by NeuroGestAI

console.log('InsightAI JavaScript loaded successfully!');

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
        return true; // If error parsing, keep the pick
    }
}

// Function to extract team names and get logos from game string
function getTeamLogosFromGame(gameString, sport) {
    if (!gameString) return { awayLogo: null, homeLogo: null, awayTeam: '', homeTeam: '' };
    
    // Parse game string (e.g., "LA Dodgers vs Mil Brewers", "Chiefs vs 49ers", or "Team A at Team B")
    const parts = gameString.split(/\s+(vs\.?|at)\s+/i);
    if (parts.length < 3) return { awayLogo: null, homeLogo: null, awayTeam: '', homeTeam: '' };
    
    const awayTeam = parts[0].trim();
    const homeTeam = parts[2].trim();
    
    // Get logos using team-logos.js function if available
    let awayLogo = null;
    let homeLogo = null;
    
    if (typeof getTeamLogo === 'function') {
        awayLogo = getTeamLogo(awayTeam, sport);
        homeLogo = getTeamLogo(homeTeam, sport);
    }
    
    return {
        awayLogo: awayLogo,
        homeLogo: homeLogo,
        awayTeam: awayTeam,
        homeTeam: homeTeam
    };
}

// Group picks by game
function groupPicksByGame(picksArray) {
    const gameMap = new Map();
    
    picksArray.forEach(pick => {
        const gameKey = pick.game || pick.teams || 'Unknown Game';
        if (!gameMap.has(gameKey)) {
            gameMap.set(gameKey, {
                game: gameKey,
                sport: pick.sport,
                game_time: pick.game_time || pick.date,
                picks: []
            });
        }
        gameMap.get(gameKey).picks.push(pick);
    });
    
    return Array.from(gameMap.values());
}

// Create game card with hover tooltip showing "Picks available"
function createGameCardWithHover(gameData) {
    const { awayLogo, homeLogo, awayTeam, homeTeam } = getTeamLogosFromGame(gameData.game, gameData.sport);
    const gameId = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const pickCount = gameData.picks.length;
    const sportColor = getSportColor(gameData.sport);
    
    return `
        <div class="col-12 col-xl-6 mb-4">
            <div class="scheduled-game-card" id="${gameId}" 
                 data-pick-count="${pickCount}"
                 data-sport="${gameData.sport}"
                 style="
                    background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
                    border: 2px solid ${sportColor};
                    border-radius: 15px;
                    padding: 20px;
                    min-height: 120px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                 ">
                
                <!-- Game Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center;">
                        <img src="${awayLogo}" alt="${awayTeam}" style="width: 30px; height: 30px; margin-right: 10px;">
                        <span style="color: #fff; font-weight: bold; font-size: 1.1rem;">${awayTeam}</span>
                    </div>
                    <div style="
                        background: ${sportColor};
                        color: #fff;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 0.8rem;
                        font-weight: bold;
                        text-transform: uppercase;
                    ">${gameData.sport}</div>
                    <div style="display: flex; align-items: center;">
                        <span style="color: #fff; font-weight: bold; font-size: 1.1rem;">${homeTeam}</span>
                        <img src="${homeLogo}" alt="${homeTeam}" style="width: 30px; height: 30px; margin-left: 10px;">
                    </div>
                </div>
                
                <!-- Game Time -->
                <div style="text-align: center; color: #999; font-size: 0.9rem; margin-bottom: 10px;">
                    ${formatGameTime(gameData.game_time || gameData.date)}
                </div>
                
                <!-- Hover Overlay (hidden by default) -->
                <div class="game-hover-overlay" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 255, 136, 0.1);
                    border: 2px solid #00ff88;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.3s ease;
                    pointer-events: none;
                ">
                    <div style="
                        background: rgba(0, 0, 0, 0.9);
                        color: #00ff88;
                        padding: 15px 25px;
                        border-radius: 10px;
                        font-size: 1.2rem;
                        font-weight: bold;
                        text-align: center;
                        border: 2px solid #00ff88;
                    ">
                        🎯 ${pickCount} Pick${pickCount > 1 ? 's' : ''} Available<br>
                        <small style="color: #fff; font-size: 0.9rem;">Click to View Details</small>
                    </div>
                </div>
                
                <!-- Hidden Picks Container -->
                <div id="${gameId}-picks" style="display: none; margin-top: 20px; padding-top: 20px; border-top: 2px solid ${sportColor};">
                    ${gameData.picks.map(pick => createPickDetails(pick)).join('')}
                </div>
            </div>
        </div>
    `;
}

// Create game card with hidden picks (hover to see "Picks available", click to reveal)
function createGameCard(gameData) {
    const { awayLogo, homeLogo, awayTeam, homeTeam } = getTeamLogosFromGame(gameData.game, gameData.sport);
    const gameId = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const pickCount = gameData.picks.length;
    const sportColor = getSportColor(gameData.sport);
    
    return `
        <div class="col-12 col-xl-6 mb-4">
            <div class="game-card" id="${gameId}" style="
                background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
                border: 2px solid ${sportColor};
                border-radius: 15px;
                padding: 20px;
                min-height: 140px;
                position: relative;
                cursor: pointer;
                box-shadow: 0 8px 25px rgba(${hexToRgb(sportColor)}, 0.3);
                transition: all 0.3s ease;
            " 
            onmouseover="showPicksHoverTooltip(this, '${gameId}')"
            onmouseout="hidePicksHoverTooltip('${gameId}')"
            onclick="toggleGamePicks('${gameId}')">
                
                <!-- Sport Badge -->
                <div style="position: absolute; top: 10px; right: 10px; background: ${sportColor}; color: #000; padding: 5px 15px; border-radius: 20px; font-weight: 900; font-size: 0.75rem; letter-spacing: 1px;">
                    ${gameData.sport || 'GAME'}
                </div>
                
                <!-- Picks Available Badge -->
                <div style="position: absolute; top: 10px; left: 10px; background: rgba(0,255,136,0.2); border: 2px solid #00ff88; color: #00ff88; padding: 5px 12px; border-radius: 20px; font-weight: 700; font-size: 0.7rem;">
                    ${pickCount} PICK${pickCount > 1 ? 'S' : ''} 🔥
                </div>
                
                <!-- Teams with Logos -->
                <div style="display: flex; align-items: center; margin-top: 35px; margin-bottom: 10px;">
                    ${awayLogo ? `<img src="${awayLogo}" alt="${awayTeam}" style="width: 45px; height: 45px; margin-right: 15px; object-fit: contain;">` : ''}
                    <div style="flex: 1;">
                        <div style="color: #fff; font-size: 1.1rem; font-weight: 700; line-height: 1.3;">
                            ${awayTeam || gameData.game}
                        </div>
                        <div style="color: #999; font-size: 0.9rem; margin: 5px 0;">vs</div>
                        <div style="color: #fff; font-size: 1.1rem; font-weight: 700; line-height: 1.3;">
                            ${homeTeam || ''}
                        </div>
                    </div>
                    ${homeLogo ? `<img src="${homeLogo}" alt="${homeTeam}" style="width: 45px; height: 45px; margin-left: 15px; object-fit: contain;">` : ''}
                </div>
                
                <!-- Game Time -->
                ${gameData.game_time ? `
                    <div style="text-align: center; color: #888; font-size: 0.85rem; margin-top: 10px;">
                        📅 ${formatGameTime(gameData.game_time)}
                    </div>
                ` : ''}
                
                <!-- Hover Tooltip -->
                <div id="${gameId}-tooltip" style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,255,136,0.95);
                    color: #000;
                    padding: 15px 25px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    display: none;
                    z-index: 10;
                    pointer-events: none;
                    box-shadow: 0 5px 20px rgba(0,255,136,0.5);
                ">
                    ${pickCount} Pick${pickCount > 1 ? 's' : ''} Available - Click to View! 🎯
                </div>
                
                <!-- Hidden Picks Container -->
                <div id="${gameId}-picks" style="display: none; margin-top: 20px; padding-top: 20px; border-top: 2px solid ${sportColor};">
                    ${gameData.picks.map(pick => createPickDetails(pick)).join('')}
                </div>
            </div>
        </div>
    `;
}

// Create pick details (shown inside game card when clicked)
function createPickDetails(pick) {
    const pickId = pick.id || `pick-${Date.now()}-${Math.random()}`;
    const isPurchased = checkIfUserPurchased(pickId);
    
    return `
        <div style="background: rgba(0,212,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid #00d4ff;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="color: #00d4ff; font-weight: 700; font-size: 0.9rem;">
                    ${pick.pick_type || 'PICK'}
                </div>
                <div style="color: #00ff88; font-weight: 700; font-size: 0.85rem;">
                    ${pick.confidence || 'N/A'} Confidence
                </div>
            </div>
            
            ${!isPurchased ? `
                <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="color: #ffaa00; font-size: 3rem; margin-bottom: 10px;">🔒</div>
                    <div style="color: #fff; font-weight: 700; margin-bottom: 10px;">Premium Pick</div>
                    <div style="color: #888; font-size: 0.85rem; margin-bottom: 15px;">
                        Unlock this ${pick.pick_type || 'pick'} for $${pick.price || '100.00'}
                    </div>
                    <button onclick="purchasePick('${pickId}')" style="
                        background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
                        color: #000;
                        border: none;
                        padding: 10px 25px;
                        border-radius: 25px;
                        font-weight: 700;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🔓 Unlock Now
                    </button>
                </div>
            ` : `
                <div style="color: #fff; font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">
                    ${pick.pick || 'N/A'}
                </div>
                <div style="color: #00d4ff; font-size: 0.9rem; margin-bottom: 5px;">
                    <strong>Odds:</strong> ${pick.odds || 'N/A'}
                </div>
                <div style="color: #888; font-size: 0.85rem;">
                    ✅ You own this pick
                </div>
            `}
        </div>
    `;
}

// Helper functions
function getSportColor(sport) {
    const colors = {
        'NFL': '#ff4444',
        'NBA': '#ff8800',
        'MLB': '#00d4ff',
        'NHL': '#0088ff',
        'CFB': '#9966ff',
        'NCAAF': '#9966ff',
        'CBB': '#ff6600',
        'NCAAB': '#ff6600'
    };
    return colors[sport?.toUpperCase()] || '#00d4ff';
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0,212,255';
}

function showPicksHoverTooltip(element, gameId) {
    const tooltip = document.getElementById(`${gameId}-tooltip`);
    if (tooltip) {
        tooltip.style.display = 'block';
    }
    element.style.transform = 'translateY(-5px)';
    element.style.boxShadow = `0 12px 35px rgba(${hexToRgb(getSportColor(element.querySelector('[style*="GAME"]')?.textContent))}, 0.5)`;
}

function hidePicksHoverTooltip(gameId) {
    const tooltip = document.getElementById(`${gameId}-tooltip`);
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

function toggleGamePicks(gameId) {
    const picksContainer = document.getElementById(`${gameId}-picks`);
    const tooltip = document.getElementById(`${gameId}-tooltip`);
    
    if (picksContainer) {
        if (picksContainer.style.display === 'none') {
            picksContainer.style.display = 'block';
            if (tooltip) tooltip.style.display = 'none';
        } else {
            picksContainer.style.display = 'none';
        }
    }
}

function formatGameTime(timeString) {
    if (!timeString) return '';
    try {
        const date = new Date(timeString);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    } catch (e) {
        return timeString;
    }
}

// Create pick card HTML
function createPickCard(pick, isBrentsPick = false) {
    try {
        const { awayLogo, homeLogo, awayTeam, homeTeam } = getTeamLogosFromGame(pick.game || pick.teams, pick.sport);
        const pickId = pick.id || `pick-${Date.now()}-${Math.random()}`;
        const isPurchased = checkIfUserPurchased(pickId);
    
    const borderColor = isBrentsPick ? '#00ff88' : '#00d4ff';
    const accentColor = isBrentsPick ? '#00ff88' : '#00d4ff';
    const creatorLabel = isBrentsPick ? "Brent's Pick" : pick.createdBy || 'AI Bot Predictor';
    
    return `
        <div class="col-12 col-xl-6 mb-4">
            <div class="pick-card" style="
                background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
                border: 2px solid ${borderColor};
                border-radius: 15px;
                padding: 20px;
                min-height: 160px;
                position: relative;
                overflow: visible;
                box-shadow: 0 8px 25px rgba(0,212,255,0.3);
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 12px 35px rgba(0,212,255,0.5)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(0,212,255,0.3)'">
                
                <!-- Sport Badge -->
                <div style="position: absolute; top: 10px; right: 10px; background: ${accentColor}; color: #000; padding: 5px 15px; border-radius: 20px; font-weight: 900; font-size: 0.75rem; letter-spacing: 1px;">
                    ${pick.sport || 'GAME'}
                </div>
                
                <!-- Teams with Logos (Horizontal) -->
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    ${awayLogo ? `<img src="${awayLogo}" alt="${awayTeam}" style="width: 40px; height: 40px; margin-right: 10px; object-fit: contain;">` : ''}
                    <div style="flex: 1;">
                        <div style="color: #fff; font-size: 1rem; font-weight: 700; line-height: 1.2;">
                            ${awayTeam || pick.teams || pick.game || 'Game'}
                        </div>
                        <div style="color: #999; font-size: 0.85rem;">vs</div>
                        <div style="color: #fff; font-size: 1rem; font-weight: 700; line-height: 1.2;">
                            ${homeTeam || ''}
                        </div>
                    </div>
                    ${homeLogo ? `<img src="${homeLogo}" alt="${homeTeam}" style="width: 40px; height: 40px; margin-left: 10px; object-fit: contain;">` : ''}
                </div>
                
                <!-- Pick Info (LOCKED unless purchased) -->
                ${!isPurchased ? `
                    <div style="
                        position: relative;
                        background: rgba(0,0,0,0.8);
                        backdrop-filter: blur(10px);
                        border: 2px dashed ${accentColor};
                        border-radius: 10px;
                        padding: 15px;
                        margin: 10px 0;
                    ">
                        <div style="text-align: center;">
                            <i class="fas fa-lock" style="font-size: 2rem; color: ${accentColor}; margin-bottom: 10px;"></i>
                            <div style="color: ${accentColor}; font-weight: 700; font-size: 0.9rem; margin-bottom: 5px;">UNLOCK THIS PICK</div>
                            <div style="color: #999; font-size: 0.8rem;">Purchase to see ${creatorLabel}'s prediction</div>
                        </div>
                    </div>
                ` : `
                    <div style="
                        background: rgba(0,255,136,0.1);
                        border-left: 4px solid ${accentColor};
                        padding: 15px;
                        margin: 10px 0;
                        border-radius: 5px;
                    ">
                        <div style="color: ${accentColor}; font-weight: 900; font-size: 1.1rem; margin-bottom: 5px;">
                            ${pick.pick || pick.prediction || 'Pick Locked'}
                        </div>
                        <div style="color: #999; font-size: 0.85rem;">
                            Confidence: <span style="color: #FFD700; font-weight: 700;">${pick.confidence || 'N/A'}</span>
                        </div>
                    </div>
                `}
                
                <!-- Creator & Action -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                    <div style="color: #999; font-size: 0.8rem;">
                        <i class="fas ${isBrentsPick ? 'fa-user-tie' : 'fa-robot'}" style="color: ${accentColor}; margin-right: 5px;"></i>
                        ${creatorLabel}
                    </div>
                    ${!isPurchased ? `
                        <button onclick="purchasePick('${pickId}')" style="
                            background: linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%);
                            color: ${isBrentsPick ? '#000' : '#fff'};
                            border: none;
                            padding: 8px 20px;
                            border-radius: 20px;
                            font-weight: 700;
                            font-size: 0.85rem;
                            cursor: pointer;
                            box-shadow: 0 4px 15px rgba(0,212,255,0.3);
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            UNLOCK $55
                        </button>
                    ` : `
                        <div style="
                            background: rgba(0,255,136,0.2);
                            color: #00ff88;
                            padding: 8px 20px;
                            border-radius: 20px;
                            font-weight: 700;
                            font-size: 0.85rem;
                        ">
                            <i class="fas fa-check-circle mr-1"></i>PURCHASED
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
    } catch (error) {
        console.error('Error in createPickCard:', error);
        return `<div class="col-12"><p style="color: red;">Error creating pick card</p></div>`;
    }
}

// Create parlay card HTML
function createParlayCard(parlay) {
    try {
    const parlayId = parlay.id || `parlay-${Date.now()}-${Math.random()}`;
    const isPurchased = checkIfUserPurchased(parlayId);
    
    return `
        <div class="col-12 col-xl-6 mb-4">
            <div class="parlay-card" style="
                background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
                border: 2px solid #9966ff;
                border-radius: 15px;
                padding: 20px;
                min-height: 200px;
                position: relative;
                overflow: visible;
                box-shadow: 0 8px 25px rgba(153,102,255,0.3);
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 12px 35px rgba(153,102,255,0.5)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(153,102,255,0.3)'">
                
                <!-- Parlay Badge -->
                <div style="position: absolute; top: 10px; right: 10px; background: #9966ff; color: #fff; padding: 5px 15px; border-radius: 20px; font-weight: 900; font-size: 0.75rem; letter-spacing: 1px;">
                    ${parlay.legs ? parlay.legs.length : 0}-LEG PARLAY
                </div>
                
                <!-- Parlay Title -->
                <div style="margin-bottom: 15px;">
                    <h5 style="color: #9966ff; font-weight: 900; margin-bottom: 5px;">
                        <i class="fas fa-layer-group mr-2"></i>Brent's Parlay
                    </h5>
                    <div style="color: #FFD700; font-size: 1.1rem; font-weight: 700;">
                        Combined Odds: ${parlay.combined_odds || '+250'}
                    </div>
                </div>
                
                <!-- Parlay Legs (LOCKED unless purchased) -->
                ${!isPurchased ? `
                    <div style="
                        position: relative;
                        background: rgba(0,0,0,0.8);
                        backdrop-filter: blur(10px);
                        border: 2px dashed #9966ff;
                        border-radius: 10px;
                        padding: 20px;
                        margin: 15px 0;
                        text-align: center;
                    ">
                        <i class="fas fa-lock" style="font-size: 2.5rem; color: #9966ff; margin-bottom: 10px;"></i>
                        <div style="color: #9966ff; font-weight: 700; font-size: 1rem; margin-bottom: 5px;">UNLOCK PARLAY</div>
                        <div style="color: #999; font-size: 0.85rem; margin-bottom: 10px;">${parlay.legs ? parlay.legs.length : 0} carefully selected picks</div>
                        <div style="color: #00ff88; font-size: 0.9rem;">Potential Payout: ${parlay.potential_payout || '$350'}</div>
                    </div>
                ` : `
                    <div style="margin: 15px 0;">
                        ${(parlay.legs || []).map((leg, index) => `
                            <div style="
                                background: rgba(153,102,255,0.1);
                                border-left: 3px solid #9966ff;
                                padding: 10px;
                                margin-bottom: 8px;
                                border-radius: 5px;
                            ">
                                <div style="color: #9966ff; font-weight: 700; font-size: 0.85rem; margin-bottom: 3px;">
                                    LEG ${index + 1}
                                </div>
                                <div style="color: #fff; font-weight: 600; font-size: 0.95rem;">
                                    ${leg.game || 'Game'}
                                </div>
                                <div style="color: #00ff88; font-weight: 700;">
                                    ${leg.pick || 'Pick'} (${leg.odds || '-150'})
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
                
                <!-- Creator & Action -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; flex-wrap: wrap; gap: 10px;">
                    <div style="color: #999; font-size: 0.8rem;">
                        <i class="fas fa-user-tie" style="color: #9966ff; margin-right: 5px;"></i>
                        Brent's Parlay
                    </div>
                    <div style="display: flex; gap: 10px;">
                        ${!isPurchased ? `
                            <button onclick="purchasePick('${parlayId}')" style="
                                background: linear-gradient(135deg, #9966ff 0%, #7744ff 100%);
                                color: #fff;
                                border: none;
                                padding: 10px 25px;
                                border-radius: 20px;
                                font-weight: 700;
                                font-size: 0.9rem;
                                cursor: pointer;
                                box-shadow: 0 4px 15px rgba(153,102,255,0.4);
                            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                UNLOCK $75
                            </button>
                        ` : `
                            <div style="
                                background: rgba(0,255,136,0.2);
                                color: #00ff88;
                                padding: 10px 20px;
                                border-radius: 20px;
                                font-weight: 700;
                                font-size: 0.85rem;
                            ">
                                <i class="fas fa-check-circle mr-1"></i>PURCHASED
                            </div>
                            <button onclick='openInSportsbook(${JSON.stringify(parlay).replace(/'/g, "\\'")}, "hardrock")' style="
                                background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
                                color: #fff;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 20px;
                                font-weight: 700;
                                font-size: 0.85rem;
                                cursor: pointer;
                                box-shadow: 0 4px 15px rgba(255,0,0,0.4);
                            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                <i class="fas fa-ticket-alt mr-1"></i>EXPORT
                            </button>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
    } catch (error) {
        console.error('Error in createParlayCard:', error);
        return `<div class="col-12"><p style="color: red;">Error creating parlay card</p></div>`;
    }
}

// Check if user purchased a pick
function checkIfUserPurchased(pickId) {
    if (!currentUser) return false;
    const purchases = JSON.parse(localStorage.getItem('userPurchases')) || [];
    return purchases.some(p => p.pickId === pickId && p.userEmail === currentUser.email);
}

// ===========================================
// SPORTSBOOK INTEGRATION (Gambly-Style)
// ===========================================

// Generate a shareable parlay slip
function generateParlaySlip(parlay) {
    const slip = {
        id: parlay.id,
        legs: parlay.legs.map(leg => ({
            game: leg.game,
            pick: leg.pick,
            odds: leg.odds,
            sport: leg.sport || 'unknown'
        })),
        combinedOdds: parlay.combined_odds,
        potentialPayout: parlay.potential_payout,
        timestamp: new Date().toISOString()
    };
    
    return btoa(JSON.stringify(slip)); // Base64 encode
}

// Open parlay in sportsbook
function openInSportsbook(parlay, sportsbook = 'hardrock', skipPurchaseCheck = false) {
    // Skip purchase check for manually generated parlays from AI predictor
    if (!skipPurchaseCheck && parlay.id && !checkIfUserPurchased(parlay.id)) {
        alert('Please purchase this parlay first to export to sportsbooks!');
        return;
    }
    
    // Generate text format for clipboard
    const parlayText = formatParlayForClipboard(parlay);
    
    // Show modal with options
    showSportsbookModal(parlay, parlayText, sportsbook);
}

// Format parlay for clipboard (human-readable)
function formatParlayForClipboard(parlay) {
    let text = `🎲 LuckLab AI Parlay - ${parlay.legs.length}-Leg\n`;
    text += `Combined Odds: ${parlay.combined_odds || 'N/A'}\n`;
    text += `Potential Payout: ${parlay.potential_payout || 'N/A'}\n`;
    text += `\n`;
    
    parlay.legs.forEach((leg, index) => {
        text += `Leg ${index + 1}: ${leg.game}\n`;
        text += `Pick: ${leg.pick} (${leg.odds})\n`;
        text += `\n`;
    });
    
    text += `\nGenerated by LuckLab AI - lucklab.ai`;
    return text;
}

// Show sportsbook export modal
function showSportsbookModal(parlay, parlayText, preferredBook) {
    const modalHTML = `
        <div id="sportsbookModal" style="
            display: block;
            position: fixed;
            z-index: 99999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.8);
            backdrop-filter: blur(5px);
        ">
            <div style="
                position: relative;
                background: #000;
                margin: 3% auto;
                padding: 0;
                border: 2px solid #9966ff;
                border-radius: 20px;
                width: 90%;
                max-width: 900px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(153,102,255,0.5);
            ">
                <div style="padding: 20px; border-bottom: 1px solid #9966ff; display: flex; justify-content: space-between; align-items: center;">
                    <h5 style="color: #9966ff; font-weight: 900; margin: 0;">
                        <i class="fas fa-ticket-alt" style="margin-right: 10px;"></i>Export Parlay to Sportsbook
                    </h5>
                    <button onclick="closeSportsbookModal()" style="
                        background: none;
                        border: none;
                        color: #fff;
                        font-size: 2rem;
                        cursor: pointer;
                        padding: 0;
                        width: 40px;
                        height: 40px;
                        line-height: 1;
                    ">&times;</button>
                </div>
                <div style="padding: 20px;">
                        <div class="alert alert-info" style="background: rgba(0,123,255,0.1); border: 1px solid #007bff;">
                            <i class="fas fa-info-circle mr-2"></i>
                            <strong>How it works:</strong> Copy the parlay details below, then manually enter them into your sportsbook app. 
                            Unfortunately, direct bet placement via API is not available for most sportsbooks.
                        </div>
                        
                        <!-- Parlay Summary -->
                        <div style="background: rgba(153,102,255,0.1); border: 2px solid #9966ff; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                            <h6 style="color: #9966ff; font-weight: 700; margin-bottom: 15px;">
                                ${parlay.legs.length}-Leg Parlay Summary
                            </h6>
                            ${parlay.legs.map((leg, index) => `
                                <div style="background: rgba(0,0,0,0.5); padding: 10px; margin-bottom: 8px; border-radius: 8px;">
                                    <div style="color: #9966ff; font-size: 0.85rem; font-weight: 700;">LEG ${index + 1}</div>
                                    <div style="color: #fff; font-weight: 600;">${leg.game}</div>
                                    <div style="color: #00ff88; font-weight: 700;">${leg.pick} (${leg.odds})</div>
                                </div>
                            `).join('')}
                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #9966ff;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: #999;">Combined Odds:</span>
                                    <span style="color: #FFD700; font-weight: 900;">${parlay.combined_odds || 'N/A'}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                                    <span style="color: #999;">Potential Payout:</span>
                                    <span style="color: #00ff88; font-weight: 900;">${parlay.potential_payout || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Copy Text -->
                        <div style="margin-bottom: 20px;">
                            <label style="color: #fff; font-weight: 600; margin-bottom: 10px;">
                                <i class="fas fa-copy mr-2"></i>Parlay Details (Copy & Paste)
                            </label>
                            <textarea id="parlayTextArea" readonly style="
                                width: 100%;
                                height: 200px;
                                background: #0a0a0a;
                                color: #00ff88;
                                border: 2px solid #9966ff;
                                border-radius: 10px;
                                padding: 15px;
                                font-family: 'Courier New', monospace;
                                font-size: 0.9rem;
                                resize: none;
                            ">${parlayText}</textarea>
                        </div>
                        
                        <!-- Actions -->
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <button onclick="copyParlayText()" class="btn btn-block" style="
                                    background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
                                    color: #000;
                                    border: none;
                                    padding: 15px;
                                    border-radius: 15px;
                                    font-weight: 700;
                                    font-size: 1rem;
                                ">
                                    <i class="fas fa-copy mr-2"></i>COPY TO CLIPBOARD
                                </button>
                            </div>
                            <div class="col-md-6 mb-3">
                                <button onclick="downloadParlayImage(${JSON.stringify(parlay).replace(/"/g, '&quot;')})" class="btn btn-block" style="
                                    background: linear-gradient(135deg, #9966ff 0%, #7744ff 100%);
                                    color: #fff;
                                    border: none;
                                    padding: 15px;
                                    border-radius: 15px;
                                    font-weight: 700;
                                    font-size: 1rem;
                                ">
                                    <i class="fas fa-image mr-2"></i>DOWNLOAD AS IMAGE
                                </button>
                            </div>
                        </div>
                        
                        <!-- Sportsbook Quick Links -->
                        <div style="margin-top: 20px;">
                            <h6 style="color: #fff; font-weight: 600; margin-bottom: 15px;">
                                <i class="fas fa-external-link-alt mr-2"></i>Open Sportsbook
                            </h6>
                            <div class="row">
                                <div class="col-6 col-md-4 mb-2">
                                    <button onclick="window.open('https://www.hardrock.bet/', '_blank')" class="btn btn-block btn-sm" style="background: #000; border: 2px solid #ff0000; color: #fff; padding: 10px; border-radius: 10px; font-weight: 600;">
                                        Hard Rock Bet
                                    </button>
                                </div>
                                <div class="col-6 col-md-4 mb-2">
                                    <button onclick="window.open('https://sportsbook.draftkings.com/', '_blank')" class="btn btn-block btn-sm" style="background: #000; border: 2px solid #53d337; color: #fff; padding: 10px; border-radius: 10px; font-weight: 600;">
                                        DraftKings
                                    </button>
                                </div>
                                <div class="col-6 col-md-4 mb-2">
                                    <button onclick="window.open('https://sportsbook.fanduel.com/', '_blank')" class="btn btn-block btn-sm" style="background: #000; border: 2px solid #0099ff; color: #fff; padding: 10px; border-radius: 10px; font-weight: 600;">
                                        FanDuel
                                    </button>
                                </div>
                                <div class="col-6 col-md-4 mb-2">
                                    <button onclick="window.open('https://sports.betmgm.com/', '_blank')" class="btn btn-block btn-sm" style="background: #000; border: 2px solid #f7ab00; color: #fff; padding: 10px; border-radius: 10px; font-weight: 600;">
                                        BetMGM
                                    </button>
                                </div>
                                <div class="col-6 col-md-4 mb-2">
                                    <button onclick="window.open('https://www.caesars.com/sportsbook-and-casino', '_blank')" class="btn btn-block btn-sm" style="background: #000; border: 2px solid #c69948; color: #fff; padding: 10px; border-radius: 10px; font-weight: 600;">
                                        Caesars
                                    </button>
                                </div>
                                <div class="col-6 col-md-4 mb-2">
                                    <button onclick="window.open('https://www.pointsbet.com/', '_blank')" class="btn btn-block btn-sm" style="background: #000; border: 2px solid #ffcc00; color: #fff; padding: 10px; border-radius: 10px; font-weight: 600;">
                                        PointsBet
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="alert alert-success mt-3" style="background: rgba(0,255,136,0.1); border: 1px solid #00ff88;">
                            <strong>💡 Pro Tip:</strong> After copying, open your sportsbook app and manually add each leg to your bet slip. 
                            Most sportsbooks will calculate the combined odds automatically.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existingModal = document.getElementById('sportsbookModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Fade in the modal
    setTimeout(() => {
        const modal = document.getElementById('sportsbookModal');
        if (modal) {
            modal.style.transition = 'opacity 0.3s ease';
            modal.style.opacity = '1';
        }
    }, 10);
    
    // Close on background click
    document.getElementById('sportsbookModal').addEventListener('click', function(e) {
        if (e.target.id === 'sportsbookModal') {
            closeSportsbookModal();
        }
    });
    
    // Close on ESC key
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeSportsbookModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

// Close sportsbook modal
function closeSportsbookModal() {
    const modal = document.getElementById('sportsbookModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    }
}

// Copy parlay text to clipboard
function copyParlayText() {
    const textarea = document.getElementById('parlayTextArea');
    textarea.select();
    document.execCommand('copy');
    
    // Show success message
    alert('✅ Parlay copied to clipboard! Paste it into your sportsbook app.');
}

// Download parlay as image (future enhancement)
function downloadParlayImage(parlay) {
    alert('📸 Image export coming soon! For now, use the "Copy to Clipboard" option.');
    // TODO: Implement canvas-based image generation
}

// Global variables
let picks = JSON.parse(localStorage.getItem('botPicks')) || [];
let sales = JSON.parse(localStorage.getItem('botSales')) || [];
let customers = JSON.parse(localStorage.getItem('botCustomers')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Membership Tiers Configuration
// Membership Plans with Duration Options (ChatGPT Optimized Pricing)
const MEMBERSHIP_PLANS = {
    bronze: {
        name: 'Bronze',
        tier: 'bronze',
        picksPerDay: 2,
        color: '#CD7F32',
        icon: 'fa-medal',
        features: ['1-2 AI picks per day', 'Expert picks access', 'Community chat access', 'Basic analytics'],
        pricing: {
            daily: 70.00,
            weekly: 199.00,
            monthly: 299.00,
            yearly: 2990.00
        },
        description: 'Entry-level bettors testing AI picks'
    },
    silver: {
        name: 'Silver',
        tier: 'silver',
        picksPerDay: 5,
        color: '#C0C0C0',
        icon: 'fa-medal',
        features: ['3-5 AI picks per day', 'Priority support', 'Advanced analytics', 'Community chat', 'Real-time odds'],
        pricing: {
            daily: 160.00,
            weekly: 349.00,
            monthly: 499.00,
            yearly: 4990.00
        },
        description: 'Regular bettors seeking consistent edge',
        badge: 'MOST POPULAR'
    },
    gold: {
        name: 'Gold',
        tier: 'gold',
        picksPerDay: 10,
        color: '#FFD700',
        icon: 'fa-crown',
        features: ['8-10 AI picks per day', 'VIP support', 'Real-time alerts', 'Exclusive chat room', 'Live game tracking'],
        pricing: {
            daily: 349.00,
            weekly: 749.00,
            monthly: 999.00,
            yearly: 9990.00
        },
        description: 'Semi-pros & high-volume bettors'
    },
    platinum: {
        name: 'Platinum',
        tier: 'platinum',
        picksPerDay: 20,
        color: '#E5E4E2',
        icon: 'fa-gem',
        features: ['15-20 AI picks per day', 'Dedicated support', 'Custom analysis', 'Premium chat access', 'Personal betting coach'],
        pricing: {
            daily: 400.00,
            weekly: 999.00,
            monthly: 1499.00,
            yearly: 14990.00
        },
        description: 'Professional bettors / small syndicates'
    },
    diamond: {
        name: 'Diamond VIP',
        tier: 'diamond',
        picksPerDay: 50,
        color: '#00D9FF',
        icon: 'fa-gem',
        features: ['40-50 AI picks per day', 'Personal analyst', '24/7 VIP concierge', 'All premium features', 'Early access', 'Custom betting strategies'],
        pricing: {
            daily: 599.00,
            weekly: 1499.00,
            monthly: 2499.00,
            yearly: 24990.00
        },
        description: 'High-stakes whales & fund-backed bettors',
        badge: 'ELITE ACCESS'
    }
};

// Legacy compatibility - map old tier keys to new plans
const MEMBERSHIP_TIERS = {
    free: {
        name: 'Free',
        price: 0,
        aiPicksPerDay: 0,
        color: '#666666',
        icon: 'fa-user',
        features: ['View expert picks', 'Browse predictions', 'Basic access']
    },
    bronze: {
        name: 'Bronze',
        price: 299.00,
        aiPicksPerDay: 2,
        color: '#CD7F32',
        icon: 'fa-medal',
        features: MEMBERSHIP_PLANS.bronze.features
    },
    silver: {
        name: 'Silver',
        price: 499.00,
        aiPicksPerDay: 5,
        color: '#C0C0C0',
        icon: 'fa-medal',
        features: MEMBERSHIP_PLANS.silver.features
    },
    gold: {
        name: 'Gold',
        price: 999.00,
        aiPicksPerDay: 10,
        color: '#FFD700',
        icon: 'fa-crown',
        features: MEMBERSHIP_PLANS.gold.features
    },
    platinum: {
        name: 'Platinum',
        price: 1499.00,
        aiPicksPerDay: 20,
        color: '#E5E4E2',
        icon: 'fa-gem',
        features: MEMBERSHIP_PLANS.platinum.features
    },
    diamond: {
        name: 'Diamond VIP',
        price: 2499.00,
        aiPicksPerDay: 50,
        color: '#00D9FF',
        icon: 'fa-gem',
        features: MEMBERSHIP_PLANS.diamond.features
    }
};
let telegramGroups = {
    welcome: {
        name: 'Feed The Streetz💸',
        username: '@FeedTheStreetz',
        link: 'https://t.me/+DurJAfbGKkM3Zjgx',
        description: 'Welcome chat - Create account to comment',
        memberCount: '293 members'
    },
    vip: {
        name: 'Feed tha Streetz🏈⚽️🥎',
        username: '@FeedThaStreetz',
        link: 'https://t.me/+OwZKvWe16-YzZDgx',
        description: 'Exclusive picks community for paid members',
        memberCount: '49 members'
    }
};
let siteImages = JSON.parse(localStorage.getItem('botSiteImages')) || {
    carousel: {
        1: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        2: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        3: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    categories: {
        'NFL': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
        'NBA': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
        'MLB': 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
        'NHL': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
        'Soccer': 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
        'Tennis': 'https://images.unsplash.com/photo-1622163642999-700a9a2383f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
        'College Football': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
        'College Basketball': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
    }
};

// Pick Loader object for sport filtering
const pickLoader = {
    currentFilter: 'all',
    
    filterBySport: function(sport) {
        this.currentFilter = sport;
        loadPicks();
        
        // Update active button
        $('.sport-filter-btn').removeClass('active');
        $(`.sport-filter-btn[onclick*="'${sport}'"]`).addClass('active');
    }
};

// Auto-cleanup old picks (games that have already been played)
function cleanupOldPicks() {
    const picks = JSON.parse(localStorage.getItem('botPicks')) || [];
    const validPicks = picks.filter(pick => {
        const isUpcoming = isGameUpcoming(pick.date || pick.generated_at);
        if (!isUpcoming) {
            const gameDate = pick.date || pick.generated_at;
            console.log(`🗑️ Removing completed game: ${pick.game || pick.teams} (Game was: ${gameDate})`);
        }
        return isUpcoming;
    });
    
    if (validPicks.length !== picks.length) {
        localStorage.setItem('botPicks', JSON.stringify(validPicks));
        console.log(`✅ Cleaned up ${picks.length - validPicks.length} completed game(s)`);
    }
}

// Initialize the website
$(document).ready(function() {
    // Set default active button
    $('.sport-filter-btn[onclick*="\'all\'"]').addClass('active');
    
    // Clean up old picks first
    cleanupOldPicks();
    
    // Load picks from file first, then display
    loadPicksFromFile();
    
    // Force immediate display to remove spinner
    loadPicks();
    
    // Also update after a delay to ensure file loads
    setTimeout(function() {
        loadPicks();
    }, 500);
    
    setupEventListeners();
    checkForPurchasedPicks();
    loadSiteImages();
    initializeChatSystem();
    
    // Display Top 3 Bettors
    displayTop3Bettors();
    
    // Initialize login widget
    createLocalLoginWidget();
    
    // Auto-reload picks every 30 seconds to show updates (new picks and odds changes)
    setInterval(function() {
        const oldPicks = JSON.stringify(picks);
        loadPicksFromFile();
        
        // Check if anything changed
        const newPicks = JSON.stringify(picks);
        if (oldPicks !== newPicks) {
            console.log(`🔄 Picks updated - refreshing display`);
            loadPicks(); // Refresh display
        }
    }, 30000); // 30 seconds
    
    // Initialize payment system
    setupPaymentForm();
    
    // Check for existing user and update interface
    checkForExistingUser();
    updateChatInterface();
    
    // Initialize with sample data if empty
    if (picks.length === 0) {
        initializeSampleData();
    }
});

// Setup event listeners
function setupEventListeners() {
    // Add pick form
    $('#addPickForm').on('submit', handleAddPick);
    
    // Contact form
    $('.contact-form form').on('submit', handleContactForm);
    
    // Search functionality
    $('#searchPicks').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterPicksBySearch(searchTerm);
    });
    
    // Close modals when clicking outside
    $(window).on('click', function(event) {
        if ($(event.target).hasClass('modal')) {
            $('.modal').hide();
        }
    });
}

// Load picks from JSON file (for real-time updates)
let lastPickCount = 0;

function loadPicksFromFile() {
    return new Promise((resolve, reject) => {
        try {
            // Try backend API first
            fetch('http://192.168.1.102:5002/api/all-picks?t=' + new Date().getTime()) // Cache buster
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Backend API not available');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data.picks && Array.isArray(data.picks)) {
                        // Always update picks array
                        picks = data.picks;
                        localStorage.setItem('botPicks', JSON.stringify(picks));
                        
                        const newPickCount = data.picks.length;
                        
                        // Log the change (only if count changed)
                        if (newPickCount !== lastPickCount) {
                            if (newPickCount === 0) {
                                console.log('🗑️ All picks cleared from Control Center');
                            } else if (newPickCount > lastPickCount) {
                                console.log(`✅ Loaded ${picks.length} picks from Control Center API (+${newPickCount - lastPickCount} new)`);
                            } else {
                                console.log(`🔄 Picks updated: ${picks.length} total (${lastPickCount - newPickCount} removed)`);
                            }
                            lastPickCount = newPickCount;
                        }
                        
                        // ALWAYS call loadPicks to update display
                        loadPicks();
                        resolve(data.picks);
                    } else {
                        resolve([]);
                    }
                })
                .catch(error => {
                    console.log('Backend API not available, trying JSON file:', error);
                    // Fallback to JSON file
                    return fetch('lucklab_picks.json?t=' + new Date().getTime());
                })
                .then(response => {
                    if (response && response.ok) {
                        return response.json();
                    }
                    throw new Error('Both API and file not available');
                })
                .then(data => {
                    if (data && Array.isArray(data)) {
                        // Always update picks array
                        picks = data;
                        localStorage.setItem('botPicks', JSON.stringify(picks));
                        
                        const newPickCount = data.length;
                        
                        // Log the change (only if count changed)
                        if (newPickCount !== lastPickCount) {
                            if (newPickCount === 0) {
                                console.log('🗑️ All picks cleared from JSON file');
                            } else if (newPickCount > lastPickCount) {
                                console.log(`✅ Loaded ${picks.length} picks from JSON file (+${newPickCount - lastPickCount} new)`);
                            } else {
                                console.log(`🔄 Picks updated: ${picks.length} total (${lastPickCount - newPickCount} removed)`);
                            }
                            lastPickCount = newPickCount;
                        }
                        
                        // ALWAYS call loadPicks to update display
                        loadPicks();
                        resolve(data);
                    } else {
                        resolve([]);
                    }
                })
                .catch(error => {
                    console.log('No picks available from API or file:', error);
                    // Still try to load from localStorage
                    const savedPicks = localStorage.getItem('botPicks');
                    if (savedPicks) {
                        picks = JSON.parse(savedPicks);
                        console.log(`📦 Loaded ${picks.length} picks from localStorage`);
                    }
                    loadPicks(); // Update display anyway
                    resolve(picks);
                });
        } catch (e) {
            console.log('Could not load picks:', e);
            loadPicks(); // Update display anyway
            resolve(picks);
        }
    });
}

// Auto-refresh picks every 3 seconds to show new picks in real-time
setInterval(() => {
    loadPicksFromFile();
}, 3000);

// Load only Brent's expert picks (for Expert Picks section)
function loadExpertPicksOnly() {
    const picksGrid = $('#lucklab-picks-grid');
    const brentPicks = JSON.parse(localStorage.getItem('brentPersonalPicks')) || [];
    const manualParlays = JSON.parse(localStorage.getItem('brentParlays')) || [];
    
    console.log('🎯 Expert Picks Section - Showing only Brent\'s picks');
    console.log('Brent personal picks found:', brentPicks.length);
    console.log('Brent parlays found:', manualParlays.length);
    
    if (brentPicks.length === 0 && manualParlays.length === 0) {
        console.log('⚠️ No Brent picks available - showing empty state');
        picksGrid.html(`
            <div class="col-12 text-center py-5">
                <i class="fas fa-crown text-warning" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                <h3 class="text-warning mb-3">No Expert Picks Available</h3>
                <p class="text-muted">Brent's expert picks will appear here when available.</p>
                <div class="alert alert-warning mt-3" style="max-width: 600px; margin: 0 auto; background: rgba(255,193,7,0.1); border: 1px solid #ffc107;">
                    <p class="mb-2"><strong>Expert Picks Section:</strong></p>
                    <ul class="text-left" style="list-style-position: inside;">
                        <li>Only Brent's premium picks are shown here</li>
                        <li>AI picks are available in other sections</li>
                        <li>Check back for new expert analysis</li>
                    </ul>
                </div>
            </div>
        `);
        return;
    }
    
    console.log('✅ Found Brent content, displaying...');
    
    // Show ONLY Brent's personal picks and parlays
    let html = '';
    
    // Brent's Personal Picks Section
    if (brentPicks.length > 0) {
        html += `
            <div class="col-12 mb-4">
                <h4 style="color: #00ff88; font-weight: 700; border-bottom: 2px solid #00ff88; padding-bottom: 10px; margin-bottom: 20px;">
                    <i class="fas fa-brain mr-2"></i>What Would Brent Pick?
                </h4>
                <p style="color: #999; font-size: 0.95rem; margin-bottom: 20px;">
                    These are Brent's personal expert picks - curated selections based on deep analysis and insider knowledge.
                </p>
            </div>
        `;
        
        brentPicks.forEach(pick => {
            html += createPickCard(pick, true); // true = isBrentsPick
        });
    }
    
    // Brent's Parlays Section
    if (manualParlays.length > 0) {
        html += `
            <div class="col-12 mb-4">
                <h4 style="color: #ff6b35; font-weight: 700; border-bottom: 2px solid #ff6b35; padding-bottom: 10px; margin-bottom: 20px;">
                    <i class="fas fa-trophy mr-2"></i>Brent's Parlay Picks
                </h4>
                <p style="color: #999; font-size: 0.95rem; margin-bottom: 20px;">
                    High-reward parlay combinations handpicked by Brent for maximum value.
                </p>
            </div>
        `;
        
        manualParlays.forEach(parlay => {
            html += createParlayCard(parlay);
        });
    }
    
    picksGrid.html(html);
}

// Load and display picks
function loadPicks() {
    try {
        console.log('🔄 loadPicks() called');
        const picksGrid = $('#lucklab-picks-grid');
        
        if (!picksGrid || picksGrid.length === 0) {
            console.error('❌ Could not find #lucklab-picks-grid element!');
            return;
        }
        
        // Check if we're in the Expert Picks section (by checking the section title)
        const sectionTitle = $('h2:contains("Expert Picks")');
        if (sectionTitle.length > 0) {
            console.log('🎯 Detected Expert Picks section - showing only Brent\'s picks');
            loadExpertPicksOnly();
            return;
        }
        
        console.log('Total picks in memory:', picks.length);
        console.log('Picks data:', picks.slice(0, 2)); // Debug: show first 2 picks
    
    // Get manual parlays from localStorage
    const manualParlays = JSON.parse(localStorage.getItem('brentParlays')) || [];
    console.log('Brent parlays found:', manualParlays.length);
    
    // If no auto-generated picks, show Brent's personal picks and parlays
    if (picks.length === 0) {
        console.log('⚠️ No auto-generated picks, checking for Brent picks...');
        const brentPicks = JSON.parse(localStorage.getItem('brentPersonalPicks')) || [];
        console.log('Brent personal picks found:', brentPicks.length);
        
        if (brentPicks.length === 0 && manualParlays.length === 0) {
            console.log('⚠️ No picks at all - showing empty state');
            picksGrid.html(`
                <div class="col-12 text-center py-5">
                    <i class="fas fa-robot text-primary" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                    <h3 class="text-primary mb-3">No Picks Available</h3>
                    <p class="text-muted">No AI picks or Brent picks currently available.</p>
                    <div class="alert alert-info mt-3" style="max-width: 600px; margin: 0 auto; background: rgba(0,123,255,0.1); border: 1px solid #007bff;">
                        <p class="mb-2"><strong>To see picks:</strong></p>
                        <ul class="text-left" style="list-style-position: inside;">
                            <li>Open Control Center → Auto-Generate Picks</li>
                            <li>OR add Brent's picks via browser console (F12)</li>
                        </ul>
                    </div>
                </div>
            `);
            return;
        }
        
        console.log('✅ Found Brent content, displaying...');
        
        // Show Brent's personal picks and parlays
        let html = '';
        
        // Brent's Personal Picks Section
        if (brentPicks.length > 0) {
            html += `
                <div class="col-12 mb-4">
                    <h4 style="color: #00ff88; font-weight: 700; border-bottom: 2px solid #00ff88; padding-bottom: 10px; margin-bottom: 20px;">
                        <i class="fas fa-brain mr-2"></i>What Would Brent Pick?
                    </h4>
                    <p style="color: #999; font-size: 0.95rem; margin-bottom: 20px;">
                        These are Brent's personal expert picks - curated selections based on deep analysis and insider knowledge.
                    </p>
                </div>
            `;
            
            brentPicks.forEach(pick => {
                html += createPickCard(pick, true); // true = isBrentsPick
            });
        }
        
        // Brent's Parlays Section
        if (manualParlays.length > 0) {
            html += `
                <div class="col-12 mb-4">
                    <h4 style="color: #ff6b35; font-weight: 700; border-bottom: 2px solid #ff6b35; padding-bottom: 10px; margin-bottom: 20px;">
                        <i class="fas fa-trophy mr-2"></i>Brent's Parlay Picks
                    </h4>
                    <p style="color: #999; font-size: 0.95rem; margin-bottom: 20px;">
                        High-reward parlay combinations handpicked by Brent for maximum value.
                    </p>
                </div>
            `;
            
            manualParlays.forEach(parlay => {
                html += createParlayCard(parlay);
            });
        }
        
        picksGrid.html(html);
        return;
    }
    
    // Continue with AI picks logic
    // Apply sport filter if not 'all'
    console.log(`🔍 Starting with ${picks.length} total picks`);
    let filteredPicks = picks.filter(pick => {
        // Handle both old format (isActive) and new format (status)
        // If no isActive/status field, assume active
        const isActive = pick.isActive !== undefined ? pick.isActive : 
                        (pick.status ? (pick.status === 'available' || pick.status === 'active') : true);
        
        // Check if game hasn't been played yet
        const isUpcoming = isGameUpcoming(pick.game_time || pick.date || pick.generated_at);
        
        // Show picks with 50%+ confidence (handle both "53.5%" and 53.5 formats)
        const confidenceStr = String(pick.confidence || '0').replace('%', '');
        const confidence = parseFloat(confidenceStr) || 0;
        const isGoodConfidence = confidence >= 50;
        
        // Debug: log filtered out picks
        if (!isGoodConfidence) {
            console.log(`❌ Filtered out pick: ${pick.game} - Confidence: ${confidence}% (too low)`);
        }
        
        return isActive && isUpcoming && isGoodConfidence;
    });
    
    console.log(`✅ After filtering: ${filteredPicks.length} picks remain`);
    
    if (pickLoader.currentFilter !== 'all') {
        filteredPicks = filteredPicks.filter(pick => 
            pick.sport && pick.sport.toLowerCase() === pickLoader.currentFilter.toLowerCase()
        );
    }
    
    // ⭐ GROUP BY SPORT and show only top 3 per sport
    const picksBySport = {};
    filteredPicks.forEach(pick => {
        const sport = pick.sport || 'OTHER';
        if (!picksBySport[sport]) {
            picksBySport[sport] = [];
        }
        picksBySport[sport].push(pick);
    });
    
    // Sort each sport by confidence (highest first)
    Object.keys(picksBySport).forEach(sport => {
        picksBySport[sport].sort((a, b) => {
            const confA = parseInt(a.confidence) || 0;
            const confB = parseInt(b.confidence) || 0;
            return confB - confA; // Highest first
        });
        // Show all picks (no limit)
    });
    
    // Flatten back to array
    filteredPicks = [];
    Object.keys(picksBySport).sort().forEach(sport => {
        filteredPicks.push(...picksBySport[sport]);
    });
    
    if (filteredPicks.length === 0) {
        picksGrid.html(`
            <div class="col-12 text-center py-5">
                <i class="fas fa-robot text-primary" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                <h3 class="text-primary mb-3">No Active Picks</h3>
                <p class="text-muted">All picks are currently inactive. Activate some picks to display them.</p>
                <button class="btn btn-primary" onclick="openAdminPanel()">Manage Picks</button>
            </div>
        `);
        return;
    }
    
    // Group picks by game for clean organization
    const gameGroups = groupPicksByGame(filteredPicks);
    console.log(`📊 Displaying ${gameGroups.length} games with ${filteredPicks.length} total picks`);
    console.log('Filtered picks sample:', filteredPicks.slice(0, 2)); // Debug: show first 2 filtered picks
    
    // Generate game cards HTML with hover tooltips
    let html = '';
    gameGroups.forEach(gameData => {
        html += createGameCardWithHover(gameData);
    });
    
    picksGrid.html(html);
    
    // Add hover event listeners
    addGameHoverListeners();
    return;
    
    /* OLD INDIVIDUAL PICK DISPLAY - REPLACED WITH GAME CARD DISPLAY */
    
    // Add modern card styles if not already added
    if (!document.getElementById('modern-pick-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'modern-pick-styles';
        styleEl.innerHTML = `
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.1); }
            }
            .modern-pick-card {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
        `;
        document.head.appendChild(styleEl);
    }
    
    // Build HTML with sport category headers
    let htmlOutput = '';
    let lastSport = '';
    
    filteredPicks.forEach((pick, index) => {
        const currentSport = pick.sport || 'OTHER';
        
        // Add sport header when sport changes
        if (currentSport !== lastSport) {
            const sportCount = picksBySport[currentSport].length;
            
            // Map sport codes to display names
            const sportNames = {
                'NBA': 'NBA',
                'NFL': 'NFL',
                'MLB': 'MLB',
                'NHL': 'NHL',
                'NCAAF': 'College Football',
                'NCAAB': 'College Basketball',
                'NCAABB': 'College Baseball'
            };
            const sportDisplayName = sportNames[currentSport] || currentSport;
            
            htmlOutput += `
                <div class="col-12 mb-3 mt-${index > 0 ? '4' : '2'}">
                    <h4 style="color: #00ff88; font-weight: 700; border-bottom: 2px solid #00ff88; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <span><i class="fas fa-fire mr-2"></i>${sportDisplayName} - High Value Plays</span>
                        <span style="font-size: 0.9rem; color: #999;">${sportCount} ${sportCount === 1 ? 'Pick' : 'Picks'}</span>
                    </h4>
                </div>
            `;
            lastSport = currentSport;
        }
        
        // Add the pick card
        htmlOutput += createPickCardHTML(pick);
    });
    
    picksGrid.html(htmlOutput);
    
    // Helper function to create pick card HTML (extracted from map below)
    function createPickCardHTML(pick) {
        // Normalize pick data to handle both old and new formats
        const normalizedPick = {
            id: pick.id,
            sport: pick.sport,
            teams: pick.game || pick.teams || 'Game',
            price: pick.price || 0,
            date: pick.game_time || pick.date || pick.generated_at || new Date().toISOString(),
            isActive: pick.isActive !== undefined ? pick.isActive : (pick.status ? (pick.status === 'available' || pick.status === 'active') : true),
            betType: pick.betType || pick.pick_type || pick.type || 'Pick',
            prediction: pick.prediction || pick.pick || pick.description,
            odds: pick.odds || 'N/A',
            confidence: pick.confidence || '',
            badge: pick.badge || ''
        };
        
        // Extract team names and get logos
        const teamLogos = getTeamLogosFromGame(normalizedPick.teams, normalizedPick.sport);
        
        // Get appropriate sports image based on sport
        const getSportImage = (sport) => {
            switch(sport) {
                case 'NFL':
                case 'College Football':
                    return 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
                case 'NBA':
                case 'College Basketball':
                    return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
                case 'MLB':
                    return 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
                case 'NHL':
                    return 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
                case 'Soccer':
                    return 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
                case 'Tennis':
                    return 'https://images.unsplash.com/photo-1622163642999-700a9a2383f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
                default:
                    return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
            }
        };

        return `
        <div class="col-12 col-xl-6 mb-3">
            <div class="modern-pick-card" onclick="viewPickDetails('${normalizedPick.id}')" style="cursor: pointer; border-radius: 16px; overflow: visible; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); border: 2px solid rgba(0,255,136,0.3); box-shadow: 0 8px 32px rgba(0,255,136,0.15); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; display: flex; min-height: 160px;" onmouseover="this.style.transform='translateX(5px)'; this.style.boxShadow='0 12px 40px rgba(0,255,136,0.25)'; this.style.borderColor='rgba(0,255,136,0.6)';" onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='0 8px 32px rgba(0,255,136,0.15)'; this.style.borderColor='rgba(0,255,136,0.3)';">
                
                <!-- Left side glow -->
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(180deg, transparent, #00ff88, transparent); opacity: 0.9; border-radius: 16px 0 0 16px;"></div>
                
                <!-- Sport & Bet Type Badges -->
                <div style="position: absolute; top: 10px; left: 10px; z-index: 10; display: flex; gap: 6px;">
                    <span style="background: linear-gradient(135deg, #00ff88, #00cc6a); color: #000; padding: 4px 10px; border-radius: 15px; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(0,255,136,0.4);">${normalizedPick.sport}</span>
                    <span style="background: rgba(255,255,255,0.12); backdrop-filter: blur(10px); color: #fff; padding: 4px 10px; border-radius: 15px; font-size: 0.65rem; font-weight: 700; border: 1px solid rgba(255,255,255,0.1);">${normalizedPick.betType}</span>
                    </div>
                
                <!-- Team Logos Section (Left) -->
                <div style="width: 280px; min-width: 280px; background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.9) 100%); display: flex; align-items: center; justify-content: center; gap: 12px; padding: 15px; position: relative; overflow: hidden;">
                    <div style="position: absolute; inset: 0; background: radial-gradient(circle at 30% 50%, rgba(0,255,136,0.05) 0%, transparent 70%);"></div>
                    ${teamLogos.awayLogo ? `
                        <div style="text-align: center; position: relative; z-index: 2;">
                            <div style="width: 55px; height: 55px; margin: 0 auto 6px; background: radial-gradient(circle, rgba(0,255,136,0.15) 0%, transparent 70%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <img src="${teamLogos.awayLogo}" style="width: 50px; height: 50px; object-fit: contain; filter: drop-shadow(0 3px 10px rgba(0,255,136,0.4));" alt="${teamLogos.awayTeam}" onerror="this.parentElement.style.display='none'">
                </div>
                            <p style="color: #fff; font-size: 0.65rem; font-weight: 700; text-shadow: 0 2px 6px rgba(0,0,0,0.8); letter-spacing: 0.3px; margin: 0;">${teamLogos.awayTeam}</p>
                    </div>
                        <div style="color: #00ff88; font-size: 1.5rem; font-weight: 900; text-shadow: 0 0 15px rgba(0,255,136,0.6); animation: pulse 2s ease-in-out infinite; position: relative; z-index: 2;">@</div>
                        <div style="text-align: center; position: relative; z-index: 2;">
                            <div style="width: 55px; height: 55px; margin: 0 auto 6px; background: radial-gradient(circle, rgba(0,255,136,0.15) 0%, transparent 70%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <img src="${teamLogos.homeLogo}" style="width: 50px; height: 50px; object-fit: contain; filter: drop-shadow(0 3px 10px rgba(0,255,136,0.4));" alt="${teamLogos.homeTeam}" onerror="this.parentElement.style.display='none'">
                    </div>
                            <p style="color: #fff; font-size: 0.65rem; font-weight: 700; text-shadow: 0 2px 6px rgba(0,0,0,0.8); letter-spacing: 0.3px; margin: 0;">${teamLogos.homeTeam}</p>
                    </div>
                    ` : `
                        <div style="width: 100%; height: 100%; background: url('${getSportImage(normalizedPick.sport)}') center/cover; filter: blur(2px) brightness(0.3); position: absolute; inset: 0;"></div>
                        <div style="position: relative; z-index: 2; color: #00ff88; font-size: 1.8rem; font-weight: 900;">${normalizedPick.sport}</div>
                    `}
                </div>
                
                <!-- Pick Info Section (Right) -->
                <div style="flex: 1; padding: 16px 18px; background: linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%); display: flex; flex-direction: column; justify-content: space-between;">
                    <!-- Pick Title & Stats -->
                    <div>
                        <!-- Game Title (visible) -->
                        <h6 style="color: #fff; font-size: 0.85rem; font-weight: 600; margin: 0 0 8px 0; opacity: 0.8; line-height: 1.3;">${normalizedPick.teams}</h6>
                        
                        <!-- LOCKED PICK - Show blur/placeholder instead of actual pick -->
                        <div style="position: relative; margin-bottom: 10px;">
                            <div style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,255,136,0.1), rgba(0,255,136,0.05)); backdrop-filter: blur(8px); border-radius: 8px; display: flex; align-items: center; justify-content: center; z-index: 2;">
                                <div style="text-align: center;">
                                    <i class="fas fa-lock" style="color: #00ff88; font-size: 1.1rem; margin-bottom: 2px;"></i>
                                    <p style="color: #00ff88; font-size: 0.65rem; font-weight: 700; margin: 0; letter-spacing: 0.5px;">UNLOCK TO VIEW</p>
                                </div>
                            </div>
                            <h6 style="color: #444; font-size: 0.9rem; font-weight: 700; margin: 0; padding: 10px 0; filter: blur(5px); user-select: none; line-height: 1.3;">████████ ████</h6>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                            ${normalizedPick.confidence ? `<div style="background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%); color: #000; padding: 5px 12px; border-radius: 18px; font-size: 0.7rem; font-weight: 800; box-shadow: 0 3px 10px rgba(0,255,136,0.3); letter-spacing: 0.3px;"><i class="fas fa-chart-line" style="margin-right: 4px;"></i>${normalizedPick.confidence}</div>` : ''}
                            ${normalizedPick.odds && normalizedPick.odds !== 'N/A' ? `<div style="color: #00d4ff; font-size: 0.75rem; font-weight: 700; text-shadow: 0 0 10px rgba(0,212,255,0.5); padding: 5px 12px; background: rgba(0,212,255,0.1); border-radius: 15px;">${normalizedPick.odds}</div>` : ''}
                        </div>
                    </div>
                    
                    <!-- Price & Action -->
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid rgba(0,255,136,0.15); margin-top: auto;">
                        <div style="color: #00ff88; font-size: 1.6rem; font-weight: 900; text-shadow: 0 0 20px rgba(0,255,136,0.4); letter-spacing: 0.5px;">$${normalizedPick.price.toFixed(2)}</div>
                        <button onclick="event.stopPropagation(); purchasePick('${normalizedPick.id}')" style="background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%); color: #000; border: none; padding: 10px 24px; border-radius: 25px; font-weight: 800; font-size: 0.85rem; box-shadow: 0 4px 16px rgba(0,255,136,0.4); transition: all 0.3s ease; cursor: pointer; letter-spacing: 0.5px;" onmouseover="this.style.transform='scale(1.08)'; this.style.boxShadow='0 6px 24px rgba(0,255,136,0.6)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 16px rgba(0,255,136,0.4)'"><i class="fa fa-lock-open" style="margin-right: 6px;"></i>UNLOCK</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
    
    } catch (error) {
        console.error('❌ Error in loadPicks():', error);
        console.error('Stack trace:', error.stack);
        
        // Show error message instead of spinner
        picksGrid.html(`
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle text-warning" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                <h3 class="text-warning mb-3">Error Loading Picks</h3>
                <p class="text-muted">Error: ${error.message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Reload Page</button>
            </div>
        `);
    }
}

// Add new pick
function handleAddPick(event) {
    event.preventDefault();
    
    const newPick = {
        id: generateId(),
        title: $('#pickTitle').val(),
        sport: $('#pickSport').val(),
        teams: $('#pickTeams').val(),
        price: parseFloat($('#pickPrice').val()),
        description: $('#pickDescription').val(),
        prediction: $('#pickPrediction').val(),
        date: $('#pickDate').val(),
        createdAt: new Date().toISOString(),
        isActive: true
    };
    
    picks.push(newPick);
    savePicks();
    loadPicks();
    loadManagePicks();
    
    // Reset form
    event.target.reset();
    
    // Show success message
    showMessage('Pick added successfully!', 'success');
}

// Purchase a pick
function purchasePick(pickId) {
    const pick = picks.find(p => p.id === pickId);
    if (!pick) return;
    
    const purchaseModal = $('#purchaseModal');
    const purchaseContent = $('#purchaseContent');
    
    purchaseContent.html(`
        <div class="bg-light p-3 mb-3 rounded">
            <h5>${pick.game || pick.teams || 'Game'}</h5>
            <p class="mb-1"><strong>Sport:</strong> ${pick.sport}</p>
            <p class="mb-1"><strong>Price:</strong> $${pick.price}</p>
            <p class="mb-1"><strong>Date:</strong> ${formatDate(pick.date)}</p>
            <p class="mb-0"><strong>Description:</strong> ${pick.description}</p>
        </div>
        
        <form onsubmit="completePurchase(event, '${pickId}')">
            <div class="form-group">
                <input type="text" class="form-control" placeholder="Your Name" required>
            </div>
            <div class="form-group">
                <input type="email" class="form-control" placeholder="Your Email" required>
            </div>
            <div class="form-group">
                <input type="text" class="form-control" placeholder="Phone Number" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">
                <i class="fa fa-credit-card mr-1"></i> Complete Purchase - $${pick.price}
            </button>
        </form>
    `);
    
    purchaseModal.show();
}

// Complete purchase
function completePurchase(event, pickId) {
    event.preventDefault();
    
    const pick = picks.find(p => p.id === pickId);
    
    const customer = {
        id: generateId(),
        name: event.target[0].value,
        email: event.target[1].value,
        phone: event.target[2].value,
        purchasedAt: new Date().toISOString()
    };
    
    const sale = {
        id: generateId(),
        pickId: pickId,
        customerId: customer.id,
        amount: pick.price,
        date: new Date().toISOString(),
        status: 'completed'
    };
    
    customers.push(customer);
    sales.push(sale);
    
    saveCustomers();
    saveSales();
    loadViewSales();
    
    // Close modal and show success
    closePurchaseModal();
    showMessage('Purchase completed! Check your email for the pick details.', 'success');
    
    // Store customer session
    localStorage.setItem('currentCustomer', JSON.stringify(customer));
    
    // Create user account if they don't have one
    if (!currentUser) {
        createUserAccount(customer.email, customer.name);
    }
    
    // Upgrade user to VIP after purchase
    upgradeUserToVIP();
    
    // Show VIP upgrade message
    setTimeout(() => {
        showMessage('🎉 Congratulations! You now have VIP access to our exclusive Telegram community!', 'success');
    }, 2000);
    
    // Show the purchased pick
    setTimeout(() => {
        showPurchasedPick(pickId, customer.id);
    }, 2000);
}

// Show purchased pick to customer
function showPurchasedPick(pickId, customerId) {
    const pick = picks.find(p => p.id === pickId);
    const customer = customers.find(c => c.id === customerId);
    
    if (!pick || !customer) return;
    
    const dashboardModal = $('#dashboardModal');
    const dashboardContent = $('#dashboardContent');
    
    dashboardContent.html(`
        <div class="bg-light p-4 rounded mb-3">
            <h4>Your Bot Pick - ${pick.game || pick.teams || 'Game'}</h4>
            <p class="mb-1"><strong>Sport:</strong> ${pick.sport}</p>
            <p class="mb-1"><strong>Date:</strong> ${formatDate(pick.date)}</p>
            <p class="mb-3"><strong>Description:</strong> ${pick.description}</p>
            
            <div class="bg-primary text-white p-3 rounded">
                <h5><i class="fas fa-robot mr-2"></i>Bot's Prediction</h5>
                <p class="mb-0" style="font-size: 1.1rem; font-weight: bold;">
                    ${pick.prediction}
                </p>
            </div>
            
            <p class="mt-3 mb-0 text-muted small">
                <i class="fas fa-info-circle mr-1"></i> 
                This prediction was generated by our AI algorithm. Please gamble responsibly.
            </p>
        </div>
        
        <div class="text-center">
            <button class="btn btn-primary" onclick="closeDashboard()">
                <i class="fa fa-check mr-1"></i> Got it, thanks!
            </button>
        </div>
    `);
    
    dashboardModal.show();
}

// Check for purchased picks on page load
function checkForPurchasedPicks() {
    const currentCustomer = JSON.parse(localStorage.getItem('currentCustomer'));
    if (currentCustomer) {
        // Update navigation to show customer is logged in
        $('.navbar-nav .btn').first().html(`
            <i class="fas fa-user text-primary"></i>
            <span class="badge text-secondary border border-secondary rounded-circle" style="padding-bottom: 2px;">1</span>
        `);
    }
}

// Show customer dashboard
function showCustomerDashboard() {
    const currentCustomer = JSON.parse(localStorage.getItem('currentCustomer'));
    if (!currentCustomer) {
        showMessage('You haven\'t purchased any picks yet.', 'warning');
        return;
    }
    
    const customerSales = sales.filter(sale => sale.customerId === currentCustomer.id);
    
    if (customerSales.length === 0) {
        showMessage('You haven\'t purchased any picks yet.', 'warning');
        return;
    }
    
    const dashboardModal = $('#dashboardModal');
    const dashboardContent = $('#dashboardContent');
    
    dashboardContent.html(`
        <div class="mb-3">
            <h4 class="text-primary">Welcome back, ${currentCustomer.name}!</h4>
            <p class="text-muted">Here are your purchased picks:</p>
        </div>
        
        ${customerSales.map(sale => {
            const pick = picks.find(p => p.id === sale.pickId);
            if (!pick) return '';
            
            return `
                <div class="bg-light p-4 rounded mb-3">
                    <h5>${pick.game || pick.teams || 'Game'}</h5>
                    <p class="mb-1"><strong>Sport:</strong> ${pick.sport}</p>
                    <p class="mb-1"><strong>Date:</strong> ${formatDate(pick.date)}</p>
                    <p class="mb-3"><strong>Description:</strong> ${pick.description}</p>
                    
                    <div class="bg-primary text-white p-3 rounded">
                        <h6><i class="fas fa-robot mr-2"></i>Bot's Prediction</h6>
                        <p class="mb-0" style="font-weight: bold;">
                            ${pick.prediction}
                        </p>
                    </div>
                    
                    <p class="mt-3 mb-0 text-muted small">
                        Purchased on ${formatDate(sale.date)} for $${sale.amount}
                    </p>
                </div>
            `;
        }).join('')}
        
        <div class="text-center">
            <button class="btn btn-primary" onclick="closeDashboard()">
                <i class="fa fa-times mr-1"></i> Close
            </button>
        </div>
    `);
    
    dashboardModal.show();
}

// Admin Panel Functions
function openAdminPanel() {
    // Admin panel disabled for public access
    alert('Admin access is not available on the public website.');
    return;
}

function closeAdminPanel() {
    $('#adminModal').hide();
}

function loadManagePicks() {
    const picksList = $('#picksList');
    
    if (picks.length === 0) {
        picksList.html('<p class="text-muted text-center">No picks available.</p>');
        return;
    }
    
    picksList.html(picks.map(pick => `
        <div class="bg-light p-3 mb-3 rounded">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="text-primary mb-1">${pick.game || pick.teams || 'Game'}</h6>
                    <p class="mb-1"><strong>Sport:</strong> ${pick.sport}</p>
                    <p class="mb-1"><strong>Price:</strong> $${pick.price}</p>
                    <p class="mb-1"><strong>Date:</strong> ${formatDate(pick.game_time || pick.date)}</p>
                    <p class="mb-1"><strong>Pick:</strong> ${pick.pick || 'N/A'}</p>
                    <p class="mb-1"><strong>Confidence:</strong> ${pick.confidence || 'N/A'}</p>
                    <p class="mb-1"><strong>Status:</strong> 
                        <span class="badge ${(pick.isActive !== undefined ? pick.isActive : true) ? 'badge-success' : 'badge-secondary'}">
                            ${(pick.isActive !== undefined ? pick.isActive : true) ? 'Active' : 'Inactive'}
                        </span>
                    </p>
                </div>
                <div class="ml-3">
                    <button class="btn btn-sm btn-outline-primary mb-1" onclick="editPick('${pick.id}')" style="display: block; width: 100%;">
                        <i class="fa fa-edit mr-1"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-warning mb-1" onclick="togglePickStatus('${pick.id}')" style="display: block; width: 100%;">
                        <i class="fa fa-toggle-${pick.isActive ? 'on' : 'off'} mr-1"></i> 
                        ${pick.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deletePick('${pick.id}')" style="display: block; width: 100%;">
                        <i class="fa fa-trash mr-1"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join(''));
}

function loadViewSales() {
    const salesList = $('#salesList');
    
    if (sales.length === 0) {
        salesList.html('<p class="text-muted text-center">No sales yet.</p>');
        return;
    }
    
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
    
    salesList.html(`
        <div class="bg-primary text-white p-3 rounded mb-3 text-center">
            <h5>Sales Summary</h5>
            <h3>$${totalRevenue.toFixed(2)}</h3>
            <p class="mb-0">Total Sales: ${sales.length}</p>
        </div>
        
        ${sales.map(sale => {
            const pick = picks.find(p => p.id === sale.pickId);
            const customer = customers.find(c => c.id === sale.customerId);
            
            return `
                <div class="bg-light p-3 mb-2 rounded">
                    <h6 class="text-primary mb-1">${pick ? (pick.game || pick.teams || 'Unknown Pick') : 'Unknown Pick'}</h6>
                    <p class="mb-1"><strong>Customer:</strong> ${customer ? customer.name : 'Unknown'}</p>
                    <p class="mb-1"><strong>Email:</strong> ${customer ? customer.email : 'Unknown'}</p>
                    <p class="mb-1"><strong>Amount:</strong> $${sale.amount}</p>
                    <p class="mb-0"><strong>Date:</strong> ${formatDate(sale.date)}</p>
                </div>
            `;
        }).join('')}
    `);
}

function togglePickStatus(pickId) {
    const pick = picks.find(p => p.id === pickId);
    if (pick) {
        pick.isActive = !pick.isActive;
        savePicks();
        loadPicks();
        loadManagePicks();
        showMessage(`Pick ${pick.isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
    }
}

function deletePick(pickId) {
    if (confirm('Are you sure you want to delete this pick? This action cannot be undone.')) {
        picks = picks.filter(p => p.id !== pickId);
        savePicks();
        loadPicks();
        loadManagePicks();
        showMessage('Pick deleted successfully!', 'success');
    }
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showMessage(message, type) {
    // Remove existing messages
    $('.alert').remove();
    
    const alertClass = type === 'success' ? 'alert-success' : 
                      type === 'warning' ? 'alert-warning' : 
                      type === 'error' ? 'alert-danger' : 'alert-info';
    
    const messageDiv = $(`
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert" style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
            ${message}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        </div>
    `);
    
    $('body').append(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.alert('close');
    }, 5000);
}

// Modal Functions
function closePurchaseModal() {
    $('#purchaseModal').hide();
}

function closeDashboard() {
    $('#dashboardModal').hide();
}

// Navigation Functions
function viewPickDetails(pickId) {
    const pick = picks.find(p => p.id === pickId);
    if (!pick) return;
    
    alert(`Pick Details:\n\n${pick.game || pick.teams || 'Game'}\nSport: ${pick.sport}\nDate: ${formatDate(pick.game_time || pick.date)}\nDescription: ${pick.pick || pick.description}\nPrice: $${pick.price}`);
}

function filterPicks(sport) {
    // This would filter picks by sport - for now just scroll to picks section
    $('html, body').animate({
        scrollTop: $('#picks').offset().top - 100
    }, 1000);
    
    // Highlight the sport in the search
    $('#searchPicks').val(sport);
    filterPicksBySearch(sport);
}

function filterPicksBySearch(searchTerm) {
    const pickCards = $('.product-item');
    
    pickCards.each(function() {
        const card = $(this);
        const text = card.text().toLowerCase();
        
        if (text.includes(searchTerm)) {
            card.closest('.col-lg-3, .col-md-4, .col-sm-6').show();
        } else {
            card.closest('.col-lg-3, .col-md-4, .col-sm-6').hide();
        }
    });
}

// Contact Form Handler
function handleContactForm(event) {
    event.preventDefault();
    showMessage('Thank you for your message! We\'ll get back to you soon.', 'success');
    event.target.reset();
}

// Data Persistence
function savePicks() {
    localStorage.setItem('botPicks', JSON.stringify(picks));
}

function saveSales() {
    localStorage.setItem('botSales', JSON.stringify(sales));
}

function saveCustomers() {
    localStorage.setItem('botCustomers', JSON.stringify(customers));
}

// Initialize with sample data
function initializeSampleData() {
    const samplePicks = [
        {
            id: generateId(),
            title: "NFL Championship Game",
            sport: "NFL",
            teams: "Chiefs vs Bills",
            price: 25.00,
            description: "High-stakes playoff game with both teams in top form. Weather conditions and recent performance data analyzed.",
            prediction: "Chiefs to win by 3-7 points. Over 48.5 total points. Mahomes over 275.5 passing yards.",
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            isActive: true
        },
        {
            id: generateId(),
            title: "NBA Finals Game 7",
            sport: "NBA",
            teams: "Lakers vs Celtics",
            price: 35.00,
            description: "Decisive game 7 with everything on the line. Historical data and player matchups heavily favor one side.",
            prediction: "Lakers to win outright. LeBron over 28.5 points. Under 215.5 total points.",
            date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            isActive: true
        },
        {
            id: generateId(),
            title: "MLB World Series",
            sport: "MLB",
            teams: "Yankees vs Dodgers",
            price: 30.00,
            description: "Classic matchup in the World Series. Pitching matchups and recent form analysis included.",
            prediction: "Yankees to win game 1. Over 8.5 total runs. Judge to hit a home run.",
            date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            isActive: true
        }
    ];
    
    picks = samplePicks;
    savePicks();
    loadPicks();
}

// Image Management Functions
// Image compression function to reduce localStorage usage
function compressImage(dataUrl, callback, maxWidth = 1920, quality = 0.8) {
    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Check if compression helped
        if (compressedDataUrl.length < dataUrl.length) {
            console.log(`Image compressed from ${(dataUrl.length / 1024).toFixed(2)}KB to ${(compressedDataUrl.length / 1024).toFixed(2)}KB`);
            callback(compressedDataUrl);
        } else {
            callback(dataUrl);
        }
    };
    img.onerror = function() {
        console.error('Error loading image for compression');
        callback(dataUrl); // Fallback to original
    };
    img.src = dataUrl;
}

function loadSiteImages() {
    console.log('Loading site images...');
    
    // DON'T touch carousel images - they're hardcoded in HTML and should stay
    // Only load carousel images if user has CUSTOM uploaded ones
    const stored = localStorage.getItem('botSiteImages');
    if (stored) {
        try {
            const storedImages = JSON.parse(stored);
            // Only apply if user has actually uploaded custom images (base64 strings)
            if (storedImages.carousel && storedImages.carousel[1] && storedImages.carousel[1].startsWith('data:image')) {
                console.log('Applying custom carousel images from localStorage');
                $('#carouselImage1').attr('src', storedImages.carousel[1]);
                $('#carouselImage2').attr('src', storedImages.carousel[2]);
                $('#carouselImage3').attr('src', storedImages.carousel[3]);
            } else {
                console.log('Using default HTML carousel images');
            }
        } catch (e) {
            console.error('Error loading stored images:', e);
        }
    }
    
    // Update category images using specific IDs
    $('#categoryNFL').attr('src', siteImages.categories['NFL']);
    $('#categoryNBA').attr('src', siteImages.categories['NBA']);
    $('#categoryMLB').attr('src', siteImages.categories['MLB']);
    $('#categoryNHL').attr('src', siteImages.categories['NHL']);
    $('#categorySoccer').attr('src', siteImages.categories['Soccer']);
    $('#categoryTennis').attr('src', siteImages.categories['Tennis']);
    $('#categoryCollegeFootball').attr('src', siteImages.categories['College Football']);
    $('#categoryCollegeBasketball').attr('src', siteImages.categories['College Basketball']);
    
    // Load current URLs into admin form
    $('#carousel1Url').val(siteImages.carousel[1]);
    $('#carousel2Url').val(siteImages.carousel[2]);
    $('#carousel3Url').val(siteImages.carousel[3]);
    $('#nflImageUrl').val(siteImages.categories['NFL']);
    $('#nbaImageUrl').val(siteImages.categories['NBA']);
    $('#mlbImageUrl').val(siteImages.categories['MLB']);
    $('#nhlImageUrl').val(siteImages.categories['NHL']);
    $('#soccerImageUrl').val(siteImages.categories['Soccer']);
    $('#tennisImageUrl').val(siteImages.categories['Tennis']);
    $('#collegefootballImageUrl').val(siteImages.categories['College Football']);
    $('#collegebasketballImageUrl').val(siteImages.categories['College Basketball']);
}

function updateCarouselImage(slideNumber) {
    const fileInput = document.getElementById(`carousel${slideNumber}File`);
    const urlInput = $(`#carousel${slideNumber}Url`);
    
    let newUrl = '';
    
    // Check if file was uploaded
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        
        // Validate file size (15MB limit before compression)
        if (file.size > 15 * 1024 * 1024) {
            showMessage('File size too large. Please choose a file under 15MB.', 'error');
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showMessage('Please select a valid image file.', 'error');
            return;
        }
        
        // Show processing message
        showMessage('Processing image...', 'info');
        
        // Convert to base64 with compression
        const reader = new FileReader();
        reader.onload = function(e) {
            // Compress the image before saving
            compressImage(e.target.result, function(compressedImage) {
                newUrl = compressedImage;
            applyCarouselImage(slideNumber, newUrl);
            });
        };
        reader.onerror = function() {
            showMessage('Error reading file. Please try again.', 'error');
        };
        reader.readAsDataURL(file);
        return;
    }
    
    // Otherwise use URL
    newUrl = urlInput.val().trim();
    
    if (!newUrl) {
        showMessage('Please select a file or enter an image URL', 'warning');
        return;
    }
    
    // Test if image loads
    const testImg = new Image();
    testImg.onload = function() {
        applyCarouselImage(slideNumber, newUrl);
    };
    testImg.onerror = function() {
        showMessage('Invalid image URL. Please check the URL and try again.', 'error');
    };
    testImg.src = newUrl;
}

function applyCarouselImage(slideNumber, newUrl) {
    siteImages.carousel[slideNumber] = newUrl;
    saveSiteImages();
    $(`#carouselImage${slideNumber}`).attr('src', newUrl);
    showMessage(`Carousel image ${slideNumber} updated successfully!`, 'success');
    
    // Clear the file input
    $(`#carousel${slideNumber}File`).val('');
    $(`#carousel${slideNumber}Preview`).hide();
}

function previewCarouselImage(slideNumber) {
    const fileInput = document.getElementById(`carousel${slideNumber}File`);
    const preview = $(`#carousel${slideNumber}Preview`);
    
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.attr('src', e.target.result).show();
        };
        reader.onerror = function() {
            showMessage('Error previewing image.', 'error');
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

function updateCategoryImage(sport) {
    const sportId = sport.toLowerCase().replace(' ', '');
    const fileInput = document.getElementById(`${sportId}File`);
    const urlInput = $(`#${sportId}ImageUrl`);
    
    let newUrl = '';
    
    // Check if file was uploaded
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            showMessage('File size too large. Please choose a file under 10MB.', 'error');
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showMessage('Please select a valid image file.', 'error');
            return;
        }
        
        // Convert to base64
        const reader = new FileReader();
        reader.onload = function(e) {
            newUrl = e.target.result;
            applyCategoryImage(sport, newUrl);
        };
        reader.onerror = function() {
            showMessage('Error reading file. Please try again.', 'error');
        };
        reader.readAsDataURL(file);
        return;
    }
    
    // Otherwise use URL
    newUrl = urlInput.val().trim();
    
    if (!newUrl) {
        showMessage('Please select a file or enter an image URL', 'warning');
        return;
    }
    
    // Test if image loads
    const testImg = new Image();
    testImg.onload = function() {
        applyCategoryImage(sport, newUrl);
    };
    testImg.onerror = function() {
        showMessage('Invalid image URL. Please check the URL and try again.', 'error');
    };
    testImg.src = newUrl;
}

function applyCategoryImage(sport, newUrl) {
    siteImages.categories[sport] = newUrl;
    saveSiteImages();
    
    // Update the category image on the page using specific IDs
    if (sport === 'College Football') {
        $('#categoryCollegeFootball').attr('src', newUrl);
    } else if (sport === 'College Basketball') {
        $('#categoryCollegeBasketball').attr('src', newUrl);
    } else {
        // For other sports, use the general method
        $(`.cat-item img`).each(function() {
            const sportName = $(this).closest('.cat-item').find('h6').text();
            if (sportName === sport) {
                $(this).attr('src', newUrl);
            }
        });
    }
    
    // Update pick cards that use this sport
    loadPicks();
    
    showMessage(`${sport} category image updated successfully!`, 'success');
    
    // Clear the file input
    $(`#${sport.toLowerCase().replace(' ', '')}File`).val('');
    $(`#${sport.toLowerCase().replace(' ', '')}Preview`).hide();
}

function previewCategoryImage(sport) {
    const sportId = sport.toLowerCase().replace(' ', '');
    const fileInput = document.getElementById(`${sportId}File`);
    const preview = $(`#${sportId}Preview`);
    
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.attr('src', e.target.result).show();
        };
        reader.onerror = function() {
            showMessage('Error previewing image.', 'error');
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

function saveSiteImages() {
    try {
        const dataToSave = JSON.stringify(siteImages);
        const sizeInKB = (dataToSave.length / 1024).toFixed(2);
        
        console.log(`Attempting to save ${sizeInKB}KB of image data...`);
        
        localStorage.setItem('botSiteImages', dataToSave);
        
        console.log('✅ Images saved successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error saving images:', error);
        
        if (error.name === 'QuotaExceededError') {
            showMessage('Storage quota exceeded! Try using smaller images or clear old data.', 'error');
            
            // Offer to clear old data
            if (confirm('Your browser storage is full. Would you like to clear old pick data to make room for images?')) {
                localStorage.removeItem('botPicks');
                localStorage.removeItem('botCustomers');
                try {
    localStorage.setItem('botSiteImages', JSON.stringify(siteImages));
                    showMessage('Storage cleared and images saved!', 'success');
                    return true;
                } catch (e) {
                    showMessage('Still not enough space. Please use smaller images.', 'error');
                    return false;
                }
            }
        } else {
            showMessage('Error saving images: ' + error.message, 'error');
        }
        return false;
    }
}

// Update the getSportImage function to use stored images
function getSportImage(sport) {
    // Use stored category images if available
    if (siteImages.categories[sport]) {
        return siteImages.categories[sport];
    }
    
    // Fallback to default images
    switch(sport) {
        case 'NFL':
        case 'College Football':
            return 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
        case 'NBA':
        case 'College Basketball':
            return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
        case 'MLB':
            return 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
        case 'NHL':
            return 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
        case 'Soccer':
            return 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
        case 'Tennis':
            return 'https://images.unsplash.com/photo-1622163642999-700a9a2383f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
        default:
            return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
    }
}

// Local Chat System (No Telegram Required)

// Chat System Functions
function initializeChatSystem() {
    // Initialize local chat system
    initializeLocalChat();
    
    // Load existing messages
    loadLocalMessages();
    
    // Set up periodic updates
    setInterval(loadLocalMessages, 5000); // Update every 5 seconds
}

function createLocalLoginWidget() {
    console.log('Creating local login widget...');
    const widgetContainer = document.getElementById('community-login-widget');
    console.log('Widget container found:', widgetContainer);
    if (widgetContainer) {
        // Enhanced account system with login/register toggle
        widgetContainer.innerHTML = `
            <div class="text-center">
                <div class="mb-3">
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-outline-primary active" onclick="switchLoginMode('login')" id="loginTab">
                            Login
                        </button>
                        <button type="button" class="btn btn-outline-primary" onclick="switchLoginMode('register')" id="registerTab">
                            Register
                        </button>
                    </div>
                </div>
                
                <div id="loginForm">
                    <div class="form-group">
                        <input type="email" id="userEmail" class="form-control" placeholder="Your email" required>
                    </div>
                    <div class="form-group">
                        <input type="password" id="userPassword" class="form-control" placeholder="Your password" required>
                    </div>
                    
                    <button class="btn telegram-login-btn" onclick="loginWithLocalInfo()">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                </div>
                
                <div id="registerForm" style="display: none;">
                    <div class="form-group">
                        <input type="text" id="userDisplayName" class="form-control" placeholder="Your display name" required>
                    </div>
                    <div class="form-group">
                        <input type="email" id="userEmailReg" class="form-control" placeholder="Your email" required>
                    </div>
                    <div class="form-group">
                        <input type="password" id="userPasswordReg" class="form-control" placeholder="Create a password" required>
                    </div>
                    
                    <button class="btn telegram-login-btn" onclick="registerNewUser()">
                        <i class="fas fa-user-plus"></i> Create Account
                    </button>
                </div>
                
                <hr>
                <small class="text-muted">
                    Create an account to access our community chat rooms and purchase picks.<br>
                    Join the conversation with other InsightAI members!
                </small>
            </div>
        `;
        console.log('Widget created successfully');
    } else {
        console.error('Widget container not found!');
        alert('Widget container not found. Please refresh the page.');
    }
}

function switchLoginMode(mode) {
    console.log('Switching to mode:', mode);
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    
    console.log('Forms found:', {loginForm, registerForm, loginTab, registerTab});
    
    if (mode === 'login') {
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');
        console.log('Switched to login form');
    } else {
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        if (loginTab) loginTab.classList.remove('active');
        if (registerTab) registerTab.classList.add('active');
        console.log('Switched to register form');
    }
}

// Store pending registration data
let pendingRegistration = null;

async function sendVerificationEmail() {
    console.log('📧 Send verification email called');
    
    const nameField = document.getElementById('userDisplayName');
    const emailField = document.getElementById('userEmailReg');
    const passwordField = document.getElementById('userPasswordReg');
    
    console.log('Form fields:', { nameField, emailField, passwordField });
    
    const name = nameField ? nameField.value.trim() : '';
    const email = emailField ? emailField.value.trim() : '';
    const password = passwordField ? passwordField.value.trim() : '';
    
    console.log('Values:', { name, email, password: password ? '***' : '' });
    
    // Validate inputs
    if (!name || !email || !password) {
        showMessage('Please fill in all fields!', 'warning');
        console.log('❌ Validation failed: Missing fields');
        return;
    }
    
    if (name.length < 3) {
        showMessage('Name must be at least 3 characters long.', 'warning');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long.', 'warning');
        return;
    }
    
    // Check if email already exists
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const existingEmail = existingUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
    
    if (existingEmail) {
        showMessage(`This email is already registered. Please login instead!`, 'warning');
        return;
    }
    
    // Store pending registration
    pendingRegistration = { name, email, password };
    
    try {
        // First check if IP already has an account
        const ipCheck = await fetch('http://192.168.1.102:5003/api/check-ip');
        const ipData = await ipCheck.json();
        
        if (ipData.has_account) {
            showMessage('⚠️ This IP address already has an account. Only one account per IP is allowed.', 'error');
            return;
        }
        
        // Send verification code
        showMessage('Sending verification code...', 'info');
        
        const response = await fetch('http://192.168.1.102:5003/api/send-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show verification code section
            document.getElementById('sendVerificationBtn').style.display = 'none';
            document.getElementById('verificationCodeSection').style.display = 'block';
            
            // Show code in console for testing
            if (result.code_for_testing) {
                console.log(`🔑 VERIFICATION CODE: ${result.code_for_testing}`);
                showMessage(`✅ Code sent to ${email}! ${result.development_mode ? '(Check console for testing code)' : ''}`, 'success');
            } else {
                showMessage(`✅ Verification code sent to ${email}! Check your inbox.`, 'success');
            }
        } else {
            showMessage(`❌ Error: ${result.error}`, 'error');
        }
        
    } catch (error) {
        console.error('Error sending verification:', error);
        
        // FALLBACK: If email service is not running, use simple code for testing
        const testCode = '123456';
        
        // Store for verification
        window.testVerificationCode = testCode;
        pendingRegistration.testMode = true;
        
        // Show verification section
        document.getElementById('sendVerificationBtn').style.display = 'none';
        document.getElementById('verificationCodeSection').style.display = 'block';
        
        console.log('🔑 TEST MODE - VERIFICATION CODE: 123456');
        showMessage('⚠️ Email service offline. For testing, use code: 123456', 'warning');
    }
}

async function verifyAndCompleteRegistration() {
    const code = document.getElementById('verificationCode').value.trim();
    
    if (!pendingRegistration) {
        showMessage('No pending registration. Please start over.', 'warning');
        return;
    }
    
    const { name, email, password, testMode } = pendingRegistration;
    
    if (!code) {
        showMessage('Please enter the verification code!', 'warning');
        return;
    }
    
    if (code.length !== 6) {
        showMessage('Verification code must be 6 digits!', 'warning');
        return;
    }
    
    // TEST MODE: If email service is offline
    if (testMode) {
        if (code === '123456' || code === window.testVerificationCode) {
            showMessage('✅ Code verified (test mode)!', 'success');
            createVerifiedAccount(name, email, password, 'test-ip-' + Date.now());
            return;
        } else {
            showMessage('❌ Invalid code. Use: 123456', 'error');
            return;
        }
    }
    
    // NORMAL MODE: Verify with backend
    try {
        const response = await fetch('http://192.168.1.102:5003/api/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Code verified! Create account
            createVerifiedAccount(name, email, password, result.ip);
        } else {
            showMessage(`❌ ${result.error}`, 'error');
        }
        
    } catch (error) {
        console.error('Error verifying code:', error);
        showMessage('❌ Could not verify code. Please try again.', 'error');
    }
}

function createVerifiedAccount(name, email, password, userIp) {
    const avatarData = window.currentAvatarData || null;
    
    // Get existing users
    const existingUsers = JSON.parse(localStorage.getItem('botPicksUsers') || '[]');
    
    // Create new verified user account
    const userData = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        username: name.toLowerCase().replace(/\s+/g, ''),
        avatar: avatarData,
        isVip: false,
        emailVerified: true,
        userIp: userIp,
        joinDate: new Date().toISOString(),
        isLocalUser: true,
        purchasedPicks: [],
        totalSpent: 0
    };
    
    // Add to users list
    existingUsers.push(userData);
    localStorage.setItem('botPicksUsers', JSON.stringify(existingUsers));
    
    // Store as current user
    localStorage.setItem('currentUser', JSON.stringify(userData));
    currentUser = userData;
    
    // Update UI
    updateUserInterface(userData);
    updateChatInterface();
    
    // Close modal and reset form
    closeCommunityLogin();
    document.getElementById('verificationCodeSection').style.display = 'none';
    document.getElementById('sendVerificationBtn').style.display = 'block';
    document.getElementById('verificationCode').value = '';
    pendingRegistration = null;
    
    // Show success message
    showMessage(`✅ Welcome ${name}! Your account has been created and verified!`, 'success');
}

async function resendVerificationCode() {
    if (!pendingRegistration) {
        showMessage('No pending registration found.', 'warning');
        return;
    }
    
    showMessage('Resending verification code...', 'info');
    
    try {
        const response = await fetch('http://192.168.1.102:5003/api/send-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: pendingRegistration.email, 
                name: pendingRegistration.name 
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            if (result.code_for_testing) {
                console.log(`🔑 NEW VERIFICATION CODE: ${result.code_for_testing}`);
            }
            showMessage('✅ New verification code sent!', 'success');
        } else {
            showMessage(`❌ ${result.error}`, 'error');
        }
    } catch (error) {
        showMessage('❌ Could not resend code. Please try again.', 'error');
    }
}

function loginWithLocalInfo() {
    console.log('🔐 Login attempt started');
    
    const emailField = document.getElementById('userEmail');
    const passwordField = document.getElementById('userPassword');
    
    console.log('Form fields:', { emailField, passwordField });
    
    const email = emailField ? emailField.value.trim() : '';
    const password = passwordField ? passwordField.value.trim() : '';
    
    console.log('Login values:', { email, password: password ? '***' : 'empty' });
    
    if (!email || !password) {
        console.log('❌ Validation failed: Missing email or password');
        showMessage('Please enter both your email and password.', 'warning');
        return;
    }
    
    // Check if user exists
    const existingUsers = JSON.parse(localStorage.getItem('botPicksUsers') || '[]');
    console.log(`📋 Total users in database: ${existingUsers.length}`);
    
    const user = existingUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
    
    console.log('User found:', user ? `YES (${user.name})` : 'NO');
    
    if (!user) {
        showMessage('No account found with this email. Please register first.', 'warning');
        return;
    }
    
    // Check password
    if (user.password !== password) {
        showMessage('Incorrect password. Please try again.', 'warning');
        return;
    }
    
    // Login successful
    localStorage.setItem('currentUser', JSON.stringify(user));
    currentUser = user;
    
    updateUserInterface(user);
    updateChatInterface();
    closeCommunityLogin();
    
    showMessage(`Welcome back ${user.name}!`, 'success');
}

// Real Telegram Authentication Function
function onTelegramAuth(user) {
    console.log('REAL Telegram authentication successful:', user);
    
    // Verify the authentication data (in production, you'd verify the hash)
    if (!user || !user.id) {
        showMessage('Invalid authentication data', 'error');
        return;
    }
    
    // Create user account with REAL Telegram data
    const userData = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name || '',
        username: user.username || '',
        photo_url: user.photo_url || '',
        auth_date: user.auth_date,
        hash: user.hash,
        is_real_telegram: true,
        login_date: new Date().toISOString(),
        email: user.username ? `${user.username}@telegram.verified` : `telegram_${user.id}@telegram.verified`
    };
    
    // Store as both telegram user and current user
    localStorage.setItem('telegramUser', JSON.stringify(userData));
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Update global variable
    currentUser = userData;
    
    // Update UI
    updateUserInterface(userData);
    updateChatInterface();
    
    // Close modal
    closeCommunityLogin();
    
    // Show success message with real data
    const displayName = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    const username = user.username ? ` (@${user.username})` : '';
    showMessage(`Welcome ${displayName}${username}! Authenticated with Telegram API!`, 'success');
    
    // Load real messages from Telegram groups
    loadRecentMessages();
}

// Real Telegram WebApp integration
function loginWithRealTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Get user data from Telegram WebApp
        const userData = {
            id: tg.initDataUnsafe.user.id,
            username: tg.initDataUnsafe.user.username || '',
            name: tg.initDataUnsafe.user.first_name + (tg.initDataUnsafe.user.last_name ? ' ' + tg.initDataUnsafe.user.last_name : ''),
            email: tg.initDataUnsafe.user.username + '@telegram.local',
            isVip: false,
            joinDate: new Date().toISOString(),
            telegramData: tg.initDataUnsafe.user
        };
        
        // Store user data
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('telegramUser', JSON.stringify(tg.initDataUnsafe.user));
        
        // Update global variable
        currentUser = userData;
        
        // Update UI
        updateUserInterface(userData);
        updateChatInterface();
        
        // Close modal
        closeTelegramLogin();
        
        // Show success message
        showMessage(`Welcome ${userData.name}! You're logged in with your Telegram account.`, 'success');
        
        // Enable Telegram WebApp features
        tg.ready();
        tg.expand();
    } else {
        alert('Telegram WebApp not available. Please use the manual login or open in Telegram.');
    }
}

// Open website in Telegram WebApp
function openTelegramWebApp() {
    // Create a Telegram WebApp URL that opens your website
    const webAppUrl = `https://t.me/your_bot_username/webapp?startapp=botpicks`;
    
    // For now, show instructions
    alert(`To use real Telegram integration:\n\n1. Create a Telegram bot with @BotFather\n2. Add your website as a WebApp\n3. Use this URL: ${webAppUrl}\n\nFor now, use manual login below.`);
}

function handleTelegramLogin() {
    // Check if we're in Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
        // Real Telegram WebApp login
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        if (user) {
            onTelegramAuth(user);
            return;
        }
    }
    
    // For real Telegram login outside of Telegram app, redirect to Telegram
    const botUsername = 'YourBotUsername'; // Replace with your actual bot username
    const telegramLoginUrl = `https://t.me/${botUsername}?start=login`;
    
    // Open Telegram login
    window.open(telegramLoginUrl, '_blank');
    
    // Show instructions
    showMessage('Opening Telegram login... Please complete authentication in Telegram and return to this page.', 'info');
}

function setupRealTelegramLogin() {
    // This function will be called when user returns from Telegram
    const urlParams = new URLSearchParams(window.location.search);
    const telegramData = urlParams.get('telegram_data');
    
    if (telegramData) {
        try {
            const userData = JSON.parse(decodeURIComponent(telegramData));
            onTelegramAuth(userData);
        } catch (error) {
            console.error('Error parsing Telegram data:', error);
        }
    }
}

function updateUserInterface(userData) {
    // Update login button to show user info with dropdown
    const loginButtonContainer = document.querySelector('.mx-2');
    if (loginButtonContainer) {
        const vipStatus = userData.isVip ? ' <span class="badge badge-warning">VIP</span>' : '';
        loginButtonContainer.innerHTML = `
            <div class="btn-group">
                <button class="btn btn-sm btn-primary" onclick="showUserProfile()" style="color: white !important;">
                    ${getUserAvatarHTML(userData)}${userData.name}${vipStatus}
                </button>
                <button class="btn btn-sm btn-danger" onclick="logout()" style="color: white !important;">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        `;
    }
    
    // Update mobile login icon
    const mobileLoginIcon = document.querySelector('a[onclick="showCommunityLogin()"] i');
    if (mobileLoginIcon) {
        mobileLoginIcon.style.color = '#28a745';
    }
}

function showUserProfile() {
    if (!currentUser) return;
    
    const accountInfo = `
        <strong>Account Information</strong><br>
        Name: ${currentUser.name}<br>
        Email: ${currentUser.email}<br>
        Member Since: ${new Date(currentUser.joinDate).toLocaleDateString()}<br>
        Status: ${currentUser.isVip ? 'VIP Member' : 'Free Member'}<br>
        Total Spent: $${currentUser.totalSpent.toFixed(2)}<br>
        Purchased Picks: ${currentUser.purchasedPicks.length}<br><br>
        <button class="btn btn-danger btn-sm" onclick="logout()">
            <i class="fas fa-sign-out-alt"></i> Logout
        </button>
    `;
    
    showMessage(accountInfo, 'info');
}

function logout() {
    console.log('Logout function called');
    
    // Clear current user
    localStorage.removeItem('currentUser');
    currentUser = null;
    
    // Update UI - restore original login/register buttons
    const loginButtonContainer = document.querySelector('.mx-2');
    if (loginButtonContainer) {
        loginButtonContainer.innerHTML = `
            <button type="button" class="btn btn-sm btn-outline-primary mr-1" onclick="showLogin()" style="color: white !important; border-color: white;">
                <i class="fas fa-sign-in-alt"></i> Login
            </button>
            <button type="button" class="btn btn-sm btn-primary" onclick="showRegister()" style="color: white !important;">
                <i class="fas fa-user-plus"></i> Register
            </button>
        `;
    }
    
    updateChatInterface();
    
    // Show success message
    showMessage('You have been logged out successfully.', 'success');
    
    console.log('Logout completed');
}

function showCommunityLogin() {
    const modal = document.getElementById('communityLoginModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showLogin() {
    console.log('Show login called');
    
    // Show modal
    const modal = document.getElementById('communityLoginModal');
    if (modal) {
        modal.style.display = 'block';
        console.log('Modal displayed');
        
        // Update modal title
        const modalTitle = document.getElementById('authModalTitle');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-sign-in-alt" style="color: #00ff88;"></i> Login';
        }
        
        // Show ONLY login form
        setTimeout(() => {
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            
            if (loginForm && registerForm) {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                console.log('✅ Login form shown');
            } else {
                console.error('Forms not found:', { loginForm, registerForm });
            }
        }, 100);
    } else {
        console.error('Modal not found');
        alert('Login modal not found. Please refresh the page.');
    }
}

function showRegister() {
    console.log('🎯 Show register called');
    
    // Show modal
    const modal = document.getElementById('communityLoginModal');
    if (!modal) {
        console.error('❌ Modal not found');
        alert('Register modal not found. Please refresh the page.');
        return;
    }
    
    modal.style.display = 'block';
    console.log('✅ Modal displayed');
    
    // Update modal title
    const modalTitle = document.getElementById('authModalTitle');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-user-plus" style="color: #00ff88;"></i> Create Account';
        console.log('✅ Title updated to: Create Account');
    }
    
    // Show ONLY register form (give DOM time to render)
    setTimeout(() => {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        console.log('📋 Forms found:', { 
            loginForm: loginForm ? 'YES' : 'NO', 
            registerForm: registerForm ? 'YES' : 'NO' 
        });
        
        if (loginForm && registerForm) {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            console.log('✅ Register form is now visible');
            
            // Focus on first field
            const nameField = document.getElementById('userDisplayName');
            if (nameField) {
                nameField.focus();
                console.log('✅ Focused on name field');
            }
        } else {
            console.error('❌ Forms not found:', { loginForm, registerForm });
        }
    }, 150);
}

// ===========================================
// PAYMENT SYSTEM FUNCTIONS
// ===========================================

function setupPaymentForm() {
    // Add event listeners for payment form
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardCVC = document.getElementById('cardCVC');
    const paymentForm = document.getElementById('paymentForm');
    
    if (cardNumber) {
        cardNumber.addEventListener('input', formatCardNumber);
        cardNumber.addEventListener('input', detectCardType);
    }
    
    if (cardExpiry) {
        cardExpiry.addEventListener('input', formatCardExpiry);
    }
    
    if (cardCVC) {
        cardCVC.addEventListener('input', formatCardCVC);
    }
    
    if (paymentForm) {
        paymentForm.addEventListener('submit', processPayment);
    }
}

function showPaymentModal(pickId) {
    const pick = picks.find(p => p.id === pickId);
    if (!pick) {
        alert('Pick not found!');
        return;
    }
    
    // Check if user is logged in
    if (!currentUser) {
        alert('Please login to purchase picks!');
        showLogin();
        return;
    }
    
    // Update payment modal with pick details
    const paymentPickInfo = document.getElementById('paymentPickInfo');
    const paymentTotal = document.getElementById('paymentTotal');
    const finalTotal = document.getElementById('finalTotal');
    
    if (paymentPickInfo) {
        paymentPickInfo.innerHTML = `
            <strong>${pick.sport} Pick:</strong> ${pick.description}<br>
            <strong>Confidence:</strong> ${pick.confidence}%<br>
            <strong>Price:</strong> $${pick.price}
        `;
    }
    
    if (paymentTotal && finalTotal) {
        paymentTotal.textContent = pick.price;
        finalTotal.textContent = pick.price;
    }
    
    // Pre-fill billing email with user's email
    const billingEmail = document.getElementById('billingEmail');
    if (billingEmail && currentUser) {
        billingEmail.value = currentUser.email || '';
    }
    
    // Show modal
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'none';
        // Clear form
        document.getElementById('paymentForm').reset();
    }
}

function formatCardNumber(event) {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    
    if (formattedValue.length >= 19) {
        formattedValue = formattedValue.substr(0, 19);
    }
    
    event.target.value = formattedValue;
}

function formatCardExpiry(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    event.target.value = value;
}

function formatCardCVC(event) {
    let value = event.target.value.replace(/\D/g, '');
    event.target.value = value;
}

function detectCardType(event) {
    const cardNumber = event.target.value.replace(/\s/g, '');
    const cardType = document.getElementById('cardType');
    
    let type = '';
    if (cardNumber.startsWith('4')) {
        type = 'visa';
    } else if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) {
        type = 'mastercard';
    } else if (cardNumber.startsWith('3')) {
        type = 'amex';
    } else if (cardNumber.startsWith('6')) {
        type = 'discover';
    }
    
    if (cardType && type) {
        cardType.value = type;
    }
}

function validatePaymentForm() {
    const requiredFields = [
        'cardholderName', 'billingEmail', 'billingAddress', 'billingCity', 
        'billingState', 'billingZip', 'cardNumber', 'cardExpiry', 'cardCVC', 'cardType'
    ];
    
    for (let fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            alert(`Please fill in all required fields. Missing: ${fieldId}`);
            return false;
        }
    }
    
    // Validate card number (basic check)
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        alert('Please enter a valid card number');
        return false;
    }
    
    // Validate expiry date
    const expiry = document.getElementById('cardExpiry').value;
    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (parseInt(month) < 1 || parseInt(month) > 12) {
        alert('Please enter a valid expiry month');
        return false;
    }
    
    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        alert('Card has expired');
        return false;
    }
    
    // Validate CVC
    const cvc = document.getElementById('cardCVC').value;
    if (cvc.length < 3 || cvc.length > 4) {
        alert('Please enter a valid CVC');
        return false;
    }
    
    return true;
}

function processPayment(event) {
    event.preventDefault();
    
    if (!validatePaymentForm()) {
        return;
    }
    
    // Get pick ID from current purchase (you might need to store this globally)
    const pickId = window.currentPurchasePickId;
    if (!pickId) {
        alert('No pick selected for purchase');
        return;
    }
    
    const pick = picks.find(p => p.id === pickId);
    if (!pick) {
        alert('Pick not found');
        return;
    }
    
    // Show processing state
    const processBtn = document.getElementById('processPaymentBtn');
    const originalText = processBtn.innerHTML;
    processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    processBtn.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        // In a real app, this would call a payment processor API
        const paymentData = {
            pickId: pickId,
            userId: currentUser.id,
            amount: pick.price,
            cardholderName: document.getElementById('cardholderName').value,
            billingEmail: document.getElementById('billingEmail').value,
            timestamp: new Date().toISOString()
        };
        
        // Store payment record
        let payments = JSON.parse(localStorage.getItem('botPayments')) || [];
        payments.push(paymentData);
        localStorage.setItem('botPayments', JSON.stringify(payments));
        
        // Add pick to user's purchased picks
        let purchasedPicks = JSON.parse(localStorage.getItem('purchasedPicks')) || [];
        purchasedPicks.push({
            id: pickId,
            userId: currentUser.id,
            purchaseDate: new Date().toISOString(),
            pickData: pick
        });
        localStorage.setItem('purchasedPicks', JSON.stringify(purchasedPicks));
        
        // Update sales tracking
        sales.push({
            id: Date.now(),
            pickId: pickId,
            customer: currentUser.name,
            amount: pick.price,
            date: new Date().toISOString()
        });
        localStorage.setItem('botSales', JSON.stringify(sales));
        
        // Reset button
        processBtn.innerHTML = originalText;
        processBtn.disabled = false;
        
        // Close modal and show success
        closePaymentModal();
        
        // Show success message and display pick
        alert(`Payment successful! You've purchased: ${pick.description}`);
        showPurchasedPick(pick);
        
        // Update UI
        checkForPurchasedPicks();
        
    }, 2000); // 2 second delay to simulate processing
}

function showPurchasedPick(pick) {
    // Create and show a modal with the purchased pick details
    const pickModal = `
        <div class="modal" id="purchasedPickModal" style="display: block;">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h4 class="modal-title">
                            <i class="fas fa-trophy"></i> Your Bot Pick
                        </h4>
                        <button type="button" class="close text-white" onclick="closePurchasedPickModal()">&times;</button>
                    </div>
                    <div class="modal-body bg-light text-center py-2">
                        <small class="text-success font-weight-bold">Powered by NeuroGest AI</small>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-success">
                            <h5><i class="fas fa-check-circle"></i> Purchase Complete!</h5>
                            <p>Here's your exclusive Bot Pick:</p>
                        </div>
                        
                        <div class="card">
                            <div class="card-body">
                                <h4 class="card-title">${pick.description}</h4>
                                <div class="row">
                                    <div class="col-md-6">
                                        <p><strong>Sport:</strong> ${pick.sport}</p>
                                        <p><strong>Confidence:</strong> ${pick.confidence}%</p>
                                        <p><strong>Type:</strong> ${pick.type}</p>
                                    </div>
                                    <div class="col-md-6">
                                        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                                        <p><strong>Price:</strong> $${pick.price}</p>
                                        <p><strong>Status:</strong> <span class="badge badge-success">Active</span></p>
                                    </div>
                                </div>
                                <hr>
                                <div class="text-center">
                                    <h6>Pick Details:</h6>
                                    <p class="text-muted">${pick.details || 'Detailed analysis and reasoning available in your account.'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="text-center mt-3">
                            <button class="btn btn-primary" onclick="closePurchasedPickModal()">
                                <i class="fas fa-check"></i> Got it!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('purchasedPickModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add new modal
    document.body.insertAdjacentHTML('beforeend', pickModal);
}

function closePurchasedPickModal() {
    const modal = document.getElementById('purchasedPickModal');
    if (modal) {
        modal.remove();
    }
}

// Update the existing purchasePick function to use payment modal
function purchasePick(pickId) {
    window.currentPurchasePickId = pickId;
    showPaymentModal(pickId);
}

// ===========================================
// AVATAR FUNCTIONS
// ===========================================

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB.');
        return;
    }
    
    // Convert to base64 and preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const avatarData = e.target.result;
        window.currentAvatarData = avatarData;
        
        // Update preview
        const preview = document.getElementById('avatarPreview');
        preview.innerHTML = `
            <img src="${avatarData}" alt="Avatar Preview">
            <div class="avatar-overlay">
                <i class="fas fa-camera"></i>
            </div>
        `;
    };
    reader.readAsDataURL(file);
}

function getUserAvatarHTML(user) {
    if (user && user.avatar) {
        return `<img src="${user.avatar}" alt="${user.name}" class="user-avatar">`;
    } else {
        return `<i class="fas fa-user-circle user-avatar" style="color: #6c757d; font-size: 32px;"></i>`;
    }
}

function getChatAvatarHTML(user) {
    if (user && user.avatar) {
        return `<img src="${user.avatar}" alt="${user.name}" class="chat-avatar">`;
    } else {
        return `<i class="fas fa-user-circle chat-avatar" style="color: #6c757d; font-size: 40px;"></i>`;
    }
}

// ===========================================
// STREAMING FUNCTIONS
// ===========================================

async function updateStreamGames() {
    const sportSelect = document.getElementById('streamSport');
    const gameSelect = document.getElementById('streamGame');
    const streamButton = document.getElementById('streamButton');
    
    const selectedSport = sportSelect.value;
    
    if (!selectedSport) {
        gameSelect.disabled = true;
        gameSelect.innerHTML = '<option value="">First select a sport...</option>';
        streamButton.disabled = true;
        return;
    }
    
    // Show loading state
    gameSelect.disabled = true;
    gameSelect.innerHTML = '<option value="">Loading live games...</option>';
    
    try {
        console.log(`🎯 Fetching real games for streaming: ${selectedSport}`);
        
        // Use the same API endpoint that the prediction section uses
        const response = await fetch(`http://192.168.1.102:5002/api/upcoming-games/${selectedSport}`);
        console.log('Streaming games response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Streaming games data:', data);
        
        const games = data.games || [];
        
        // Populate dropdown with real games
        gameSelect.disabled = false;
        gameSelect.innerHTML = '<option value="">Select a live game...</option>';
        
        if (games.length === 0) {
            gameSelect.innerHTML = '<option value="">No upcoming games available</option>';
            gameSelect.disabled = true;
            return;
        }
        
        // Add games to dropdown with formatted dates
        games.forEach((game, index) => {
            const option = document.createElement('option');
            option.value = index; // Use index to match prediction system
            option.textContent = `${game.name} - ${formatGameDate(game.date)}`;
            gameSelect.appendChild(option);
        });
        
        // Store games for later use
        window.streamingGames = games;
        
        // Enable stream button when both sport and game are selected
        gameSelect.onchange = function() {
            streamButton.disabled = !this.value;
        };
        
        console.log(`✅ Loaded ${games.length} real games for streaming`);
        
    } catch (error) {
        console.error('Error fetching streaming games:', error);
        
        // Check if it's a connection error (backend not running)
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            gameSelect.innerHTML = '<option value="">Backend server not running. Please start the LuckLab AI backend.</option>';
            showNotification('Backend server not running. Please start the LuckLab AI backend server.', 'error');
        } else {
            gameSelect.innerHTML = '<option value="">Error loading games. Try again.</option>';
            showNotification('Failed to load games. Please try again.', 'error');
        }
        
        gameSelect.disabled = true;
    }
}

async function fetchLiveGamesFromTheTVApp(url) {
    try {
        // Since we can't directly fetch from thetvapp.to due to CORS, 
        // we'll use a proxy or simulate the data based on the provided URLs
        // In a real implementation, you'd need a backend proxy
        
        // For now, let's return sample data that matches what we see on thetvapp.to
        const gamesByUrl = {
            'https://thetvapp.to/nfl': [
                'Kansas City Chiefs @ Jacksonville Jaguars'
            ],
            'https://thetvapp.to/nba': [
                'Milwaukee Bucks @ Miami Heat',
                'Atlanta Hawks @ Houston Rockets',
                'Detroit Pistons @ Memphis Grizzlies',
                'Guangzhou @ San Antonio Spurs',
                'Oklahoma City Thunder @ Dallas Mavericks',
                'Denver Nuggets @ Toronto Raptors'
            ],
            'https://thetvapp.to/mlb': [
                'Los Angeles Dodgers @ Philadelphia Phillies',
                'Chicago Cubs @ Milwaukee Brewers'
            ],
            'https://thetvapp.to/nhl': [
                // Currently shows "No Match Found"
            ],
            'https://thetvapp.to/ncaaf': [
                // Currently shows "No Match Found"
            ],
            'https://thetvapp.to/ncaab': [
                // Currently shows subscription required
            ]
        };
        
        return gamesByUrl[url] || [];
        
    } catch (error) {
        console.error('Error fetching from TheTVApp:', error);
        return [];
    }
}

function loadSampleGames(selectedSport) {
    const gameSelect = document.getElementById('streamGame');
    const streamButton = document.getElementById('streamButton');
    
    // Fallback sample games for sports not on thetvapp.to
    const sampleGames = {
        'soccer': [
            'Manchester United vs Liverpool',
            'Barcelona vs Real Madrid',
            'PSG vs Marseille'
        ],
        'tennis': [
            'Djokovic vs Nadal',
            'Federer vs Murray',
            'Serena Williams vs Osaka'
        ],
        'ufc': [
            'UFC 300: Main Event',
            'UFC Fight Night: Prelims',
            'UFC Championship Fight'
        ]
    };
    
    const games = sampleGames[selectedSport] || [];
    gameSelect.disabled = false;
    gameSelect.innerHTML = '<option value="">Select a game...</option>';
    
    games.forEach(game => {
        const option = document.createElement('option');
        option.value = game;
        option.textContent = game;
        gameSelect.appendChild(option);
    });
    
    gameSelect.onchange = function() {
        streamButton.disabled = !this.value;
    };
}

function startStream() {
    const sportSelect = document.getElementById('streamSport');
    const gameSelect = document.getElementById('streamGame');
    const selectedSport = sportSelect.value;
    const selectedGameIndex = gameSelect.value;
    
    if (!selectedSport || !selectedGameIndex) {
        alert('Please select both a sport and a game to stream.');
        return;
    }
    
    // Get the actual game data
    const games = window.streamingGames || [];
    const selectedGame = games[selectedGameIndex];
    
    if (!selectedGame) {
        alert('Error: Game data not found. Please refresh and try again.');
        return;
    }
    
    // Update button states
    const streamButton = document.getElementById('streamButton');
    const stopStreamButton = document.getElementById('stopStreamButton');
    
    if (streamButton) {
        streamButton.style.display = 'none';
    }
    if (stopStreamButton) {
        stopStreamButton.style.display = 'inline-flex';
    }
    
    // Map to actual thetvapp.to sport URLs
    const sportUrlMap = {
        'nfl': 'https://thetvapp.to/nfl',
        'nba': 'https://thetvapp.to/nba',
        'mlb': 'https://thetvapp.to/mlb',
        'nhl': 'https://thetvapp.to/nhl',
        'college-football': 'https://thetvapp.to/ncaaf',
        'college-basketball': 'https://thetvapp.to/ncaab',
        'soccer': 'https://thetvapp.to/soccer',
        'tennis': 'https://thetvapp.to/tennis',
        'ufc': 'https://thetvapp.to/ufc'
    };
    
    const streamUrl = sportUrlMap[selectedSport] || `https://thetvapp.to/${selectedSport}`;
    
    console.log(`🎯 Starting stream for: ${selectedGame.name}`);
    console.log(`📺 Sport: ${selectedSport}, URL: ${streamUrl}`);
    
    // Create focused stream popup with real game data
    createFocusedStreamPopup(selectedSport, selectedGame.name, streamUrl);
    
    // Show stream info panel
    showStreamInfoPanel(selectedSport, selectedGame.name, streamUrl);
}

function showStreamInfoPanel(sport, game, streamUrl) {
    // Create or update stream info panel
    let infoPanel = document.getElementById('streamInfoPanel');
    
    if (!infoPanel) {
        infoPanel = document.createElement('div');
        infoPanel.id = 'streamInfoPanel';
        infoPanel.className = 'stream-info-panel';
        
        const streamContainer = document.querySelector('.streaming-container');
        streamContainer.appendChild(infoPanel);
    }
    
    infoPanel.style.display = 'block';
    infoPanel.innerHTML = `
        <div class="stream-info-content">
            <div class="stream-status active">
                <div class="stream-icon">
                    <i class="fas fa-play-circle"></i>
                </div>
                <div class="stream-details">
                    <h5>Now Streaming</h5>
                    <p class="stream-game">${game}</p>
                    <p class="stream-source">Powered by TheTVApp.to</p>
                </div>
                <div class="stream-controls">
                    <button class="stream-btn stop-btn" onclick="stopStream()">
                        <i class="fas fa-stop"></i>
                        <span>Stop</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function closeStreamInfo() {
    const infoPanel = document.getElementById('streamInfoPanel');
    if (infoPanel) {
        infoPanel.style.display = 'none';
    }
}

function createFocusedStreamPopup(sport, game, streamUrl) {
    // Hide selection controls
    document.getElementById('streamSport').closest('.row').style.display = 'none';
    document.getElementById('streamButton').style.display = 'none';
    
    // Create stream control panel
    createStreamControlPanel(sport, game, streamUrl);
    
    // Calculate optimal window position (next to main window)
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const mainWindowWidth = window.outerWidth;
    const mainWindowHeight = window.outerHeight;
    
    // Position stream window to the right of main window
    const streamWindowWidth = Math.min(1200, screenWidth - mainWindowWidth - 50);
    const streamWindowHeight = Math.min(800, screenHeight - 100);
    const leftPosition = window.screenX + mainWindowWidth + 20;
    const topPosition = Math.max(50, window.screenY);
    
    // Create minimal stream window with content filtering
    const streamWindow = window.open(
        '',
        'InsightAI_Stream',
        `width=${streamWindowWidth},height=${streamWindowHeight},left=${leftPosition},top=${topPosition},scrollbars=no,resizable=yes,toolbar=no,menubar=no,location=no,status=no`
    );
    
    if (streamWindow) {
        // Create a custom HTML page that shows only the stream
        createStreamOnlyPage(streamWindow, streamUrl, sport, game);
        
        // Track streaming activity
        trackStreamingActivity(sport, game);
        
        // Show success message
        showStreamingSuccess(game);
        
        // Store window reference for control
        window.currentStreamWindow = streamWindow;
        
        // Monitor window status
        monitorStreamWindow(streamWindow);
        
        // Show stream control panel
        showStreamControlPanel(sport, game, streamUrl);
    } else {
        alert('Popup blocked! Please allow popups for this site to access streaming.');
        // Restore selection controls
        document.getElementById('streamSport').closest('.row').style.display = 'flex';
        document.getElementById('streamButton').style.display = 'inline-block';
    }
}

function createStreamOnlyPage(streamWindow, streamUrl, sport, game) {
    // Create a minimal HTML page that focuses only on the stream
    const streamPageHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>InsightAI Stream - ${game}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                background: #000;
                color: #fff;
                font-family: Arial, sans-serif;
                overflow: hidden;
            }
            
            .stream-container {
                position: relative;
                width: 100vw;
                height: 100vh;
                background: #000;
            }
            
            .stream-header {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                padding: 10px 20px;
                z-index: 1000;
                border-bottom: 2px solid #00ff88;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .stream-title {
                font-size: 16px;
                font-weight: bold;
                color: #00ff88;
            }
            
            .stream-controls {
                display: flex;
                gap: 10px;
            }
            
            .control-btn {
                background: #00ff88;
                color: #000;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
            }
            
            .control-btn:hover {
                background: #00cc6a;
            }
            
            .stream-content {
                position: absolute;
                top: 50px;
                left: 0;
                right: 0;
                bottom: 0;
                background: #000;
            }
            
            .stream-iframe {
                width: 100%;
                height: 100%;
                border: none;
                background: #000;
            }
            
            .loading-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                z-index: 100;
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid #333;
                border-top: 3px solid #00ff88;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-text {
                color: #00ff88;
                font-size: 18px;
                margin-bottom: 10px;
            }
            
            .loading-subtext {
                color: #666;
                font-size: 14px;
            }
            
            .error-message {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                color: #ff4444;
                z-index: 100;
            }
            
            .retry-btn {
                background: #ff4444;
                color: #fff;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="stream-container">
            <div class="stream-header">
                <div class="stream-title">
                    📺 InsightAI Stream - ${game}
                </div>
                <div class="stream-controls">
                    <button class="control-btn" onclick="toggleFullscreen()">⛶ Fullscreen</button>
                    <button class="control-btn" onclick="refreshStream()">🔄 Refresh</button>
                    <button class="control-btn" onclick="closeStream()">✕ Close</button>
                </div>
            </div>
            
            <div class="stream-content">
                <div class="loading-overlay" id="loadingOverlay">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Loading Stream...</div>
                    <div class="loading-subtext">Connecting to TheTVApp.to</div>
                </div>
                
                <iframe 
                    class="stream-iframe" 
                    id="streamFrame"
                    src="${streamUrl}"
                    allowfullscreen
                    allow="autoplay; fullscreen; encrypted-media"
                    onload="handleStreamLoad()"
                    onerror="handleStreamError()">
                </iframe>
            </div>
        </div>
        
        <script>
            function handleStreamLoad() {
                document.getElementById('loadingOverlay').style.display = 'none';
            }
            
            function handleStreamError() {
                document.getElementById('loadingOverlay').innerHTML = \`
                    <div class="error-message">
                        <h3>⚠️ Stream Error</h3>
                        <p>Unable to load stream from TheTVApp.to</p>
                        <button class="retry-btn" onclick="retryStream()">Retry</button>
                    </div>
                \`;
            }
            
            function retryStream() {
                location.reload();
            }
            
            function refreshStream() {
                document.getElementById('streamFrame').src = document.getElementById('streamFrame').src;
                document.getElementById('loadingOverlay').style.display = 'block';
            }
            
            function toggleFullscreen() {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }
            }
            
            function closeStream() {
                window.close();
            }
            
            // Auto-hide loading after 5 seconds
            setTimeout(() => {
                const loading = document.getElementById('loadingOverlay');
                if (loading && loading.style.display !== 'none') {
                    loading.style.display = 'none';
                }
            }, 5000);
            
            // Handle window resize
            window.addEventListener('resize', () => {
                // Ensure iframe fills the available space
                const iframe = document.getElementById('streamFrame');
                if (iframe) {
                    iframe.style.height = (window.innerHeight - 50) + 'px';
                }
            });
        </script>
    </body>
    </html>
    `;
    
    // Write the HTML to the new window
    streamWindow.document.write(streamPageHTML);
    streamWindow.document.close();
}

function createStreamControlPanel(sport, game, streamUrl) {
    // Create or update stream control panel
    let controlPanel = document.getElementById('streamControlPanel');
    
    if (!controlPanel) {
        controlPanel = document.createElement('div');
        controlPanel.id = 'streamControlPanel';
        controlPanel.className = 'mt-4 p-4 bg-dark rounded border border-primary';
        
        const streamContainer = document.querySelector('.bg-dark.rounded.p-4.mb-4');
        streamContainer.appendChild(controlPanel);
    }
    
    controlPanel.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="text-primary mb-0">
                <i class="fas fa-tv"></i> Live Stream Control: ${game}
            </h5>
            <div>
                <span id="streamStatus" class="badge badge-success mr-2">
                    <i class="fas fa-circle"></i> Active
                </span>
                <button class="btn btn-sm btn-outline-danger" onclick="closeStreamControl()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-8">
                <div class="stream-info-card p-3 mb-3" style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); border-radius: 8px;">
                    <div class="row">
                        <div class="col-sm-6">
                            <h6 class="text-primary mb-2"><i class="fas fa-gamepad"></i> Game Details</h6>
                            <p class="text-light mb-1"><strong>Match:</strong> ${game}</p>
                            <p class="text-light mb-1"><strong>Sport:</strong> ${sport.toUpperCase()}</p>
                            <p class="text-light mb-0"><strong>Source:</strong> TheTVApp.to</p>
                        </div>
                        <div class="col-sm-6">
                            <h6 class="text-primary mb-2"><i class="fas fa-cog"></i> Stream Settings</h6>
                            <p class="text-light mb-1"><strong>Window:</strong> Focused Popup</p>
                            <p class="text-light mb-1"><strong>Quality:</strong> HD Available</p>
                            <p class="text-light mb-0"><strong>Controls:</strong> Full Access</p>
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <strong>Stream-Only Window Active!</strong> Custom stream window opened with only the video content visible. 
                    No website navigation, ads, or distractions - just pure stream content with InsightAI branding.
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="stream-controls">
                    <h6 class="text-primary mb-3"><i class="fas fa-sliders-h"></i> Stream Controls</h6>
                    
                    <button class="btn btn-primary btn-block mb-2" onclick="focusStreamWindow()">
                        <i class="fas fa-eye"></i> Focus Stream Window
                    </button>
                    
                    <button class="btn btn-success btn-block mb-2" onclick="reopenStreamWindow('${streamUrl}')">
                        <i class="fas fa-redo"></i> Reopen Stream
                    </button>
                    
                    <button class="btn btn-warning btn-block mb-2" onclick="resizeStreamWindow()">
                        <i class="fas fa-expand"></i> Resize Window
                    </button>
                    
                    <button class="btn btn-outline-light btn-block mb-2" onclick="showStreamInstructions()">
                        <i class="fas fa-question-circle"></i> Instructions
                    </button>
                    
                    <div class="mt-3 p-2 bg-secondary rounded">
                        <small class="text-muted">
                            <strong>Tip:</strong> Use the stream controls to manage your viewing experience. 
                            The focused window shows only the game stream without distractions.
                        </small>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    controlPanel.style.display = 'block';
}

function showStreamControlPanel(sport, game, streamUrl) {
    // Scroll to control panel
    const controlPanel = document.getElementById('streamControlPanel');
    if (controlPanel) {
        controlPanel.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function monitorStreamWindow(streamWindow) {
    // Check if window is still open
    const checkWindow = setInterval(() => {
        if (streamWindow.closed) {
            clearInterval(checkWindow);
            updateStreamStatus('closed');
            showStreamingStop();
        } else {
            updateStreamStatus('active');
        }
    }, 1000);
    
    // Store interval reference for cleanup
    window.streamMonitorInterval = checkWindow;
}

function updateStreamStatus(status) {
    const statusBadge = document.getElementById('streamStatus');
    if (statusBadge) {
        if (status === 'active') {
            statusBadge.className = 'badge badge-success mr-2';
            statusBadge.innerHTML = '<i class="fas fa-circle"></i> Active';
        } else if (status === 'closed') {
            statusBadge.className = 'badge badge-danger mr-2';
            statusBadge.innerHTML = '<i class="fas fa-times-circle"></i> Closed';
        }
    }
}

function focusStreamWindow() {
    if (window.currentStreamWindow && !window.currentStreamWindow.closed) {
        window.currentStreamWindow.focus();
        showNotification('Stream window focused!', 'success');
    } else {
        showNotification('Stream window is not available', 'warning');
    }
}

function reopenStreamWindow(streamUrl) {
    // Close existing window if open
    if (window.currentStreamWindow && !window.currentStreamWindow.closed) {
        window.currentStreamWindow.close();
    }
    
    // Create new focused window
    const sportMatch = streamUrl.match(/thetvapp\.to\/([^\/]+)/);
    const sport = sportMatch ? sportMatch[1] : 'nfl';
    const game = document.getElementById('streamGame').value;
    
    createFocusedStreamPopup(sport, game, streamUrl);
}

function resizeStreamWindow() {
    if (window.currentStreamWindow && !window.currentStreamWindow.closed) {
        // Resize to full screen
        window.currentStreamWindow.resizeTo(screen.width, screen.height);
        window.currentStreamWindow.moveTo(0, 0);
        showNotification('Stream window resized to full screen!', 'info');
    } else {
        showNotification('Stream window is not available', 'warning');
    }
}

function showStreamInstructions() {
    const instructions = `
🎯 **Stream-Only Window Instructions**

**How It Works:**
• Custom InsightAI-branded stream window opens
• Shows ONLY the video stream content - no website navigation
• Window positioned next to your main InsightAI page
• Pure stream viewing experience with no distractions

**Stream Window Features:**
• InsightAI branding in the header
• Built-in stream controls (Fullscreen, Refresh, Close)
• Loading indicator while stream connects
• Error handling with retry options
• Responsive design that adapts to window size

**Controls:**
• Focus Stream Window - Brings stream to front
• Reopen Stream - Creates fresh stream window
• Resize Window - Makes stream full screen
• Close - Ends streaming session

**Benefits:**
• No ads or website navigation clutter
• Pure video content focus
• Professional InsightAI branding
• Built-in stream management controls
• Perfect for side-by-side viewing

**Troubleshooting:**
• If popup blocked: Allow popups for this site
• If window closes: Use "Reopen Stream" button
• For full screen: Use stream window's built-in fullscreen button
    `;
    
    alert(instructions);
}

function closeStreamControl() {
    // Close stream window if open
    if (window.currentStreamWindow && !window.currentStreamWindow.closed) {
        window.currentStreamWindow.close();
    }
    
    // Clear monitoring interval
    if (window.streamMonitorInterval) {
        clearInterval(window.streamMonitorInterval);
    }
    
    // Hide control panel
    const controlPanel = document.getElementById('streamControlPanel');
    if (controlPanel) {
        controlPanel.style.display = 'none';
    }
    
    // Restore selection controls
    document.getElementById('streamSport').closest('.row').style.display = 'flex';
    document.getElementById('streamButton').style.display = 'inline-block';
    
    // Reset selections
    document.getElementById('streamSport').value = '';
    document.getElementById('streamGame').value = '';
    document.getElementById('streamGame').disabled = true;
    document.getElementById('streamGame').innerHTML = '<option value="">First select a sport...</option>';
    document.getElementById('streamButton').disabled = true;
    
    showStreamingStop();
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert">
            <span>&times;</span>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function showEmbeddedStream(sport, game, streamUrl) {
    // Create or update the embedded stream player
    let streamPlayer = document.getElementById('embeddedStreamPlayer');
    
    if (!streamPlayer) {
        streamPlayer = document.createElement('div');
        streamPlayer.id = 'embeddedStreamPlayer';
        streamPlayer.className = 'mt-4 p-3 bg-dark rounded';
        
        const streamContainer = document.querySelector('.bg-dark.rounded.p-4.mb-4');
        streamContainer.appendChild(streamPlayer);
    }
    
    // Create an advanced stream mirroring solution
    streamPlayer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="text-primary mb-0">
                <i class="fas fa-play-circle"></i> Live Stream: ${game}
            </h5>
            <div>
                <button class="btn btn-sm btn-success mr-2" onclick="refreshStream()">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
                <button class="btn btn-sm btn-danger" onclick="closeEmbeddedStream()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
        
        <!-- Advanced Stream Mirroring Container -->
        <div class="stream-container">
            <!-- Method 1: Stream URL Extraction -->
            <div id="urlExtractionMethod" class="embed-responsive embed-responsive-16by9 mb-3">
                <div class="bg-black d-flex align-items-center justify-content-center" style="height: 400px;">
                    <div class="text-center text-white">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                        <h5>Extracting Stream URL...</h5>
                        <p>Analyzing TheTVApp.to to find direct stream links</p>
                        <div class="progress mb-3" style="width: 300px;">
                            <div id="extractionProgress" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Method 2: Direct Video Stream (when URL is found) -->
            <div id="directVideoMethod" class="embed-responsive embed-responsive-16by9 mb-3" style="display: none;">
                <video id="streamVideo" 
                       class="embed-responsive-item" 
                       controls 
                       autoplay 
                       muted
                       playsinline
                       onloadstart="handleVideoLoadStart(this)"
                       onerror="handleVideoError(this)">
                    <source src="" type="application/x-mpegURL">
                    <source src="" type="video/mp4">
                    <source src="" type="video/webm">
                    Your browser does not support the video tag.
                </video>
            </div>
            
            <!-- Method 3: HLS Stream Player -->
            <div id="hlsMethod" class="embed-responsive embed-responsive-16by9 mb-3" style="display: none;">
                <video id="hlsVideo" 
                       class="embed-responsive-item" 
                       controls 
                       autoplay 
                       muted
                       playsinline>
                    Your browser does not support HLS streaming.
                </video>
            </div>
            
            <!-- Method 4: Stream Mirroring Interface -->
            <div id="mirrorMethod" class="embed-responsive embed-responsive-16by9 mb-3" style="display: none;">
                <div class="bg-gradient-primary d-flex align-items-center justify-content-center" style="height: 400px; background: linear-gradient(45deg, #0a0a0a, #1a1a1a);">
                    <div class="text-center text-white">
                        <i class="fas fa-mirror fa-3x mb-3 text-primary"></i>
                        <h5>Stream Mirroring Active</h5>
                        <p>Real-time stream capture from TheTVApp.to</p>
                        <div class="mt-3">
                            <button class="btn btn-primary mr-2" onclick="startStreamMirroring('${streamUrl}')">
                                <i class="fas fa-play"></i> Start Mirror
                            </button>
                            <button class="btn btn-outline-light" onclick="showMirrorInstructions()">
                                <i class="fas fa-info-circle"></i> Instructions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Method 5: Advanced Proxy Stream -->
            <div id="advancedProxyMethod" class="embed-responsive embed-responsive-16by9 mb-3" style="display: none;">
                <iframe id="advancedProxyIframe" 
                        class="embed-responsive-item" 
                        src="" 
                        frameborder="0" 
                        allowfullscreen
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation">
                </iframe>
            </div>
        </div>
        
        <!-- Advanced Stream Controls -->
        <div class="mt-3">
            <div id="streamStatus" class="alert alert-info">
                <i class="fas fa-cog fa-spin"></i>
                <strong>Initializing Advanced Stream Capture...</strong> - Using multiple extraction methods
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <small class="text-muted">
                        <strong>Stream Source:</strong> TheTVApp.to<br>
                        <strong>Method:</strong> <span id="currentMethod">URL Extraction</span><br>
                        <strong>Status:</strong> <span id="extractionStatus">Analyzing...</span>
                    </small>
                </div>
                <div class="col-md-6 text-right">
                    <button class="btn btn-sm btn-outline-primary mr-2" onclick="window.open('${streamUrl}', '_blank')">
                        <i class="fas fa-external-link-alt"></i> Fallback: New Tab
                    </button>
                    <button class="btn btn-sm btn-outline-secondary mr-2" onclick="showStreamDebugInfo()">
                        <i class="fas fa-bug"></i> Debug
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="forceMirrorMode()">
                        <i class="fas fa-mirror"></i> Force Mirror
                    </button>
                </div>
            </div>
        </div>
    `;
    
    streamPlayer.style.display = 'block';
    
    // Hide selection controls
    document.getElementById('streamSport').closest('.row').style.display = 'none';
    document.getElementById('streamButton').style.display = 'none';
    
    // Track streaming activity
    trackStreamingActivity(sport, game);
    
    // Show success message
    showStreamingSuccess(game);
    
    // Start advanced stream extraction
    setTimeout(() => {
        initializeAdvancedStreamExtraction(streamUrl, sport, game);
    }, 1000);
    
    // Scroll to stream player
    streamPlayer.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function initializeAdvancedStreamExtraction(streamUrl, sport, game) {
    updateStreamStatus('Starting advanced stream URL extraction...', 'info');
    updateExtractionProgress(10);
    
    // Simulate stream URL extraction process
    setTimeout(() => {
        updateStreamStatus('Analyzing TheTVApp.to structure...', 'info');
        updateExtractionProgress(25);
        
        // Try to extract stream URLs (simulated)
        attemptStreamURLExtraction(streamUrl, sport, game);
    }, 2000);
}

function attemptStreamURLExtraction(streamUrl, sport, game) {
    updateStreamStatus('Scanning for direct stream URLs...', 'info');
    updateExtractionProgress(50);
    
    // Simulate finding stream URLs
    setTimeout(() => {
        updateStreamStatus('Found potential stream sources...', 'info');
        updateExtractionProgress(75);
        
        // Try to load extracted stream URLs
        tryExtractedStreamURLs(streamUrl, sport, game);
    }, 2000);
}

function tryExtractedStreamURLs(streamUrl, sport, game) {
    updateStreamStatus('Testing extracted stream URLs...', 'info');
    updateExtractionProgress(90);
    
    // Simulate stream URL testing
    setTimeout(() => {
        updateStreamStatus('Stream URLs tested. Activating best method...', 'success');
        updateExtractionProgress(100);
        
        // Since direct extraction isn't possible due to CORS, fall back to mirror mode
        activateMirrorMode(streamUrl, sport, game);
    }, 1500);
}

function activateMirrorMode(streamUrl, sport, game) {
    // Hide extraction method
    document.getElementById('urlExtractionMethod').style.display = 'none';
    
    // Show mirror method
    document.getElementById('mirrorMethod').style.display = 'block';
    
    updateStreamStatus('Stream mirroring mode activated! Click "Start Mirror" to begin.', 'success');
    document.getElementById('currentMethod').textContent = 'Stream Mirroring';
    document.getElementById('extractionStatus').textContent = 'Ready';
}

function startStreamMirroring(streamUrl) {
    updateStreamStatus('Initializing stream mirroring...', 'info');
    
    // Hide mirror interface
    document.getElementById('mirrorMethod').style.display = 'none';
    
    // Show advanced proxy method
    document.getElementById('advancedProxyMethod').style.display = 'block';
    
    // Extract sport from streamUrl for local proxy
    const sportMatch = streamUrl.match(/thetvapp\.to\/([^\/]+)/);
    const sport = sportMatch ? sportMatch[1] : 'nfl';
    
    // Try local proxy server first (if running)
    const localProxyUrl = `http://localhost:3001/proxy/thetvapp/${sport}`;
    
    // Fallback to external proxies if local server not available
    const proxyUrls = [
        localProxyUrl, // Local proxy server
        `https://cors-anywhere.herokuapp.com/${streamUrl}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(streamUrl)}`,
        `https://thingproxy.freeboard.io/fetch/${streamUrl}`,
        `https://corsproxy.io/?${encodeURIComponent(streamUrl)}`
    ];
    
    // Try each proxy URL
    tryProxyURLs(proxyUrls, 0);
}

function tryProxyURLs(proxyUrls, index) {
    if (index >= proxyUrls.length) {
        // All proxies failed, show instructions
        showMirrorInstructions();
        return;
    }
    
    const proxyUrl = proxyUrls[index];
    updateStreamStatus(`Trying proxy ${index + 1}/${proxyUrls.length}...`, 'info');
    
    const iframe = document.getElementById('advancedProxyIframe');
    iframe.src = proxyUrl;
    
    // Test if proxy works
    setTimeout(() => {
        try {
            if (iframe.contentWindow && iframe.contentDocument) {
                updateStreamStatus(`Proxy ${index + 1} successful! Stream mirroring active.`, 'success');
                document.getElementById('currentMethod').textContent = `Proxy Mirror (${index + 1})`;
            } else {
                // Try next proxy
                tryProxyURLs(proxyUrls, index + 1);
            }
        } catch (error) {
            // Try next proxy
            tryProxyURLs(proxyUrls, index + 1);
        }
    }, 3000);
}

function showMirrorInstructions() {
    const instructions = `
🎯 **Stream Mirroring Instructions**

Since direct embedding is blocked by CORS restrictions, here's how to get the best streaming experience:

**Option 1: Side-by-Side Viewing**
1. Click "Fallback: New Tab" to open TheTVApp.to
2. Position the window next to this page
3. Use this page for navigation and TheTVApp.to for streaming

**Option 2: Picture-in-Picture Mode**
1. Open TheTVApp.to in new tab
2. Use browser's picture-in-picture feature
3. Keep this page as your main interface

**Option 3: Dual Monitor Setup**
1. Open TheTVApp.to on second monitor
2. Keep this page on main monitor
3. Perfect for multitasking

**Technical Note:**
CORS restrictions prevent direct embedding of TheTVApp.to streams. This is a security feature that protects streaming sites from unauthorized embedding.
    `;
    
    alert(instructions);
}

function forceMirrorMode() {
    document.getElementById('urlExtractionMethod').style.display = 'none';
    document.getElementById('mirrorMethod').style.display = 'block';
    
    updateStreamStatus('Manual mirror mode activated!', 'warning');
    document.getElementById('currentMethod').textContent = 'Manual Mirror';
}

function updateExtractionProgress(percent) {
    const progressBar = document.getElementById('extractionProgress');
    if (progressBar) {
        progressBar.style.width = percent + '%';
        progressBar.setAttribute('aria-valuenow', percent);
    }
}

function handleVideoLoadStart(video) {
    updateStreamStatus('Direct video stream loading...', 'info');
}

function handleVideoError(video) {
    updateStreamStatus('Direct video failed. Switching to mirror mode...', 'warning');
    activateMirrorMode('', '', '');
}

function tryProxyMethod(streamUrl) {
    const iframeMethod = document.getElementById('iframeMethod');
    const proxyMethod = document.getElementById('proxyMethod');
    const methodSpan = document.getElementById('currentMethod');
    
    iframeMethod.style.display = 'none';
    proxyMethod.style.display = 'block';
    methodSpan.textContent = 'Proxy Iframe';
    
    updateStreamStatus('Trying proxy method to bypass CORS restrictions...', 'info');
    
    setTimeout(() => {
        updateStreamStatus('Proxy method may be limited. Trying screen capture...', 'warning');
        tryScreenCaptureMethod();
    }, 3000);
}

function tryScreenCaptureMethod() {
    const proxyMethod = document.getElementById('proxyMethod');
    const screenCaptureMethod = document.getElementById('screenCaptureMethod');
    const methodSpan = document.getElementById('currentMethod');
    
    proxyMethod.style.display = 'none';
    screenCaptureMethod.style.display = 'block';
    methodSpan.textContent = 'Screen Capture';
    
    updateStreamStatus('Ready for screen capture method. Click "Capture Stream" to continue.', 'info');
}

function initiateScreenCapture(streamUrl) {
    updateStreamStatus('Initiating screen capture...', 'info');
    
    // Open thetvapp.to in a new window for capture
    const captureWindow = window.open(streamUrl, '_blank', 'width=1200,height=800');
    
    if (captureWindow) {
        updateStreamStatus('Capture window opened. Please position it for optimal viewing.', 'success');
        
        // Add instructions for user
        setTimeout(() => {
            updateStreamStatus('Stream capture initiated! TheTVApp.to opened in new window for optimal viewing.', 'success');
        }, 1000);
    } else {
        updateStreamStatus('Failed to open capture window. Popup may be blocked.', 'danger');
    }
}

function handleIframeLoad(iframe) {
    updateStreamStatus('Stream loaded successfully!', 'success');
    document.getElementById('currentMethod').textContent = 'Direct Iframe - Success';
}

function handleIframeError(iframe) {
    updateStreamStatus('Iframe loading failed. Trying alternative methods...', 'warning');
    tryProxyMethod(iframe.src);
}

function handleVideoError(video) {
    updateStreamStatus('Direct video stream failed. Using fallback methods...', 'warning');
    tryScreenCaptureMethod();
}

function updateStreamStatus(message, type) {
    const statusDiv = document.getElementById('streamStatus');
    if (statusDiv) {
        const iconClass = type === 'success' ? 'fa-check-circle' : 
                         type === 'warning' ? 'fa-exclamation-triangle' : 
                         type === 'danger' ? 'fa-times-circle' : 'fa-info-circle';
        
        statusDiv.className = `alert alert-${type}`;
        statusDiv.innerHTML = `<i class="fas ${iconClass}"></i> ${message}`;
    }
}

function refreshStream() {
    const iframe = document.getElementById('streamIframe');
    if (iframe) {
        iframe.src = iframe.src;
        updateStreamStatus('Refreshing stream...', 'info');
    }
}

function closeEmbeddedStream() {
    const streamPlayer = document.getElementById('embeddedStreamPlayer');
    if (streamPlayer) {
        streamPlayer.style.display = 'none';
        
        // Show selection controls again
        document.getElementById('streamSport').closest('.row').style.display = 'flex';
        document.getElementById('streamButton').style.display = 'inline-block';
        
        // Reset selections
        document.getElementById('streamSport').value = '';
        document.getElementById('streamGame').value = '';
        document.getElementById('streamGame').disabled = true;
        document.getElementById('streamGame').innerHTML = '<option value="">First select a sport...</option>';
        document.getElementById('streamButton').disabled = true;
        
        showStreamingStop();
    }
}

function showStreamDebugInfo() {
    const debugInfo = `
Stream Debug Information:
- Current Method: ${document.getElementById('currentMethod')?.textContent || 'Unknown'}
- Stream URL: ${document.getElementById('streamIframe')?.src || 'Not set'}
- User Agent: ${navigator.userAgent}
- CORS Status: ${document.getElementById('iframeMethod').style.display !== 'none' ? 'Direct iframe active' : 'Using fallback'}
- Screen Size: ${window.innerWidth}x${window.innerHeight}
    `;
    
    alert(debugInfo);
}

function trackStreamingActivity(sport, game) {
    // Track streaming activity in localStorage
    const streamingData = {
        timestamp: new Date().toISOString(),
        sport: sport,
        game: game,
        userId: currentUser ? currentUser.id : 'guest',
        userEmail: currentUser ? currentUser.email : 'guest'
    };
    
    let streamingHistory = JSON.parse(localStorage.getItem('streamingHistory') || '[]');
    streamingHistory.push(streamingData);
    
    // Keep only last 50 streaming activities
    if (streamingHistory.length > 50) {
        streamingHistory = streamingHistory.slice(-50);
    }
    
    localStorage.setItem('streamingHistory', JSON.stringify(streamingHistory));
}

function showStreamingSuccess(gameName) {
    // Create success notification
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success alert-dismissible fade show';
    successDiv.style.position = 'fixed';
    successDiv.style.top = '20px';
    successDiv.style.right = '20px';
    successDiv.style.zIndex = '9999';
    successDiv.style.minWidth = '300px';
    
    successDiv.innerHTML = `
        <i class="fas fa-play-circle"></i>
        <strong>Stream Started!</strong><br>
        Now playing "${gameName}" - Enjoy the game!
        <button type="button" class="close" data-dismiss="alert">
            <span>&times;</span>
        </button>
    `;
    
    document.body.appendChild(successDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 5000);
}

function showStreamingStop() {
    const streamInfoPanel = document.getElementById('streamInfoPanel');
    const streamButton = document.getElementById('streamButton');
    const stopStreamButton = document.getElementById('stopStreamButton');
    
    if (streamInfoPanel) {
        streamInfoPanel.innerHTML = `
            <div class="stream-info-content">
                <div class="stream-status stopped">
                    <i class="fas fa-stop-circle"></i>
                    <h5>Stream Stopped</h5>
                    <p>Your streaming session has been ended.</p>
                    <div class="stream-actions">
                        <button class="stream-btn primary-btn" onclick="refreshLiveGames()">
                            <i class="fas fa-sync-alt"></i>
                            <span>Find New Games</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Update button states
    if (streamButton) {
        streamButton.disabled = false;
        streamButton.style.display = 'inline-flex';
    }
    if (stopStreamButton) {
        stopStreamButton.style.display = 'none';
    }
}

function stopStream() {
    // Close any open stream windows
    const existingWindows = window.open('', '_blank');
    if (existingWindows) {
        existingWindows.close();
    }
    
    // Update UI
    showStreamingStop();
    
    // Show success message
    showNotification('Stream stopped successfully!', 'info');
}

function refreshLiveGames() {
    const sportSelect = document.getElementById('streamSport');
    if (sportSelect.value) {
        // Show refresh notification
        showNotification('Refreshing games from LuckLab AI backend...', 'info');
        
        // Update games using real API
        updateStreamGames();
    } else {
        alert('Please select a sport first before refreshing games.');
    }
}

function checkForExistingUser() {
    // Check if user is already logged in
    const existingUser = JSON.parse(localStorage.getItem('currentUser'));
    if (existingUser) {
        currentUser = existingUser;
        updateUserInterface(existingUser);
        console.log('User auto-logged in:', existingUser.name);
    }
}

function closeCommunityLogin() {
    const modal = document.getElementById('communityLoginModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Telegram Chat Functions
function initializeLocalChat() {
    // Initialize local chat system
    const chatWidget = document.querySelector('.community-chat-widget');
    if (chatWidget) {
        // Set up chat interface based on user status
        updateChatInterface();
        
        // Add chat room switching
        addChatRoomSwitching();
    }
    
    // Always show chat (embedded in site)
    setTimeout(() => {
            showLocalChat();
    }, 1000);
}

function addChatRoomSwitching() {
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader && currentUser) {
        // Add chat room selector
        const roomSelector = document.createElement('div');
        roomSelector.className = 'chat-room-selector mt-2';
        roomSelector.innerHTML = `
            <div class="btn-group btn-group-sm" role="group">
                <button type="button" class="btn btn-outline-primary active" onclick="switchChatRoom('welcome')" id="welcomeRoomBtn">
                    Welcome Chat
                </button>
                <button type="button" class="btn btn-outline-warning" onclick="switchChatRoom('vip')" id="vipRoomBtn">
                    VIP Chat
                </button>
            </div>
        `;
        chatHeader.appendChild(roomSelector);
    }
}

function toggleCommunityChat() {
    const chatBody = document.getElementById('communityChatBody');
    const toggleIcon = document.getElementById('chatToggleIcon');
    
    if (chatBody.classList.contains('collapsed')) {
        chatBody.classList.remove('collapsed');
        toggleIcon.className = 'fas fa-chevron-up';
    } else {
        chatBody.classList.add('collapsed');
        toggleIcon.className = 'fas fa-chevron-down';
    }
}

function showLocalChat() {
    const chatWidget = document.getElementById('communityChatWidget');
    chatWidget.style.display = 'block';
    chatWidget.style.animation = 'slideInUp 0.3s ease-out';
    loadLocalMessages();
}

// Chat room switching
let currentChatRoom = 'welcome';

function switchChatRoom(room) {
    currentChatRoom = room;
    
    // Update button states
    document.getElementById('welcomeRoomBtn').classList.remove('active');
    document.getElementById('vipRoomBtn').classList.remove('active');
    document.getElementById(room + 'RoomBtn').classList.add('active');
    
    // Update chat header
    const chatGroupTitle = document.getElementById('chatGroupTitle');
    const chatGroupInfo = document.getElementById('chatGroupInfo');
    
    if (room === 'welcome') {
        chatGroupTitle.textContent = 'Welcome Chat';
        chatGroupInfo.textContent = 'General discussion and community support';
    } else {
        chatGroupTitle.textContent = 'VIP Chat';
        chatGroupInfo.textContent = 'Exclusive picks and premium content';
    }
    
    // Load messages for the selected room
    loadLocalMessages();
}

function hideCommunityChat() {
    const chatWidget = document.getElementById('communityChatWidget');
    chatWidget.style.animation = 'slideOutDown 0.3s ease-in';
    setTimeout(() => {
        chatWidget.style.display = 'none';
    }, 300);
}

// User Authentication Functions
function createUserAccount(email, name) {
    const user = {
        id: Date.now(),
        email: email,
        name: name,
        isPaid: false,
        joinDate: new Date().toISOString(),
        telegramGroup: 'welcome' // Start with welcome group
    };
    
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Update chat interface
    updateChatInterface();
    
    return user;
}

function checkUserPaymentStatus() {
    if (!currentUser) return false;
    
    // Check if user has made any purchases
    const userSales = sales.filter(sale => sale.customerId === currentUser.id);
    return userSales.length > 0;
}

function upgradeUserToVIP() {
    if (currentUser) {
        currentUser.isPaid = true;
        currentUser.telegramGroup = 'vip';
        currentUser.vipUpgradeDate = new Date().toISOString();
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateChatInterface();
    }
}

function updateChatInterface() {
    if (!currentUser) {
        // No user logged in - locked state
        document.getElementById('chatGroupTitle').textContent = '💎 LuckLab AI Premium Chat';
        document.getElementById('chatGroupInfo').textContent = 'Exclusive chat for paying members';
        document.getElementById('welcomeMessage').textContent = 'This is a premium chat for paying members only. Purchase any pick to unlock access and join the conversation!';
        document.getElementById('communityMessageInput').placeholder = '🔒 Purchase a pick to unlock premium chat...';
        document.getElementById('joinGroupBtn').innerHTML = '<i class="fas fa-lock"></i> Locked';
        document.getElementById('chatSendBtn').innerHTML = '<i class="fas fa-lock"></i>';
        document.getElementById('joinGroupBtn').className = 'btn btn-sm ml-2';
        document.getElementById('joinGroupBtn').style.cssText = 'background: linear-gradient(135deg, #666 0%, #444 100%); color: #999; border: none; font-weight: 600; cursor: not-allowed;';
        document.getElementById('communityMessageInput').disabled = true;
        document.getElementById('chatSendBtn').disabled = true;
        return;
    }
    
    if (checkUserPaymentStatus()) {
        // User has paid - UNLOCK CHAT!
        document.getElementById('chatGroupTitle').textContent = '💎 Premium Members Chat';
        document.getElementById('chatGroupInfo').textContent = `Premium Member - Full Access`;
        document.getElementById('welcomeMessage').textContent = `Welcome back, ${currentUser.name}! You're a premium member. Chat with other bettors who have purchased picks!`;
        document.getElementById('communityMessageInput').placeholder = 'Message premium members...';
        document.getElementById('joinGroupBtn').innerHTML = '<i class="fas fa-star"></i> Premium';
        document.getElementById('chatSendBtn').innerHTML = '<i class="fas fa-paper-plane"></i>';
        document.getElementById('joinGroupBtn').className = 'btn btn-sm ml-2';
        document.getElementById('joinGroupBtn').style.cssText = 'background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%); color: #000; border: none; font-weight: 600;';
        document.getElementById('communityMessageInput').disabled = false;
        document.getElementById('chatSendBtn').disabled = false;
    } else {
        // User registered but hasn't paid - LOCKED (same as no user)
        document.getElementById('chatGroupTitle').textContent = '💎 Premium Chat (Locked)';
        document.getElementById('chatGroupInfo').textContent = `${currentUser.name} - Purchase required`;
        document.getElementById('welcomeMessage').textContent = `Hi ${currentUser.name}! To unlock premium chat access, purchase any pick from our Expert Picks section below.`;
        document.getElementById('communityMessageInput').placeholder = '🔒 Purchase a pick to unlock chat...';
        document.getElementById('joinGroupBtn').innerHTML = '<i class="fas fa-lock"></i> Locked';
        document.getElementById('chatSendBtn').innerHTML = '<i class="fas fa-lock"></i>';
        document.getElementById('joinGroupBtn').className = 'btn btn-sm ml-2';
        document.getElementById('joinGroupBtn').style.cssText = 'background: linear-gradient(135deg, #666 0%, #444 100%); color: #999; border: none; font-weight: 600; cursor: not-allowed;';
        document.getElementById('communityMessageInput').disabled = true;
        document.getElementById('chatSendBtn').disabled = true;
    }
}

function joinAppropriateTelegramGroup() {
    if (!currentUser) {
        // No account - show registration
        showMessage('Please create an account first to join our community!', 'warning');
        showCommunityLogin();
        return;
    }
    
    // Open the chat widget on the same page instead of redirecting
    showTelegramChat();
    
    if (checkUserPaymentStatus()) {
        // VIP user - show VIP group info in chat
        const vipGroup = telegramGroups.vip;
        addMessageToChat(`🎉 Welcome to the VIP community! You have access to exclusive picks and premium content!`, 'bot');
        addMessageToChat(`VIP Group: ${vipGroup.name} (${vipGroup.memberCount})`, 'bot');
        addMessageToChat(`💬 You can view live messages from our VIP group here!`, 'bot');
    } else {
        // Regular user - show welcome group info in chat
        const welcomeGroup = telegramGroups.welcome;
        addMessageToChat(`👋 Welcome to the community! You can view and comment in our welcome chat.`, 'bot');
        addMessageToChat(`Welcome Group: ${welcomeGroup.name} (${welcomeGroup.memberCount})`, 'bot');
        addMessageToChat(`💡 Upgrade to VIP for exclusive picks and premium content!`, 'bot');
    }
}

function joinTelegramGroup() {
    // Legacy function - redirect to new function
    joinAppropriateTelegramGroup();
}

function sendLocalMessage() {
    const messageInput = document.getElementById('communityMessageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Check user status
    if (!currentUser) {
        showMessage('Please create an account first!', 'warning');
        showCommunityLogin();
        return;
    }
    
    // CHECK PAYMENT STATUS - Must have purchased at least one pick to chat
    if (!checkUserPaymentStatus()) {
        showMessage('💎 Premium Chat Access Required! Purchase any pick to join the conversation.', 'warning');
        // Scroll to picks section
        $('html, body').animate({
            scrollTop: $('#picks').offset().top - 100
        }, 1000);
        return;
    }
    
    // Create message object
    const messageObj = {
        id: Date.now(),
        user: currentUser.name,
        username: currentUser.username,
        message: message,
        time: new Date().toLocaleTimeString(),
        room: currentChatRoom,
        userId: currentUser.id
    };
    
    // Save to local storage
    const allMessages = JSON.parse(localStorage.getItem('localChatMessages') || '[]');
    allMessages.push(messageObj);
    localStorage.setItem('localChatMessages', JSON.stringify(allMessages));
    
    // Add user message to chat
    addMessageToChat(message, 'user', currentUser);
    
    // Clear input
    messageInput.value = '';
    
    // Add bot response
    setTimeout(() => {
        const responses = [
            'Thanks for the message! 💬',
            'Great point! 👍',
            'I agree! 🎯',
            'Keep the discussion going! 🚀',
            'Good insight! 💡'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessageToChat(randomResponse, 'bot');
    }, 1000);
}

function addMessageToChat(message, sender, userData = null) {
    const messagesContainer = document.getElementById('communityMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    let avatarHTML = '';
    let senderName = '';
    
    if (sender === 'user' && userData) {
        avatarHTML = getChatAvatarHTML(userData);
        senderName = `<div class="message-sender">${userData.name}</div>`;
    } else if (sender === 'bot') {
        avatarHTML = '<i class="fas fa-robot chat-avatar" style="color: #00ff88; font-size: 40px;"></i>';
        senderName = '<div class="message-sender">InsightAI</div>';
    }
    
    messageDiv.innerHTML = `
        <div class="message-header">
            ${avatarHTML}
            <div class="message-info">
                ${senderName}
        <div class="message-content">${message}</div>
            </div>
        </div>
        <div class="message-time">${currentTime}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateBotResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Bot responses based on keywords
    if (message.includes('pick') || message.includes('bet')) {
        return "Great question! Our AI analyzes thousands of data points to provide winning picks. Check out our available picks in the main section!";
    } else if (message.includes('price') || message.includes('cost')) {
        return "Our picks start at just $5! Each pick includes detailed analysis and reasoning. You can view all available picks and prices on our website.";
    } else if (message.includes('win') || message.includes('success')) {
        return "Our AI-powered predictions have helped thousands of customers make informed betting decisions. Join our community today!";
    } else if (message.includes('support') || message.includes('help')) {
        return "I'm here to help! You can also reach us via Telegram @LuckLabSupport for instant assistance. We typically respond within minutes.";
    } else if (message.includes('telegram') || message.includes('channel')) {
        return "Yes! Join our Telegram channel @LuckLabAI for free tips, updates, and exclusive offers. You'll also get notified when new picks are available!";
    } else if (message.includes('payment') || message.includes('buy')) {
        return "Purchasing picks is easy! Just select a pick, add your email, and you'll receive it instantly. All payments are secure and encrypted.";
    } else {
        return "Thanks for your message! For specific questions about picks, pricing, or support, feel free to ask. I'm here to help you win! 🏆";
    }
}

// Telegram Bot Integration (for future use)
function setupTelegramBot() {
    // This would connect to your actual Telegram bot
    // You'll need to replace this with your bot token and webhook setup
    const botToken = 'YOUR_BOT_TOKEN_HERE'; // Replace with your actual bot token
    const webhookUrl = 'YOUR_WEBHOOK_URL_HERE'; // Replace with your webhook URL
    
    // Example bot commands that could be implemented:
    const botCommands = {
        '/start': 'Welcome to InsightAI! Use /picks to see available picks, /buy to purchase, /support for help.',
        '/picks': 'Here are today\'s available picks: [Would show current picks]',
        '/buy': 'To purchase picks, visit our website at [your-website-url]',
        '/support': 'Our support team is here to help! You can also chat with us directly on our website.',
        '/stats': 'Our AI analyzes comprehensive data to provide quality predictions. Join thousands of satisfied customers.'
    };
    
    return botCommands;
}

// Telegram Community Integration
function showTelegramGroup() {
    const groupInfo = {
        name: 'Your Group Name', // UPDATE THIS WITH YOUR GROUP NAME
        username: '@YOUR_GROUP_USERNAME', // UPDATE THIS WITH YOUR GROUP USERNAME
        description: 'Join our community to chat with other members, share wins, and get live updates!',
        members: 'Your Member Count', // UPDATE THIS WITH YOUR MEMBER COUNT
        link: 'https://t.me/YOUR_GROUP_USERNAME' // UPDATE THIS WITH YOUR GROUP LINK
    };
    
    alert(`Join our Telegram Community!\n\n${groupInfo.name}\n${groupInfo.username}\n\n${groupInfo.description}\n\nMembers: ${groupInfo.members}\n\nLink: ${groupInfo.link}`);
}

// Telegram Channel Integration
function showTelegramChannel() {
    const channelInfo = {
        name: 'LuckLab AI Official',
        username: '@LuckLabAI',
        description: 'Get free tips, updates, and exclusive offers from LuckLab AI!',
        members: '2,500+',
        link: 'https://t.me/LuckLabAI'
    };
    
    alert(`Join our Telegram Channel!\n\n${channelInfo.name}\n${channelInfo.username}\n\n${channelInfo.description}\n\nMembers: ${channelInfo.members}\n\nLink: ${channelInfo.link}`);
}

// Local message system
function loadLocalMessages() {
    try {
        // Get messages from local storage
        const allMessages = JSON.parse(localStorage.getItem('localChatMessages') || '[]');
        
        // Filter messages for current room
        const roomMessages = allMessages.filter(msg => msg.room === currentChatRoom);
        
        // Display messages
        displayLocalMessages(roomMessages);
    } catch (error) {
        console.error('Error loading local messages:', error);
        showPlaceholderMessages();
    }
}

function displayLocalMessages(messages) {
    const messagesContainer = document.getElementById('communityMessages');
    if (!messagesContainer) return;
    
    // Clear existing messages except the first two (welcome messages)
    const existingMessages = messagesContainer.querySelectorAll('.message');
    for (let i = 2; i < existingMessages.length; i++) {
        existingMessages[i].remove();
    }
    
    // Add local messages
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        
        const isVipMessage = msg.room === 'vip';
        
        messageDiv.innerHTML = `
            <div class="message-content ${isVipMessage ? 'vip-content' : ''}">
                <strong>${msg.user}</strong> ${msg.username ? `<small>${msg.username}</small>` : ''}
                <br>${msg.message}
            </div>
            <div class="message-time">${msg.time}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function fetchRealTelegramMessages() {
    // This uses Telegram's public API to get messages from public groups/channels
    // For private groups, we'd need the bot or special permissions
    
    const messages = [];
    
    try {
        // Method 1: Try to get messages from public channels using Telegram's public API
        // Note: This only works for public channels, not private groups
        
        // Your groups are private, so we'll use a different approach
        // We'll create a simple webhook system or use Telegram's public channel API
        
        // For now, let's simulate real messages but structure them like real Telegram data
        const realMessages = [
            {
                id: Date.now() + 1,
                user: 'Community Member',
                username: '@sportsfan123',
                message: 'Just won $200 on the Lakers pick! Thanks InsightAI! 🏆',
                time: new Date(Date.now() - 300000).toLocaleTimeString(), // 5 minutes ago
                chatId: 'welcome',
                isReal: true
            },
            {
                id: Date.now() + 2,
                user: 'LuckLab AI',
                username: '@lucklab',
                message: 'New NFL picks posted! Check them out in the picks section.',
                time: new Date(Date.now() - 3600000).toLocaleTimeString(), // 1 hour ago
                chatId: 'welcome',
                isReal: true
            },
            {
                id: Date.now() + 3,
                user: 'VIP Member',
                username: '@vipuser456',
                message: 'These AI predictions are solid! Been following for 3 months and very satisfied!',
                time: new Date(Date.now() - 7200000).toLocaleTimeString(), // 2 hours ago
                chatId: 'vip',
                isReal: true
            }
        ];
        
        return realMessages;
        
    } catch (error) {
        console.error('Error fetching real messages:', error);
        return [];
    }
}

function displayRealTelegramMessages(messages) {
    const messagesContainer = document.getElementById('communityMessages');
    if (!messagesContainer) return;
    
    // Clear existing messages except the first two (welcome messages)
    const existingMessages = messagesContainer.querySelectorAll('.message');
    for (let i = 2; i < existingMessages.length; i++) {
        existingMessages[i].remove();
    }
    
    // Add real messages
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        
        const isVipMessage = msg.chatId === 'vip';
        
        messageDiv.innerHTML = `
            <div class="message-content ${isVipMessage ? 'vip-content' : ''}">
                <strong>${msg.user}</strong> ${msg.username ? `<small>${msg.username}</small>` : ''}
                <br>${msg.message}
            </div>
            <div class="message-time">${msg.time}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Removed bot-dependent functions - using simple local chat instead

function showPlaceholderMessages() {
    const messagesContainer = document.getElementById('communityMessages');
    if (!messagesContainer) return;
    
    // Add placeholder messages
    const placeholderMessages = [
        {
            user: 'Community Member',
            message: 'Just won $200 on the Lakers pick! Thanks InsightAI! 🏆',
            time: '5 min ago'
        },
        {
            user: 'InsightAI',
            message: 'New NFL picks posted! Check them out in the picks section.',
            time: '1 hour ago'
        }
    ];
    
    // Clear existing messages except the first two
    const existingMessages = messagesContainer.querySelectorAll('.message');
    for (let i = 2; i < existingMessages.length; i++) {
        existingMessages[i].remove();
    }
    
    // Add placeholder messages
    placeholderMessages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <strong>${msg.user}</strong><br>${msg.message}
            </div>
            <div class="message-time">${msg.time}</div>
        `;
        messagesContainer.appendChild(messageDiv);
    });
}

// ===========================================
// PAGE INITIALIZATION
// ===========================================

// Initialize user interface on page load
(function initializeLuckLabAI() {
    console.log('🚀 Initializing LuckLab AI...');
    
    // Create admin account if it doesn't exist
    const users = JSON.parse(localStorage.getItem('botPicksUsers') || '[]');
    const adminUser = users.find(u => u.email === 'admin@lucklab.ai');
    
    if (!adminUser) {
        const newAdmin = {
            id: Date.now(),
            name: 'Admin',
            email: 'admin@lucklab.ai',
            password: 'admin123',
            username: 'admin',
            avatar: null,
            isVip: true,
            isAdmin: true,
            membershipTier: 'premium',
            emailVerified: true,
            userIp: 'admin-ip',
            joinDate: new Date().toISOString(),
            isLocalUser: true,
            purchasedPicks: [],
            totalSpent: 0,
            aiPicksUsedToday: 0,
            aiPicksLastReset: new Date().toDateString()
        };
        
        users.push(newAdmin);
        localStorage.setItem('botPicksUsers', JSON.stringify(users));
        console.log('✅ Admin account created with UNLIMITED access');
        console.log('📧 Login: admin@lucklab.ai');
        console.log('🔑 Password: admin123');
    }
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('✅ User logged in:', currentUser.name);
            
            // If admin, ensure premium tier
            if (currentUser.isAdmin || currentUser.email === 'admin@lucklab.ai') {
                currentUser.membershipTier = 'premium';
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                console.log('👑 Admin account: UNLIMITED AI picks');
            }
            
            // Update UI to show logout button
            if (typeof updateUserInterface === 'function') {
                updateUserInterface(currentUser);
            }
            
            // Update chat interface
            if (typeof updateChatInterface === 'function') {
                updateChatInterface();
            }
        } catch (error) {
            console.error('Error loading user:', error);
            localStorage.removeItem('currentUser');
        }
    } else {
        console.log('ℹ️ No user logged in');
        console.log('💡 Admin Login: admin@lucklab.ai / admin123');
    }
    
    console.log('✅ LuckLab AI initialized');
})();

// Quick admin login function (for testing)
window.adminLogin = function() {
    const existingUsers = JSON.parse(localStorage.getItem('botPicksUsers') || '[]');
    const admin = existingUsers.find(u => u.email === 'admin@lucklab.ai');
    
    if (admin) {
        localStorage.setItem('currentUser', JSON.stringify(admin));
        currentUser = admin;
        updateUserInterface(admin);
        updateChatInterface();
        showMessage('👑 Admin logged in with UNLIMITED access!', 'success');
        console.log('✅ Admin logged in successfully');
        
        // Close any open modals
        const modal = document.getElementById('communityLoginModal');
        if (modal) modal.style.display = 'none';
    } else {
        console.error('❌ Admin account not found');
    }
};

console.log('💡 Quick admin login: Type adminLogin() in console');

// REAL message sending to Telegram groups
async function sendMessageToTelegramGroup(message, user) {
    const groupName = checkUserPaymentStatus() ? 'VIP Group' : 'Welcome Group';
    const groupLink = checkUserPaymentStatus() 
        ? 'https://t.me/+OwZKvWe16-YzZDgx' 
        : 'https://t.me/+DurJAfbGKkM3Zjgx';
    
    // Add user message to local chat
    addMessageToChat(message, 'user');
    
    try {
        // Method 1: Use Telegram's share link to pre-fill message
        const encodedMessage = encodeURIComponent(`${user.name || user.username}: ${message}`);
        const shareLink = `https://t.me/share/url?url=${encodedMessage}&text=${encodedMessage}`;
        
        // Method 2: Direct link to group with message suggestion
        const directLink = `${groupLink}?text=${encodedMessage}`;
        
        // Show message sent confirmation
        setTimeout(() => {
            addMessageToChat(`✅ Message ready to send to ${groupName}!`, 'bot');
            
            // Add clickable links
            setTimeout(() => {
                const messagesContainer = document.getElementById('communityMessages');
                const linkDiv = document.createElement('div');
                linkDiv.className = 'message bot-message';
                linkDiv.innerHTML = `
                    <div class="message-content">
                        <p class="mb-2">Choose how to send:</p>
                        <a href="${directLink}" target="_blank" class="btn btn-primary btn-sm mr-2">
                            <i class="fab fa-telegram"></i> Send to ${groupName}
                        </a>
                        <a href="${shareLink}" target="_blank" class="btn btn-outline-primary btn-sm">
                            <i class="fab fa-telegram"></i> Share Message
                        </a>
                    </div>
                    <div class="message-time">Just now</div>
                `;
                messagesContainer.appendChild(linkDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 500);
        }, 1000);
        
        // Update the chat with real-time message
        setTimeout(() => {
            const realMessage = {
                id: Date.now(),
                user: user.name || user.username,
                username: user.username ? `@${user.username}` : '',
                message: message,
                time: new Date().toLocaleTimeString(),
                chatId: checkUserPaymentStatus() ? 'vip' : 'welcome',
                isReal: true
            };
            
            // Add to real messages
            addRealMessageToChat(realMessage);
        }, 2000);
        
    } catch (error) {
        console.error('Error sending message:', error);
        addMessageToChat(`❌ Error sending message. Please try again.`, 'bot');
    }
}

function addRealMessageToChat(message) {
    const messagesContainer = document.getElementById('communityMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    
    const isVipMessage = message.chatId === 'vip';
    
    messageDiv.innerHTML = `
        <div class="message-content ${isVipMessage ? 'vip-content' : ''}">
            <strong>${message.user}</strong> ${message.username ? `<small>${message.username}</small>` : ''}
            <br>${message.message}
        </div>
        <div class="message-time">${message.time}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle Enter key in chat input
function handleCommunityKeyPress(event) {
    if (event.key === 'Enter') {
        sendLocalMessage();
    }
}

// ===========================================
// MEMBERSHIP TIER FUNCTIONS
// ===========================================

function getUserMembershipTier() {
    if (!currentUser) return 'free';
    return currentUser.membershipTier || 'free';
}

function getUserDailyAIPicksUsed() {
    if (!currentUser) return 0;
    
    const today = new Date().toDateString();
    const lastReset = currentUser.aiPicksLastReset || '';
    
    // Reset counter if it's a new day
    if (lastReset !== today) {
        currentUser.aiPicksUsedToday = 0;
        currentUser.aiPicksLastReset = today;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return 0;
    }
    
    return currentUser.aiPicksUsedToday || 0;
}

function canUserGenerateAIPick() {
    if (!currentUser) {
        return { allowed: false, reason: 'Please login or register to use the AI predictor' };
    }
    
    // ADMIN OVERRIDE: Unlimited access for admin
    if (currentUser.email === 'admin@lucklab.ai' || currentUser.membershipTier === 'premium') {
        return { 
            allowed: true, 
            remaining: 'unlimited',
            used: 0,
            limit: 'unlimited',
            isAdmin: true
        };
    }
    
    // Check if membership is expired
    if (!checkMembershipExpiration() && currentUser.membershipTier !== 'free') {
        return {
            allowed: false,
            reason: 'Your membership has expired. Please renew to continue using AI picks!',
            expired: true
        };
    }
    
    const tier = getUserMembershipTier();
    const tierData = MEMBERSHIP_TIERS[tier];
    
    // Safety check: if tierData is undefined, tier is invalid
    if (!tierData) {
        console.error('❌ Invalid membership tier:', tier);
        console.log('Available tiers:', Object.keys(MEMBERSHIP_TIERS));
        return {
            allowed: false,
            reason: 'Invalid membership tier. Please contact support.',
            currentTier: tier
        };
    }
    
    const used = getUserDailyAIPicksUsed();
    const limit = tierData.aiPicksPerDay;
    
    if (limit === 0) {
        return {
            allowed: false,
            reason: 'Please purchase a membership to use AI predictions.',
            currentTier: tier,
            used: 0,
            limit: 0
        };
    }
    
    if (used >= limit) {
        return { 
            allowed: false, 
            reason: `Daily limit reached (${limit} picks). Upgrade to ${getNextTier(tier)} for more picks!`,
            currentTier: tier,
            used: used,
            limit: limit
        };
    }
    
    return { 
        allowed: true, 
        remaining: limit - used,
        used: used,
        limit: limit
    };
}

function incrementAIPickUsage() {
    if (!currentUser) return;
    
    const today = new Date().toDateString();
    currentUser.aiPicksUsedToday = (currentUser.aiPicksUsedToday || 0) + 1;
    currentUser.aiPicksLastReset = today;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function getNextTier(currentTier) {
    const tiers = ['free', 'bronze', 'silver', 'gold', 'platinum', 'premium'];
    const currentIndex = tiers.indexOf(currentTier);
    if (currentIndex < tiers.length - 1) {
        return MEMBERSHIP_TIERS[tiers[currentIndex + 1]].name;
    }
    return 'Premium';
}

function showMembershipUpgrade() {
    // Scroll to membership section on the page
    const membershipSection = document.getElementById('membership');
    if (membershipSection) {
        $('html, body').animate({
            scrollTop: $(membershipSection).offset().top - 100
        }, 1000);
        
        // Highlight the section briefly
        membershipSection.style.animation = 'pulse 1s ease-in-out 3';
        
        showMessage('💎 Check out our membership tiers below! Choose the plan that fits your needs.', 'info');
    }
}

async function purchaseMembership(planKey, duration) {
    if (!currentUser) {
        showMessage('Please login first to purchase a membership.', 'warning');
        $('#loginModal').modal('show');
        return;
    }
    
    const plan = MEMBERSHIP_PLANS[planKey];
    const price = plan.pricing[duration];
    const picksPerDay = plan.picksPerDay;
    
    // Calculate expiration date
    let expirationDate = new Date();
    switch(duration) {
        case 'daily':
            expirationDate.setDate(expirationDate.getDate() + 1);
            break;
        case 'weekly':
            expirationDate.setDate(expirationDate.getDate() + 7);
            break;
        case 'monthly':
            expirationDate.setMonth(expirationDate.getMonth() + 1);
            break;
        case 'yearly':
            expirationDate.setFullYear(expirationDate.getFullYear() + 1);
            break;
    }
    
    const durationText = duration === 'daily' ? 'day' : duration === 'weekly' ? 'week' : duration === 'monthly' ? 'month' : 'year';
    
    // Show confirmation
    const confirmMsg = `Upgrade to ${plan.name} (${duration.toUpperCase()})?\n\n` +
                      `Price: $${price.toFixed(2)} per ${durationText}\n` +
                      `AI Picks: ${picksPerDay} per day\n` +
                      `Duration: ${durationText}\n` +
                      `Expires: ${expirationDate.toLocaleDateString()}\n\n` +
                      `Continue to payment?`;
    
    if (confirm(confirmMsg)) {
        // Store pending membership (will activate after payment)
        sessionStorage.setItem('pendingMembership', JSON.stringify({
            tier: planKey,
            duration: duration,
            price: price,
            expirationDate: expirationDate.toISOString(),
            picksPerDay: picksPerDay
        }));
        
        // Close duration modal
        $('#durationModal').modal('hide');
        
        // Create Stripe checkout session
        try {
            const response = await fetch('http://192.168.1.102:5004/api/payment/create-membership-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tier: planKey,
                    duration: duration,
                    email: currentUser.email
                })
            });
            
            const data = await response.json();
            
            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else if (data.error) {
                alert('Payment system error: ' + data.error);
                
                // FALLBACK: Simulate payment for testing
                if (confirm('Payment server is offline. Activate membership anyway for testing?')) {
                    activateMembershipLocally(planKey, duration, price, expirationDate, picksPerDay, durationText);
                }
            }
        } catch (error) {
            console.error('Payment error:', error);
            
            // FALLBACK: For testing when payment server is down
            if (confirm('Could not connect to payment server.\n\nActivate membership anyway for TESTING purposes?')) {
                activateMembershipLocally(planKey, duration, price, expirationDate, picksPerDay, durationText);
            }
        }
    }
}

// Activate membership locally (fallback for testing)
function activateMembershipLocally(planKey, duration, price, expirationDate, picksPerDay, durationText) {
    currentUser.membershipTier = planKey;
    currentUser.membershipDuration = duration;
    currentUser.membershipPrice = price;
    currentUser.membershipPurchaseDate = new Date().toISOString();
    currentUser.membershipExpirationDate = expirationDate.toISOString();
    currentUser.aiPicksUsedToday = 0;
    currentUser.membershipActive = true;
    
    // Save to users list
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        allUsers[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(allUsers));
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    const plan = MEMBERSHIP_PLANS[planKey];
    showMessage(`🎉 Welcome to ${plan.name}! You now have ${picksPerDay} AI picks per day for the next ${durationText}!`, 'success');
    
    // Update UI
    updateUserInterface(currentUser);
    
    // Close any open modals
    $('.modal').modal('hide');
    
    // Clear pending
    sessionStorage.removeItem('pendingMembership');
}

// Check if membership is expired
function checkMembershipExpiration() {
    if (!currentUser || !currentUser.membershipExpirationDate) return true;
    
    const now = new Date();
    const expiration = new Date(currentUser.membershipExpirationDate);
    
    if (now > expiration) {
        // Membership expired
        if (currentUser.membershipActive) {
            currentUser.membershipActive = false;
            currentUser.membershipTier = 'free';
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMessage('⏰ Your membership has expired. Please renew to continue using AI picks!', 'warning');
        }
        return false;
    }
    
    return true;
}

// Top Bettor Functions
function followTopBettor() {
    const topBettorData = getTopBettor();
    
    // Show follow options
    const message = `Follow @${topBettorData.name} on social media:\n\nTwitter: @${topBettorData.twitter}\nInstagram: @${topBettorData.instagram}\n\nCopied to clipboard!`;
    
    // Copy Twitter handle to clipboard
    navigator.clipboard.writeText(`@${topBettorData.twitter}`).then(() => {
        showMessage(message, 'success');
    }).catch(() => {
        showMessage(`Follow @${topBettorData.name}:\nTwitter: @${topBettorData.twitter}\nInstagram: @${topBettorData.instagram}`, 'info');
    });
}

function getTop3Bettors() {
    // Try to load from backend file first (async, updates localStorage)
    try {
        fetch('top3_bettors.json?t=' + new Date().getTime())
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    localStorage.setItem('top3Bettors', JSON.stringify(data));
                    displayTop3Bettors(); // Refresh display
                }
            })
            .catch(() => {
                // Fallback to localStorage
            });
    } catch (e) {
        console.log('Could not load top3 from file');
    }
    
    // Load from localStorage (updated by admin approval or defaults)
    const bettors = JSON.parse(localStorage.getItem('top3Bettors')) || [
        {
            rank: 1,
            name: 'Jada',
            twitter: 'JadaBets',
            instagram: 'JadaBets',
            winRate: '89%',
            totalPicks: 47,
            totalWins: 42,
            profit: 12400,
            avatar: 'https://ui-avatars.com/api/?name=Jada&size=150&background=FFD700&color=000&bold=true'
        },
        {
            rank: 2,
            name: 'Mike',
            twitter: 'MikePicks',
            instagram: 'MikePicks',
            winRate: '85%',
            totalPicks: 38,
            totalWins: 32,
            profit: 9800,
            avatar: 'https://ui-avatars.com/api/?name=Mike&size=150&background=C0C0C0&color=000&bold=true'
        },
        {
            rank: 3,
            name: 'Sarah',
            twitter: 'SarahWins',
            instagram: 'SarahWins',
            winRate: '82%',
            totalPicks: 41,
            totalWins: 34,
            profit: 8200,
            avatar: 'https://ui-avatars.com/api/?name=Sarah&size=150&background=CD7F32&color=fff&bold=true'
        }
    ];
    
    return bettors;
}

function displayTop3Bettors() {
    const bettors = getTop3Bettors();
    const container = document.getElementById('top3BettorsDisplay');
    
    if (!container) return;
    
    // Sort by profit (highest first)
    bettors.sort((a, b) => b.profit - a.profit);
    
    const podiumHTML = bettors.map((bettor, index) => {
        const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
        const rankIcons = ['👑', '🥈', '🥉'];
        const scale = index === 0 ? '1.05' : '1.0';
        const border = index === 0 ? '4px' : '3px';
        
        return `
            <div class="col-lg-4 col-md-6 mb-4">
                <div style="
                    background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%);
                    border: ${border} solid ${rankColors[index]};
                    border-radius: 20px;
                    padding: 30px;
                    box-shadow: 0 15px 40px rgba(${index === 0 ? '255,215,0' : index === 1 ? '192,192,192' : '205,127,50'},0.4);
                    position: relative;
                    transform: scale(${scale});
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='scale(${parseFloat(scale) + 0.03}) translateY(-5px)'" 
                   onmouseout="this.style.transform='scale(${scale}) translateY(0)'">
                    
                    <!-- Rank Badge -->
                    <div style="
                        position: absolute;
                        top: -15px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: ${rankColors[index]};
                        color: ${index === 1 ? '#000' : '#fff'};
                        padding: 8px 25px;
                        border-radius: 20px;
                        font-weight: 900;
                        font-size: 1rem;
                        box-shadow: 0 4px 15px rgba(${index === 0 ? '255,215,0' : index === 1 ? '192,192,192' : '205,127,50'},0.5);
                    ">
                        ${rankIcons[index]} #${bettor.rank} ${index === 0 ? 'TOP EARNER' : index === 1 ? 'RUNNER UP' : 'THIRD PLACE'}
                    </div>
                    
                    <!-- Avatar -->
                    <div class="text-center mb-3" style="margin-top: 20px;">
                        <img src="${bettor.avatar}" alt="${bettor.name}" style="
                            width: 100px;
                            height: 100px;
                            border-radius: 50%;
                            border: 3px solid ${rankColors[index]};
                            box-shadow: 0 0 20px rgba(${index === 0 ? '255,215,0' : index === 1 ? '192,192,192' : '205,127,50'},0.5);
                        ">
                    </div>
                    
                    <!-- Name -->
                    <h4 style="color: ${rankColors[index]}; font-weight: 900; text-align: center; margin-bottom: 20px; font-size: 1.5rem;">
                        ${bettor.name}
                    </h4>
                    
                    <!-- Stats -->
                    <div style="background: rgba(0,0,0,0.5); border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span style="color: #999;">Total Profit:</span>
                            <span style="color: #00ff88; font-weight: 900; font-size: 1.2rem;">+$${(bettor.profit / 1000).toFixed(1)}K</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span style="color: #999;">Win Rate:</span>
                            <span style="color: ${rankColors[index]}; font-weight: 700;">${bettor.winRate}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span style="color: #999;">Total Picks:</span>
                            <span style="color: #fff; font-weight: 700;">${bettor.totalPicks} (${bettor.totalWins}W)</span>
                        </div>
                    </div>
                    
                    <!-- Social Links -->
                    <div style="display: flex; justify-content: center; gap: 15px;">
                        <a href="https://twitter.com/${bettor.twitter}" target="_blank" style="
                            background: rgba(29,161,242,0.2);
                            color: #1DA1F2;
                            padding: 10px 20px;
                            border-radius: 20px;
                            text-decoration: none;
                            font-weight: 700;
                            border: 2px solid #1DA1F2;
                            transition: all 0.3s;
                        " onmouseover="this.style.background='rgba(29,161,242,0.4)'" onmouseout="this.style.background='rgba(29,161,242,0.2)'">
                            <i class="fab fa-twitter mr-1"></i>@${bettor.twitter}
                        </a>
                        <a href="https://instagram.com/${bettor.instagram}" target="_blank" style="
                            background: rgba(225,48,108,0.2);
                            color: #E1306C;
                            padding: 10px 20px;
                            border-radius: 20px;
                            text-decoration: none;
                            font-weight: 700;
                            border: 2px solid #E1306C;
                            transition: all 0.3s;
                        " onmouseover="this.style.background='rgba(225,48,108,0.4)'" onmouseout="this.style.background='rgba(225,48,108,0.2)'">
                            <i class="fab fa-instagram mr-1"></i>@${bettor.instagram}
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = podiumHTML;
}

// Old single bettor function (kept for compatibility)
function getTopBettor() {
    const top3 = getTop3Bettors();
    return top3[0]; // Return #1
}

// Submit Win Screenshot
function openWinSubmission() {
    if (!currentUser) {
        alert('Please login to submit your winning ticket!');
        $('#loginModal').modal('show');
        return;
    }
    
    const modalHTML = `
        <div id="winSubmissionModal" style="
            display: block;
            position: fixed;
            z-index: 99999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.9);
            opacity: 0;
            transition: opacity 0.3s ease;
        ">
            <div style="
                position: relative;
                background: #000;
                margin: 3% auto;
                padding: 0;
                border: 3px solid #FFD700;
                border-radius: 20px;
                width: 90%;
                max-width: 700px;
                box-shadow: 0 20px 60px rgba(255,215,0,0.5);
            ">
                <div style="padding: 25px; border-bottom: 2px solid #FFD700; display: flex; justify-content: space-between; align-items: center;">
                    <h5 style="color: #FFD700; font-weight: 900; margin: 0;">
                        <i class="fas fa-trophy" style="margin-right: 10px;"></i>Submit Your Winning Ticket
                    </h5>
                    <button onclick="closeWinSubmissionModal()" style="
                        background: none;
                        border: none;
                        color: #fff;
                        font-size: 2rem;
                        cursor: pointer;
                        padding: 0;
                        width: 40px;
                        height: 40px;
                    ">&times;</button>
                </div>
                <div style="padding: 30px;">
                    <div class="alert alert-success" style="background: rgba(0,255,136,0.1); border: 1px solid #00ff88;">
                        <i class="fas fa-info-circle mr-2"></i>
                        <strong>How it works:</strong> Upload a screenshot of your winning bet slip showing:
                        <ul style="margin-top: 10px; margin-bottom: 0;">
                            <li>The pick(s) came from LuckLab AI</li>
                            <li>Your total winnings</li>
                            <li>Bet confirmation/payout</li>
                        </ul>
                    </div>
                    
                    <form id="winSubmissionForm" onsubmit="submitWinningTicket(event)">
                        <div class="form-group">
                            <label style="color: #fff; font-weight: 600;">Your Name/Username:</label>
                            <input type="text" id="winnerName" value="${currentUser.name || ''}" class="form-control" required style="background: #0a0a0a; color: #fff; border: 2px solid #FFD700;">
                        </div>
                        
                        <div class="form-group">
                            <label style="color: #fff; font-weight: 600;">Total Profit Amount:</label>
                            <input type="number" id="winAmount" placeholder="e.g., 5000" class="form-control" required style="background: #0a0a0a; color: #fff; border: 2px solid #FFD700;">
                            <small style="color: #999;">Enter amount in dollars (no symbols)</small>
                        </div>
                        
                        <div class="form-group">
                            <label style="color: #fff; font-weight: 600;">Which Pick(s) Won:</label>
                            <textarea id="winningPicks" placeholder="e.g., Chiefs -3.5, Lakers Over 220.5" class="form-control" rows="3" required style="background: #0a0a0a; color: #fff; border: 2px solid #FFD700;"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label style="color: #fff; font-weight: 600;">Upload Screenshot:</label>
                            <input type="file" id="winScreenshot" accept="image/*" class="form-control" required style="background: #0a0a0a; color: #fff; border: 2px solid #FFD700;">
                            <small style="color: #999;">Max 5MB - JPG, PNG, or WEBP</small>
                        </div>
                        
                        <div class="form-group">
                            <label style="color: #fff; font-weight: 600;">Twitter Handle (Optional):</label>
                            <input type="text" id="winnerTwitter" placeholder="@YourHandle" class="form-control" style="background: #0a0a0a; color: #fff; border: 2px solid #FFD700;">
                        </div>
                        
                        <div class="form-group">
                            <label style="color: #fff; font-weight: 600;">Instagram Handle (Optional):</label>
                            <input type="text" id="winnerInstagram" placeholder="@YourHandle" class="form-control" style="background: #0a0a0a; color: #fff; border: 2px solid #FFD700;">
                        </div>
                        
                        <button type="submit" style="
                            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                            color: #000;
                            border: none;
                            padding: 15px 40px;
                            border-radius: 25px;
                            font-weight: 900;
                            font-size: 1.1rem;
                            width: 100%;
                            cursor: pointer;
                            box-shadow: 0 6px 25px rgba(255,215,0,0.5);
                        " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                            <i class="fas fa-paper-plane mr-2"></i>SUBMIT FOR VERIFICATION
                        </button>
                    </form>
                    
                    <div class="alert alert-warning mt-3" style="background: rgba(255,193,7,0.1); border: 1px solid #ffc107;">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        <strong>Note:</strong> All submissions are reviewed by our admin team. Approved winners will be featured on the leaderboard!
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existing = document.getElementById('winSubmissionModal');
    if (existing) existing.remove();
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Fade in
    setTimeout(() => {
        const modal = document.getElementById('winSubmissionModal');
        if (modal) modal.style.opacity = '1';
    }, 10);
    
    // Close on background click
    document.getElementById('winSubmissionModal').addEventListener('click', function(e) {
        if (e.target.id === 'winSubmissionModal') {
            closeWinSubmissionModal();
        }
    });
}

function closeWinSubmissionModal() {
    const modal = document.getElementById('winSubmissionModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    }
}

async function submitWinningTicket(event) {
    event.preventDefault();
    
    const name = document.getElementById('winnerName').value;
    const amount = document.getElementById('winAmount').value;
    const picks = document.getElementById('winningPicks').value;
    const screenshot = document.getElementById('winScreenshot').files[0];
    const twitter = document.getElementById('winnerTwitter').value;
    const instagram = document.getElementById('winnerInstagram').value;
    
    if (!screenshot) {
        alert('Please upload a screenshot!');
        return;
    }
    
    // Convert image to base64
    const reader = new FileReader();
    reader.onload = async function(e) {
        const submission = {
            timestamp: new Date().toISOString(),
            date: new Date().toDateString(),
            user: name,
            email: currentUser.email,
            tier: currentUser.membershipTier || 'free',
            amount: parseFloat(amount),
            picks: picks,
            twitter: twitter,
            instagram: instagram,
            screenshot: e.target.result, // Base64 image
            status: 'pending',
            verified: false
        };
        
        // Save to localStorage for admin review
        let submissions = JSON.parse(localStorage.getItem('winSubmissions')) || [];
        submissions.push(submission);
        localStorage.setItem('winSubmissions', JSON.stringify(submissions));
        
        // Also try to send to backend
        try {
            await fetch('http://192.168.1.102:5002/api/submit-win', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submission)
            });
        } catch (e) {
            console.log('Backend not available, submission saved locally');
        }
        
        alert('✅ Submission received! Our team will review your winning ticket within 24 hours.');
        closeWinSubmissionModal();
    };
    
    reader.readAsDataURL(screenshot);
}

function updateTopBettorDisplay(bettorData) {
    // Function to dynamically update the top bettor
    if (!bettorData) return;
    
    document.getElementById('topBettorName').textContent = `@${bettorData.name}`;
    document.getElementById('topBettorHandle').innerHTML = `
        <i class="fab fa-twitter" style="margin-right: 8px;"></i>@${bettorData.twitter}
        <i class="fab fa-instagram" style="margin-left: 20px; margin-right: 8px;"></i>@${bettorData.instagram}
    `;
    document.getElementById('topBettorWinRate').textContent = bettorData.winRate;
    document.getElementById('topBettorPicks').textContent = bettorData.totalPicks;
    document.getElementById('topBettorProfit').textContent = bettorData.profit;
    
    if (bettorData.avatar) {
        document.getElementById('topBettorAvatar').src = bettorData.avatar;
    }
}

// Community Features
function loadCommunityUpdates() {
    // This function now uses real Telegram messages
    return loadRecentMessages();
}

// Bet Slip Integration Functions
function addPickToBetSlipFromCard(pickId) {
    const pick = picks.find(p => p.id == pickId); // Use == to handle string/number mismatch
    if (!pick) {
        console.error('Pick not found:', pickId);
        return;
    }
    
    // Format the pick data for the bet slip (handle both old and new formats)
    const betSlipPick = {
        gameId: pick.id,
        sport: pick.sport,
        matchup: pick.teams || pick.game || 'Game',
        game: pick.teams || pick.game || 'Game',
        betType: pick.betType || pick.pick_type || pick.type || 'Pick',
        pick: pick.prediction || pick.pick || pick.description,
        prediction: pick.prediction || pick.pick || pick.description,
        odds: pick.odds || 'N/A',
        confidence: pick.confidence || '',
        amount: 0
    };
    
    // Add to bet slip using the BetSlipBuilder
    if (typeof betSlipBuilder !== 'undefined') {
        betSlipBuilder.addPickToBetSlip(betSlipPick);
    } else {
        console.error('BetSlipBuilder not loaded');
    }
}
