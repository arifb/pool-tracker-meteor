// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");
Teams = new Meteor.Collection("teams");

if (Meteor.isClient) {
  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };
  /*
  Template.leaderboard.teams = function () {
    return Teams.find({});
  };
  Template.leaderboard.players.helpers({
    teams: function () {
      console.log('hello');
    }
  });
  */
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
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
        "Nets", "Rockets", "Lakers", "Trailblazers", "Jazz", "Bucks",
        "Clippers", "Pacers", "Timberwolves", "Cavaliers", "Celtics", "Magic"];
      for (var i = 0; i < cities.length; i++) {
        Teams.insert({city: cities[i], nick: nicks[i], wins: 0, losses: 0, differential: 0});
      }
    }

    if (Players.find().count() == 0) {
      var names = ["Josh", "Andrew", "Jamie", "Arif", "Steve"];
      var picked_teams = [["Heat", "Knicks", "Grizzlies", "Wizards", "Pelicans", "Suns"],
        ["Thunder", "Warriors", "Nuggets", "Pistons", "Raptors", "76ers"],
        ["Bulls", "Spurs", "Mavericks", "Hawks", "Kings", "Bobcats"],
        ["Nets", "Rockets", "Lakers", "Trailblazers", "Jazz", "Bucks"],
        ["Clippers", "Pacers", "Timberwolves", "Cavaliers", "Celtics", "Magic"]];
    
      for (var i = 0; i < names.length; i++) {
        Players.insert({name: names[i], teams: picked_teams[i], score: 0});
      }
    }

  });
  
  Meteor.setInterval(function () {
    Meteor.http.get("https://erikberg.com/nba/standings.json", function(error, result) {
      if (result.statusCode == 200) {
        res = JSON.parse(result.content);
        for (var i = 0; i < res.standing.length; i++) {
          var team = res['standing'][i];
          Teams.update({nick: team['last_name']}, {$set: {wins: team['won'], losses: team['lost'], differential: (team['won'] - team['lost'])}});
        }
        Players.find().forEach(function (player) {
          var score = 0;
          for (var i = 0; i < player.teams.length; i++) {
            score += Teams.findOne({nick: player.teams[i]}).differential
          }
          Players.update({_id: player._id}, {$set: {score: score}});
        });
      } else {
        //error handling
      }
    });
  }, 60000);

}
