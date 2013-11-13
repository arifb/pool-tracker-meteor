// On server startup, create players, teams if the database is empty.
Meteor.startup(function () {

  if (Teams.find().count() == 0) {
    var cities = ["Miami", "New York", "Memphis", "Washington", "New Orleans", "Phoenix",
      "Oklahoma City", "Golden State", "Denver", "Detroit", "Toronto", "Philadelphia",
      "Chicago", "San Antonio", "Dallas", "Atlanta", "Sacramento", "Charlotte",
      "Brooklyn", "Houston", "Los Angeles", "Portland", "Utah", "Milwaukee",
      "Los Angeles", "Indiana", "Minnesota", "Cleveland", "Boston", "Orlando"];
    var nicks = ["Heat", "Knicks", "Grizzlies", "Wizards", "Pelicans", "Suns",
      "Thunder", "Warriors", "Nuggets", "Pistons", "Raptors", "76ers",
      "Bulls", "Spurs", "Mavericks", "Hawks", "Kings", "Bobcats",
      "Nets", "Rockets", "Lakers", "Trail Blazers", "Jazz", "Bucks",
      "Clippers", "Pacers", "Timberwolves", "Cavaliers", "Celtics", "Magic"];

    for (var i = 0; i < cities.length; i++) {
      Teams.insert({ city: cities[i], nick: nicks[i], wins: 0, losses: 0, differential: 0, updated_at: '', created_at: Date.now() });
    }
  }

  if (Players.find().count() == 0) {
    var names = ["Josh", "Andrew", "Jamie", "Arif", "Steve"];
    var picked_teams = [["Heat", "Knicks", "Grizzlies", "Wizards", "Pelicans", "Suns"],
      ["Thunder", "Warriors", "Nuggets", "Pistons", "Raptors", "76ers"],
      ["Bulls", "Spurs", "Mavericks", "Hawks", "Kings", "Bobcats"],
      ["Nets", "Rockets", "Lakers", "Trail Blazers", "Jazz", "Bucks"],
      ["Clippers", "Pacers", "Timberwolves", "Cavaliers", "Celtics", "Magic"]];
    for (var i = 0; i < names.length; i++) {
      var p = Players.insert({ name: names[i], differential: 0, score: 0, teams: [] });
      for (var j = 0; j < picked_teams[i].length; j++) {
        var t = Teams.findOne({ nick: picked_teams[i][j] }); 
        Players.update({ _id: p }, { $push: { teams: t._id } });
      }
    }
  }

});

Meteor.setInterval(function () {
  Meteor.http.get("https://erikberg.com/nba/standings.json", { "headers" : { "User-Agent" : "Leaderboard/1.0 (arif.public@gmail.com" }},  function(error, result) {
    if (result.statusCode == 200) {
      res = JSON.parse(result.content);
      for (var i = 0; i < res.standing.length; i++) {
        var team = res['standing'][i];
        Teams.update({ nick: team['last_name'] }, { $set: { wins: team['won'], losses: team['lost'], differential: (team['won'] - team['lost']), updated_at: res['standings_date'] } });
      }
      Players.find().forEach(function (player) {
        var differential = 0;
        for (var i = 0; i < player.teams.length; i++) {
          differential += Teams.findOne({ _id: player.teams[i] }).differential
        }
        Players.update({ _id: player._id }, { $set: { differential: differential, score: differential * 5 } });
      });
    } else {
      //error handling
    }
  });
}, 5000);
