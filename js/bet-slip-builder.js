/**
 * LuckLab AI - Betting Slip Builder
 * Automatically builds betting tickets and redirects to Hard Rock Bet
 */

class BetSlipBuilder {
    constructor() {
        this.betSlip = [];
        this.initialized = false;
        this.init();
    }

    init() {
        if (this.initialized) return;
        
        // Load saved bet slip from localStorage
        const savedSlip = localStorage.getItem('lucklab_bet_slip');
        if (savedSlip) {
            try {
                this.betSlip = JSON.parse(savedSlip);
            } catch (e) {
                this.betSlip = [];
            }
        }
        
        this.initialized = true;
        this.updateBetSlipUI();
    }

    addPickToBetSlip(pick) {
        // Check if pick already exists
        const existingIndex = this.betSlip.findIndex(
            item => item.gameId === pick.gameId && item.betType === pick.betType
        );

        if (existingIndex !== -1) {
            // Update existing pick
            this.betSlip[existingIndex] = pick;
            this.showNotification('Pick updated in your bet slip!', 'info');
        } else {
            // Add new pick
            this.betSlip.push(pick);
            this.showNotification('Pick added to your bet slip!', 'success');
        }

        this.saveBetSlip();
        this.updateBetSlipUI();
    }

    removeFromBetSlip(index) {
        if (index >= 0 && index < this.betSlip.length) {
            this.betSlip.splice(index, 1);
            this.saveBetSlip();
            this.updateBetSlipUI();
            this.showNotification('Pick removed from bet slip', 'info');
        }
    }

    clearBetSlip() {
        this.betSlip = [];
        this.saveBetSlip();
        this.updateBetSlipUI();
        this.showNotification('Bet slip cleared', 'info');
    }

    saveBetSlip() {
        localStorage.setItem('lucklab_bet_slip', JSON.stringify(this.betSlip));
    }

    getBetSlipCount() {
        return this.betSlip.length;
    }

    updateBetSlipUI() {
        const betSlipWidget = document.getElementById('betSlipWidget');
        const betSlipCount = document.getElementById('betSlipCount');
        const betSlipItems = document.getElementById('betSlipItems');
        const betSlipEmpty = document.getElementById('betSlipEmpty');
        const betSlipActions = document.getElementById('betSlipActions');

        if (betSlipCount) {
            betSlipCount.textContent = this.betSlip.length;
            if (this.betSlip.length > 0) {
                betSlipCount.style.display = 'flex';
            } else {
                betSlipCount.style.display = 'none';
            }
        }

        if (betSlipItems && betSlipEmpty) {
            if (this.betSlip.length === 0) {
                betSlipItems.style.display = 'none';
                betSlipEmpty.style.display = 'block';
                if (betSlipActions) betSlipActions.style.display = 'none';
            } else {
                betSlipItems.style.display = 'block';
                betSlipEmpty.style.display = 'none';
                if (betSlipActions) betSlipActions.style.display = 'block';
                this.renderBetSlipItems();
            }
        }
    }

    renderBetSlipItems() {
        const betSlipItems = document.getElementById('betSlipItems');
        if (!betSlipItems) return;

        betSlipItems.innerHTML = this.betSlip.map((pick, index) => `
            <div class="bet-slip-item" style="background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 8px; padding: 10px; margin-bottom: 8px;">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div style="flex: 1;">
                        <div style="color: #00ff88; font-weight: 600; font-size: 0.9rem;">${pick.sport?.toUpperCase() || 'SPORT'}</div>
                        <div style="color: white; font-weight: 600; font-size: 0.95rem; margin-top: 2px;">${pick.matchup || pick.game || 'Game'}</div>
                    </div>
                    <button onclick="betSlipBuilder.removeFromBetSlip(${index})" class="btn btn-sm" style="background: rgba(255, 0, 0, 0.2); border: 1px solid rgba(255, 0, 0, 0.5); color: #ff4444; padding: 2px 8px; border-radius: 5px;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="color: #b0b3b8; font-size: 0.85rem; margin-bottom: 5px;">
                    <strong style="color: white;">${pick.betType || 'BET'}:</strong> ${pick.pick || pick.prediction || 'N/A'}
                </div>
                ${pick.odds ? `<div style="color: #00d4ff; font-weight: 600; font-size: 0.85rem;">Odds: ${pick.odds}</div>` : ''}
                ${pick.confidence ? `<div style="color: #b0b3b8; font-size: 0.8rem; margin-top: 3px;">Confidence: ${pick.confidence}</div>` : ''}
            </div>
        `).join('');
    }

    buildHardRockBetURL() {
        // Build URL for Hard Rock Bet app
        const baseURL = 'https://app.hardrock.bet/home';
        
        // Create bet slip data structure
        const betData = this.betSlip.map(pick => {
            return {
                sport: pick.sport,
                game: pick.matchup || pick.game,
                betType: pick.betType,
                selection: pick.pick || pick.prediction,
                odds: pick.odds,
                amount: pick.amount || 0
            };
        });

        // Return URL object with bet slip data
        return {
            baseURL: baseURL,
            betSlipData: betData,
            encodedData: btoa(JSON.stringify(betData)),
            pickCount: this.betSlip.length
        };
    }

    openHardRockBet() {
        if (this.betSlip.length === 0) {
            this.showNotification('Please add picks to your bet slip first!', 'warning');
            return;
        }

        const betURL = this.buildHardRockBetURL();
        
        // Create a detailed summary modal first
        this.showBetSlipSummary(betURL);
    }

    showBetSlipSummary(betURL) {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div id="betSlipSummaryModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 2px solid #00ff88; border-radius: 15px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 8px 30px rgba(0, 255, 136, 0.3);">
                    <div style="padding: 20px; border-bottom: 2px solid #00ff88;">
                        <div class="d-flex justify-content-between align-items-center">
                            <h3 style="color: #00ff88; margin: 0; font-weight: 600;">
                                <i class="fas fa-ticket-alt mr-2"></i>Your Bet Slip
                            </h3>
                            <button onclick="document.getElementById('betSlipSummaryModal').remove()" class="btn btn-sm" style="background: rgba(255, 0, 0, 0.2); border: 1px solid rgba(255, 0, 0, 0.5); color: #ff4444;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div style="padding: 20px;">
                        <div style="color: white; font-size: 0.95rem; margin-bottom: 20px;">
                            <strong style="color: #00ff88;">${this.betSlip.length}</strong> picks ready to place
                        </div>
                        
                        <div id="summaryItems" style="margin-bottom: 20px;">
                            ${this.betSlip.map((pick, index) => `
                                <div style="background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 8px; padding: 12px; margin-bottom: 10px;">
                                    <div style="color: #00ff88; font-weight: 600; font-size: 0.85rem; margin-bottom: 5px;">${pick.sport?.toUpperCase() || 'SPORT'}</div>
                                    <div style="color: white; font-weight: 600; margin-bottom: 5px;">${pick.matchup || pick.game || 'Game'}</div>
                                    <div style="color: #b0b3b8; font-size: 0.9rem;">
                                        <strong style="color: white;">${pick.betType || 'BET'}:</strong> ${pick.pick || pick.prediction || 'N/A'}
                                    </div>
                                    ${pick.odds ? `<div style="color: #00d4ff; font-weight: 600; font-size: 0.9rem; margin-top: 3px;">Odds: ${pick.odds}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        
                        <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 8px; padding: 12px; margin-bottom: 20px;">
                            <div style="color: #00d4ff; font-size: 0.9rem; margin-bottom: 8px;">
                                <i class="fas fa-info-circle mr-2"></i><strong>Ready to Place Your Bets?</strong>
                            </div>
                            <div style="color: #b0b3b8; font-size: 0.85rem;">
                                Click "Open Hard Rock Bet" to visit <strong>app.hardrock.bet/home</strong> and place your bets with these selections.
                            </div>
                        </div>
                        
                        <div class="d-flex" style="gap: 10px;">
                            <button onclick="betSlipBuilder.proceedToHardRock()" class="btn" style="flex: 1; background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%); color: #000; border: none; font-weight: bold; padding: 12px; border-radius: 10px;">
                                <i class="fas fa-external-link-alt mr-2"></i>Open Hard Rock Bet
                            </button>
                            <button onclick="betSlipBuilder.copyBetSlipToClipboard()" class="btn" style="background: rgba(0, 255, 136, 0.2); border: 1px solid #00ff88; color: #00ff88; font-weight: bold; padding: 12px; border-radius: 10px;">
                                <i class="fas fa-copy mr-2"></i>Copy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    proceedToHardRock() {
        const betURL = this.buildHardRockBetURL();
        
        // Open Hard Rock Bet in new tab
        const hardRockWindow = window.open(betURL.baseURL, '_blank');
        
        // Close the summary modal
        const modal = document.getElementById('betSlipSummaryModal');
        if (modal) modal.remove();
        
        // Show floating guide with picks
        this.showBettingGuide();
        
        this.showNotification('Hard Rock Bet opened! Use the guide to place your bets.', 'success');
    }

    showBettingGuide() {
        // Remove existing guide if present
        const existingGuide = document.getElementById('hardRockBettingGuide');
        if (existingGuide) existingGuide.remove();

        const guide = document.createElement('div');
        guide.id = 'hardRockBettingGuide';
        guide.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; width: 400px; max-height: 80vh; overflow-y: auto; z-index: 99999; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); border: 3px solid #00ff88; border-radius: 15px; box-shadow: 0 10px 40px rgba(0, 255, 136, 0.5); animation: slideInRight 0.5s ease;">
                <div style="background: linear-gradient(135deg, #000000 0%, #0d1117 100%); padding: 15px; border-bottom: 2px solid #00ff88; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-ticket-alt" style="color: #00ff88; font-size: 1.5em;"></i>
                        <span style="color: #00ff88; font-weight: 700; font-size: 1.1rem;">Quick Entry Guide</span>
                    </div>
                    <button onclick="document.getElementById('hardRockBettingGuide').remove()" style="background: rgba(255, 0, 0, 0.2); border: 1px solid rgba(255, 0, 0, 0.5); color: #ff4444; border-radius: 5px; padding: 5px 10px; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div style="padding: 15px;">
                    <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 8px; padding: 12px; margin-bottom: 15px;">
                        <p style="color: #00d4ff; margin: 0; font-size: 0.9rem; font-weight: 600;">
                            <i class="fas fa-info-circle mr-2"></i>Enter these picks on Hard Rock Bet
                        </p>
                        <p style="color: #b0b3b8; margin: 5px 0 0 0; font-size: 0.85rem;">
                            Click "Copy" on any pick to copy it to clipboard
                        </p>
                    </div>
                    
                    <div style="margin-bottom: 10px;">
                        ${this.betSlip.map((pick, index) => `
                            <div style="background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 10px; padding: 12px; margin-bottom: 10px; position: relative;">
                                <div style="position: absolute; top: 10px; right: 10px;">
                                    <button onclick="betSlipBuilder.copyPickToClipboard(${index})" class="btn btn-sm" style="background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%); color: #000; border: none; font-weight: bold; padding: 5px 12px; border-radius: 6px; font-size: 0.75rem;">
                                        <i class="fas fa-copy mr-1"></i>Copy
                                    </button>
                                </div>
                                
                                <div style="color: #00ff88; font-weight: 700; font-size: 0.8rem; margin-bottom: 5px;">
                                    PICK #${index + 1} - ${pick.sport}
                                </div>
                                
                                <div style="color: white; font-weight: 600; font-size: 1rem; margin-bottom: 8px; padding-right: 70px;">
                                    ${pick.matchup || pick.game}
                                </div>
                                
                                <div style="background: rgba(0, 255, 136, 0.1); border-left: 3px solid #00ff88; padding: 8px; margin-bottom: 8px; border-radius: 4px;">
                                    <div style="color: #b0b3b8; font-size: 0.75rem; margin-bottom: 3px;">BET TYPE:</div>
                                    <div style="color: white; font-weight: 600; font-size: 0.95rem;">${pick.betType}</div>
                                </div>
                                
                                <div style="background: rgba(0, 212, 255, 0.1); border-left: 3px solid #00d4ff; padding: 8px; margin-bottom: 8px; border-radius: 4px;">
                                    <div style="color: #b0b3b8; font-size: 0.75rem; margin-bottom: 3px;">SELECTION:</div>
                                    <div style="color: #00d4ff; font-weight: 700; font-size: 1.1rem;">${pick.pick || pick.prediction}</div>
                                </div>
                                
                                ${pick.odds ? `
                                    <div style="display: flex; gap: 10px;">
                                        <div style="flex: 1;">
                                            <div style="color: #b0b3b8; font-size: 0.75rem;">ODDS:</div>
                                            <div style="color: white; font-weight: 600; font-size: 0.9rem;">${pick.odds}</div>
                                        </div>
                                        ${pick.confidence ? `
                                            <div style="flex: 1;">
                                                <div style="color: #b0b3b8; font-size: 0.75rem;">CONFIDENCE:</div>
                                                <div style="color: #00ff88; font-weight: 600; font-size: 0.9rem;">${pick.confidence}</div>
                                            </div>
                                        ` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="border-top: 1px solid rgba(0, 255, 136, 0.3); padding-top: 15px; margin-top: 15px;">
                        <button onclick="betSlipBuilder.copyAllPicksDetailed()" class="btn" style="width: 100%; background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%); color: #000; border: none; font-weight: bold; padding: 12px; border-radius: 10px; margin-bottom: 10px;">
                            <i class="fas fa-copy mr-2"></i>Copy All Picks
                        </button>
                        <button onclick="document.getElementById('hardRockBettingGuide').remove()" class="btn" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); color: white; font-weight: bold; padding: 10px; border-radius: 10px;">
                            <i class="fas fa-check mr-2"></i>Done Placing Bets
                        </button>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                #hardRockBettingGuide::-webkit-scrollbar {
                    width: 8px;
                }
                
                #hardRockBettingGuide::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 4px;
                }
                
                #hardRockBettingGuide::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
                    border-radius: 4px;
                }
            </style>
        `;
        
        document.body.appendChild(guide);
    }

    copyPickToClipboard(index) {
        const pick = this.betSlip[index];
        const pickText = `${pick.sport} - ${pick.matchup || pick.game}
Bet Type: ${pick.betType}
Selection: ${pick.pick || pick.prediction}
${pick.odds ? `Odds: ${pick.odds}` : ''}
${pick.confidence ? `Confidence: ${pick.confidence}` : ''}`;

        navigator.clipboard.writeText(pickText).then(() => {
            this.showNotification(`Pick #${index + 1} copied!`, 'success');
        }).catch(() => {
            this.showNotification('Failed to copy. Please try again.', 'error');
        });
    }

    copyAllPicksDetailed() {
        const allPicks = this.betSlip.map((pick, index) => {
            return `PICK #${index + 1} - ${pick.sport}
Game: ${pick.matchup || pick.game}
Bet Type: ${pick.betType}
Selection: ${pick.pick || pick.prediction}
${pick.odds ? `Odds: ${pick.odds}` : ''}
${pick.confidence ? `Confidence: ${pick.confidence}` : ''}`;
        }).join('\n\n' + '─'.repeat(50) + '\n\n');

        const fullText = `LuckLab AI - Your Bet Slip (${this.betSlip.length} picks)\n${'═'.repeat(50)}\n\n${allPicks}\n\n${'═'.repeat(50)}\nGenerated by LuckLab AI Bot Predictor`;

        navigator.clipboard.writeText(fullText).then(() => {
            this.showNotification('All picks copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy. Please try again.', 'error');
        });
    }

    copyBetSlipToClipboard() {
        const betText = this.betSlip.map((pick, index) => {
            return `${index + 1}. ${pick.sport?.toUpperCase() || 'SPORT'} - ${pick.matchup || pick.game}
   ${pick.betType}: ${pick.pick || pick.prediction}
   ${pick.odds ? `Odds: ${pick.odds}` : ''}
   ${pick.confidence ? `Confidence: ${pick.confidence}` : ''}`;
        }).join('\n\n');

        const fullText = `LuckLab AI Bet Slip (${this.betSlip.length} picks)\n\n${betText}`;

        navigator.clipboard.writeText(fullText).then(() => {
            this.showNotification('Bet slip copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy. Please try again.', 'error');
        });
    }

    showNotification(message, type = 'info') {
        const colors = {
            success: '#00ff88',
            info: '#00d4ff',
            warning: '#ffaa00',
            error: '#ff4444'
        };

        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, ${colors[type]} 0%, ${colors[type]}dd 100%); color: ${type === 'warning' ? '#000' : '#fff'}; padding: 15px 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); z-index: 9999; font-weight: bold; animation: slideIn 0.3s ease;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} mr-2"></i>${message}
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
}

// Initialize the bet slip builder
const betSlipBuilder = new BetSlipBuilder();

// Function to add a pick from the available picks section
function addPickToBetSlip(pickData) {
    betSlipBuilder.addPickToBetSlip(pickData);
}

// Toggle bet slip widget
function toggleBetSlip() {
    const betSlipBody = document.getElementById('betSlipBody');
    const betSlipToggleIcon = document.getElementById('betSlipToggleIcon');
    
    if (betSlipBody.style.display === 'none') {
        betSlipBody.style.display = 'block';
        betSlipToggleIcon.className = 'fas fa-chevron-down';
    } else {
        betSlipBody.style.display = 'none';
        betSlipToggleIcon.className = 'fas fa-chevron-up';
    }
}

