// Sports News Feed Integration for InsightAI
// Uses ESPN RSS feeds and unofficial ESPN API

// ESPN API endpoints (unofficial but publicly accessible)
const ESPN_API = {
    nfl: {
        scores: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
        news: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/news'
    },
    nba: {
        scores: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
        news: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news'
    },
    mlb: {
        scores: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
        news: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/news'
    },
    nhl: {
        scores: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
        news: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/news'
    },
    ncaaf: {
        scores: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard',
        news: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/news'
    },
    cfb: {
        scores: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard',
        news: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/news'
    },
    ncaab: {
        scores: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard',
        news: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/news'
    },
    cbb: {
        scores: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard',
        news: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/news'
    },
    soccer: {
        scores: 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard',
        news: 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/news'
    }
};

// Fetch sports news from ESPN
async function fetchSportsNews(sport = 'nfl') {
    try {
        const response = await fetch(ESPN_API[sport].news);
        const data = await response.json();
        
        if (data.articles) {
            return data.articles.map(article => ({
                title: article.headline,
                description: article.description,
                image: article.images?.[0]?.url || '',
                url: article.links?.web?.href || '',
                date: new Date(article.published),
                source: 'ESPN'
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching sports news:', error);
        return [];
    }
}

// Fetch live scores from ESPN
async function fetchLiveScores(sport = 'nfl') {
    try {
        console.log(`🔍 fetchLiveScores called with sport: ${sport}`);
        console.log(`📡 Fetching from: ${ESPN_API[sport]?.scores || 'UNDEFINED'}`);
        
        const response = await fetch(ESPN_API[sport].scores);
        const data = await response.json();
        
        console.log(`✅ API Response for ${sport}:`, {
            status: response.status,
            hasEvents: !!data.events,
            eventCount: data.events ? data.events.length : 0
        });
        
        if (data.events) {
            const games = data.events.map(game => ({
                id: game.id,
                name: game.name,
                shortName: game.shortName,
                date: new Date(game.date),
                status: game.status.type.description,
                homeTeam: {
                    name: game.competitions[0].competitors[0].team.displayName,
                    logo: game.competitions[0].competitors[0].team.logo,
                    score: game.competitions[0].competitors[0].score
                },
                awayTeam: {
                    name: game.competitions[0].competitors[1].team.displayName,
                    logo: game.competitions[0].competitors[1].team.logo,
                    score: game.competitions[0].competitors[1].score
                }
            }));
            
            console.log(`🎮 Returning ${games.length} games for ${sport}:`, games.slice(0, 3).map(g => g.name));
            return games;
        }
        
        console.log(`⚠️ No events found for ${sport}`);
        return [];
    } catch (error) {
        console.error(`❌ Error fetching live scores for ${sport}:`, error);
        return [];
    }
}

// Display news feed in your website
function displayNewsFeed(news, containerId = 'newsFeed') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = news.map(article => `
        <div class="news-item mb-3 p-3 bg-light rounded">
            <div class="row">
                ${article.image ? `
                <div class="col-md-3">
                    <img src="${article.image}" class="img-fluid rounded" alt="${article.title}">
                </div>
                ` : ''}
                <div class="${article.image ? 'col-md-9' : 'col-12'}">
                    <h5 class="mb-2">
                        <a href="${article.url}" target="_blank" class="text-dark text-decoration-none">
                            ${article.title}
                        </a>
                    </h5>
                    <p class="text-muted mb-2">${article.description || ''}</p>
                    <small class="text-primary">
                        <i class="far fa-clock"></i> ${formatTimeAgo(article.date)}
                    </small>
                </div>
            </div>
        </div>
    `).join('');
}

// Display live scores
function displayLiveScores(scores, containerId = 'liveScores') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = scores.map(game => `
        <div class="score-card mb-3 p-3 bg-light rounded">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge badge-primary">${game.status}</span>
                <small class="text-muted">${formatDate(game.date)}</small>
            </div>
            <div class="row align-items-center">
                <div class="col-5 text-center">
                    <img src="${game.awayTeam.logo}" alt="${game.awayTeam.name}" style="width: 40px; height: 40px;">
                    <div class="mt-2">${game.awayTeam.name}</div>
                    <h3 class="mb-0">${game.awayTeam.score || '-'}</h3>
                </div>
                <div class="col-2 text-center">
                    <h4 class="mb-0">VS</h4>
                </div>
                <div class="col-5 text-center">
                    <img src="${game.homeTeam.logo}" alt="${game.homeTeam.name}" style="width: 40px; height: 40px;">
                    <div class="mt-2">${game.homeTeam.name}</div>
                    <h3 class="mb-0">${game.homeTeam.score || '-'}</h3>
                </div>
            </div>
        </div>
    `).join('');
}

// Auto-refresh news feed every 5 minutes
function startNewsUpdates(sport = 'nfl', interval = 300000) {
    // Initial load
    fetchAndDisplayNews(sport);
    
    // Auto-refresh
    setInterval(() => {
        fetchAndDisplayNews(sport);
    }, interval);
}

// Auto-refresh live scores every 30 seconds
function startScoreUpdates(sport = 'nfl', interval = 30000) {
    // Initial load
    fetchAndDisplayScores(sport);
    
    // Auto-refresh
    setInterval(() => {
        fetchAndDisplayScores(sport);
    }, interval);
}

// Helper function to fetch and display news
async function fetchAndDisplayNews(sport) {
    const news = await fetchSportsNews(sport);
    displayNewsFeed(news);
}

// Helper function to fetch and display scores
async function fetchAndDisplayScores(sport) {
    const scores = await fetchLiveScores(sport);
    displayLiveScores(scores);
}

// Format date helper
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    }).format(date);
}

// Format time ago helper
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

// Initialize news feed when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Start with NFL news and scores
    startNewsUpdates('nfl', 300000); // Update news every 5 minutes
    startScoreUpdates('nfl', 30000);  // Update scores every 30 seconds
});

// Export functions for use in other scripts
window.SportsNewsFeed = {
    fetchSportsNews,
    fetchLiveScores,
    displayNewsFeed,
    displayLiveScores,
    startNewsUpdates,
    startScoreUpdates
};

