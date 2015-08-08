// On server startup, create players, teams if the database is empty.
Meteor.startup(function () {

  if (Teams.find().count() == 0) {
    const cities = ["Miami", "New York", "Memphis", "Washington", "New Orleans", "Phoenix",
      "Oklahoma City", "Golden State", "Denver", "Detroit", "Toronto", "Philadelphia",
      "Chicago", "San Antonio", "Dallas", "Atlanta", "Sacramento", "Charlotte",
      "Brooklyn", "Houston", "Los Angeles", "Portland", "Utah", "Milwaukee",
      "Los Angeles", "Indiana", "Minnesota", "Cleveland", "Boston", "Orlando"];
    const nicks = ["Heat", "Knicks", "Grizzlies", "Wizards", "Pelicans", "Suns",
      "Thunder", "Warriors", "Nuggets", "Pistons", "Raptors", "76ers",
      "Bulls", "Spurs", "Mavericks", "Hawks", "Kings", "Bobcats",
      "Nets", "Rockets", "Lakers", "Trail Blazers", "Jazz", "Bucks",
      "Clippers", "Pacers", "Timberwolves", "Cavaliers", "Celtics", "Magic"];

    for (let i = 0; i < cities.length; i++) {
      Teams.insert({ city: cities[i], 
                     nick: nicks[i], 
                     wins: 0, 
                     losses: 0, 
                     differential: 0, 
                     updated_at: '', 
                     pick_order: i});
    }
  }

  if (Players.find().count() == 0) {
    const names        = ["Josh", "Andrew", "Jamie", "Arif", "Steve"];
    const handicaps    = [100, 0, 0, 0, 0];
    const picked_teams = [["Heat", "Knicks", "Grizzlies", "Wizards", "Pelicans", "Suns"],
      ["Thunder", "Warriors", "Nuggets", "Pistons", "Raptors", "76ers"],
      ["Bulls", "Spurs", "Mavericks", "Hawks", "Kings", "Bobcats"],
      ["Nets", "Rockets", "Lakers", "Trail Blazers", "Jazz", "Bucks"],
      ["Clippers", "Pacers", "Timberwolves", "Cavaliers", "Celtics", "Magic"]];
    for (let i = 0; i < names.length; i++) {
      let p = Players.insert({ name: names[i], handicap: handicaps[i], differential: 0, score: 0, teams: [] });
      for (let j = 0; j < picked_teams[i].length; j++) {
        let t = Teams.findOne({ nick: picked_teams[i][j] }); 
        Players.update({ _id: p }, { $push: { teams: t._id } });
      }
    }
  }

});

Meteor.setInterval(function () {
  console.log('ping');
  Meteor.http.get("https://erikberg.com/nba/standings.json", { "headers" : { "User-Agent" : "Leaderboard/1.0 (arif.public@gmail.com" }},  function(error, result) {
    if (result.statusCode == 200) {
      res = JSON.parse(result.content);

      for (let i = 0; i < res.standing.length; i++) {
        let team = res['standing'][i];
        console.log(res['standings_date']);
        Teams.update({ nick: team['last_name'] }, { $set: { wins: team['won'], losses: team['lost'], differential: (team['won'] - team['lost']), updated_at: res['standings_date'] } });
      }

      Players.find().forEach(function (player) {
        let differential = 0;
        let t            = Teams.findOne({});
        let games_played = t.wins + t.losses;
        for (let i = 0; i < player.teams.length; i++) {
          differential += Teams.findOne({ _id: player.teams[i] }).differential
        }
        Players.update({ _id: player._id }, { $set: { differential: differential, score: Math.ceil((differential * 5) - (player.handicap / 82 * games_played)) } });
      });
    } else {
      //error handling
      console.log(result.statusCode)
    }
  });
}, 60000);
