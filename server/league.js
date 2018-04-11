const axios = require('axios');
const credentials = require('./config');

const getTables = (league, table, goals) => {
  const headers = {
    'X-Auth-Token': credentials.apiKey
  }
  console.log('league ', league);
  for(let i=1; i<=league.currentMatchday; i++) {
    setTimeout(() => {
      console.log('Getting data for Matchday ', i);
      axios.get(`http://api.football-data.org/v1/competitions/${league.id}/leagueTable?matchday=${i}`, {headers})
      .then(res => {
        /*
         * The response is sorted by teams with the most points first.
         * Sort them alphabetically.
         */
        res.data.standing.sort((a,b) => {
          return a.teamName.toUpperCase() < b.teamName.toUpperCase() ? -1 : 1
        });

        /*
         * Create a new array to store each week's points table.
         * POINTS ONLY.
        */
        let matchdayTable = [];
        res.data.standing.forEach(team => {
          let temp = {
            team: team.teamName,
            crest: team.crestURI,
            points: team.points
          }
          matchdayTable.push(temp);
        });
        table[res.data.matchday] = matchdayTable;

        /*
         * Create a new array to store each week's goals scored/conceded.
         * GOALS ONLY.
        */
        matchdayTable = [];
        var avgGoalsScored = 0;
        var avgGoalsConceded = 0;
        res.data.standing.forEach(team => {
          avgGoalsScored += team.goals;
          avgGoalsConceded += team.goalsAgainst;
          let temp = {
            team: team.teamName,
            crest: team.crestURI,
            goalsScored: team.goals,
            goalsConceded: team.goalsAgainst,
          }
          matchdayTable.push(temp);
        });
        goals[res.data.matchday] = {
          table: matchdayTable,
          avgGoalsScored: avgGoalsScored/20,
          avgGoalsConceded: avgGoalsConceded/20
        }

      })
      .catch(err => {
        console.log('**************************************');
        console.log('ERROR GETTING THE PREMIER LEAGUE TABLE');
        console.log(err);
        console.log('**************************************');
      });
    }, i*5000);
  }
}

module.exports = {
  getTables
}