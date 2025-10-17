/**
 * LuckLab - Team Logos Database
 * Automatically display team logos for picks
 */

const TEAM_LOGOS = {
    // NFL Teams
    'Cardinals': 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',
    'Arizona Cardinals': 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',
    'Falcons': 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
    'Atlanta Falcons': 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
    'Ravens': 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
    'Baltimore Ravens': 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
    'Bills': 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
    'Buffalo Bills': 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
    'Panthers': 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
    'Carolina Panthers': 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
    'Bears': 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    'Chicago Bears': 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    'Bengals': 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
    'Cincinnati Bengals': 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
    'Browns': 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
    'Cleveland Browns': 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
    'Cowboys': 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
    'Dallas Cowboys': 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
    'Broncos': 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
    'Denver Broncos': 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
    'Lions': 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
    'Detroit Lions': 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
    'Packers': 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
    'Green Bay Packers': 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
    'Texans': 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
    'Houston Texans': 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
    'Colts': 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
    'Indianapolis Colts': 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
    'Jaguars': 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
    'Jacksonville Jaguars': 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
    'Chiefs': 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
    'Kansas City Chiefs': 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
    'Raiders': 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
    'Las Vegas Raiders': 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
    'Chargers': 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
    'LA Chargers': 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
    'Los Angeles Chargers': 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
    'Rams': 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
    'LA Rams': 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
    'Los Angeles Rams': 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
    'Dolphins': 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
    'Miami Dolphins': 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
    'Vikings': 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
    'Minnesota Vikings': 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
    'Patriots': 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
    'New England Patriots': 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
    'Saints': 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
    'New Orleans Saints': 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
    'Giants': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
    'New York Giants': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
    'Jets': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
    'New York Jets': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
    'Eagles': 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
    'Philadelphia Eagles': 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
    'Steelers': 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
    'Pittsburgh Steelers': 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
    '49ers': 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
    'San Francisco 49ers': 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
    'Seahawks': 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
    'Seattle Seahawks': 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
    'Buccaneers': 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
    'Tampa Bay Buccaneers': 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
    'Titans': 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
    'Tennessee Titans': 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
    'Commanders': 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png',
    'Washington Commanders': 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png',

    // MLB Teams
    'Dodgers': 'https://a.espncdn.com/i/teamlogos/mlb/500/lad.png',
    'LA Dodgers': 'https://a.espncdn.com/i/teamlogos/mlb/500/lad.png',
    'Los Angeles Dodgers': 'https://a.espncdn.com/i/teamlogos/mlb/500/lad.png',
    'Yankees': 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png',
    'New York Yankees': 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png',
    'Red Sox': 'https://a.espncdn.com/i/teamlogos/mlb/500/bos.png',
    'Boston Red Sox': 'https://a.espncdn.com/i/teamlogos/mlb/500/bos.png',
    'Astros': 'https://a.espncdn.com/i/teamlogos/mlb/500/hou.png',
    'Houston Astros': 'https://a.espncdn.com/i/teamlogos/mlb/500/hou.png',
    'Braves': 'https://a.espncdn.com/i/teamlogos/mlb/500/atl.png',
    'Atlanta Braves': 'https://a.espncdn.com/i/teamlogos/mlb/500/atl.png',
    'Mets': 'https://a.espncdn.com/i/teamlogos/mlb/500/nym.png',
    'New York Mets': 'https://a.espncdn.com/i/teamlogos/mlb/500/nym.png',
    'Phillies': 'https://a.espncdn.com/i/teamlogos/mlb/500/phi.png',
    'Philadelphia Phillies': 'https://a.espncdn.com/i/teamlogos/mlb/500/phi.png',
    'Padres': 'https://a.espncdn.com/i/teamlogos/mlb/500/sd.png',
    'San Diego Padres': 'https://a.espncdn.com/i/teamlogos/mlb/500/sd.png',
    'Brewers': 'https://a.espncdn.com/i/teamlogos/mlb/500/mil.png',
    'Mil Brewers': 'https://a.espncdn.com/i/teamlogos/mlb/500/mil.png',
    'Milwaukee Brewers': 'https://a.espncdn.com/i/teamlogos/mlb/500/mil.png',
    'Cubs': 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    'Chicago Cubs': 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    'White Sox': 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    'Chicago White Sox': 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',

    // NBA Teams
    'Lakers': 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
    'LA Lakers': 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
    'Los Angeles Lakers': 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
    'Warriors': 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png',
    'Golden State Warriors': 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png',
    'Celtics': 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    'Boston Celtics': 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    'Heat': 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
    'Miami Heat': 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
    'Bucks': 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png',
    'Milwaukee Bucks': 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png',
    'Nets': 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png',
    'Brooklyn Nets': 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png',
    'Knicks': 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png',
    'New York Knicks': 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png',
    'Suns': 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png',
    'Phoenix Suns': 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png',
    'Clippers': 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png',
    'LA Clippers': 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png',
    'Los Angeles Clippers': 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png',
    'Nuggets': 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
    'Denver Nuggets': 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
    'Mavericks': 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
    'Dallas Mavericks': 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
    'Pelicans': 'https://a.espncdn.com/i/teamlogos/nba/500/no.png',
    'No Pelicans': 'https://a.espncdn.com/i/teamlogos/nba/500/no.png',
    'New Orleans Pelicans': 'https://a.espncdn.com/i/teamlogos/nba/500/no.png',
    'Hawks': 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png',
    'Atl Hawks': 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png',
    'Atlanta Hawks': 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png',
    'Bulls': 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    'Chicago Bulls': 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    'Cavaliers': 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png',
    'Cleveland Cavaliers': 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png',
    'Cavs': 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png',
    'Pistons': 'https://a.espncdn.com/i/teamlogos/nba/500/det.png',
    'Detroit Pistons': 'https://a.espncdn.com/i/teamlogos/nba/500/det.png',
    'Pacers': 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png',
    'Indiana Pacers': 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png',
    'Hornets': 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png',
    'Charlotte Hornets': 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png',
    '76ers': 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png',
    'Sixers': 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png',
    'Philadelphia 76ers': 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png',
    'Raptors': 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png',
    'Toronto Raptors': 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png',
    'Wizards': 'https://a.espncdn.com/i/teamlogos/nba/500/wsh.png',
    'Washington Wizards': 'https://a.espncdn.com/i/teamlogos/nba/500/wsh.png',
    'Magic': 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png',
    'Orlando Magic': 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png',
    'Jazz': 'https://a.espncdn.com/i/teamlogos/nba/500/utah.png',
    'Utah Jazz': 'https://a.espncdn.com/i/teamlogos/nba/500/utah.png',
    'Spurs': 'https://a.espncdn.com/i/teamlogos/nba/500/sa.png',
    'San Antonio Spurs': 'https://a.espncdn.com/i/teamlogos/nba/500/sa.png',
    'Kings': 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png',
    'Sacramento Kings': 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png',
    'Trail Blazers': 'https://a.espncdn.com/i/teamlogos/nba/500/por.png',
    'Portland Trail Blazers': 'https://a.espncdn.com/i/teamlogos/nba/500/por.png',
    'Blazers': 'https://a.espncdn.com/i/teamlogos/nba/500/por.png',
    'Thunder': 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png',
    'Oklahoma City Thunder': 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png',
    'OKC Thunder': 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png',
    'Rockets': 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png',
    'Houston Rockets': 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png',
    'Grizzlies': 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png',
    'Memphis Grizzlies': 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png',
    'Timberwolves': 'https://a.espncdn.com/i/teamlogos/nba/500/min.png',
    'Minnesota Timberwolves': 'https://a.espncdn.com/i/teamlogos/nba/500/min.png',
    'Wolves': 'https://a.espncdn.com/i/teamlogos/nba/500/min.png',

    // NHL Teams
    'Bruins': 'https://a.espncdn.com/i/teamlogos/nhl/500/bos.png',
    'Boston Bruins': 'https://a.espncdn.com/i/teamlogos/nhl/500/bos.png',
    'Maple Leafs': 'https://a.espncdn.com/i/teamlogos/nhl/500/tor.png',
    'Toronto Maple Leafs': 'https://a.espncdn.com/i/teamlogos/nhl/500/tor.png',
    'Lightning': 'https://a.espncdn.com/i/teamlogos/nhl/500/tb.png',
    'Tampa Bay Lightning': 'https://a.espncdn.com/i/teamlogos/nhl/500/tb.png',
    'Avalanche': 'https://a.espncdn.com/i/teamlogos/nhl/500/col.png',
    'Colorado Avalanche': 'https://a.espncdn.com/i/teamlogos/nhl/500/col.png',
    'Oilers': 'https://a.espncdn.com/i/teamlogos/nhl/500/edm.png',
    'Edmonton Oilers': 'https://a.espncdn.com/i/teamlogos/nhl/500/edm.png',
    'Rangers': 'https://a.espncdn.com/i/teamlogos/nhl/500/nyr.png',
    'New York Rangers': 'https://a.espncdn.com/i/teamlogos/nhl/500/nyr.png',
};

/**
 * Get logo URL for a team
 */
function getTeamLogo(teamName) {
    if (!teamName) return null;
    
    // Try exact match first
    if (TEAM_LOGOS[teamName]) {
        return TEAM_LOGOS[teamName];
    }
    
    // Try to find partial match
    for (const [key, url] of Object.entries(TEAM_LOGOS)) {
        if (teamName.includes(key) || key.includes(teamName)) {
            return url;
        }
    }
    
    return null;
}

/**
 * Parse teams from game string
 */
function parseTeamsFromGame(gameString) {
    // Handle "Team A vs Team B" or "Team A @ Team B"
    const separators = [' vs ', ' @ ', ' at ', ' VS ', ' @ '];
    
    for (const sep of separators) {
        if (gameString.includes(sep)) {
            const parts = gameString.split(sep);
            return {
                team1: parts[0].trim(),
                team2: parts[1].trim(),
                logo1: getTeamLogo(parts[0].trim()),
                logo2: getTeamLogo(parts[1].trim())
            };
        }
    }
    
    return {
        team1: gameString,
        team2: '',
        logo1: null,
        logo2: null
    };
}

// Export
window.TeamLogos = {
    getTeamLogo,
    parseTeamsFromGame,
    TEAM_LOGOS
};
