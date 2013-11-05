Players = new Meteor.Collection("players");
Teams = new Meteor.Collection("teams");

if (Meteor.isClient) {

  Template.leaderboard.players = function () {
    return Players.find({}, { sort: { score: -1, name: 1}});
  };

  Template.player.teams = function () {
    return Teams.find({ _id: { $in: this.teams }});
  };

  Template.updateTime.time = function () {
    var team = Teams.findOne({});
    if (team) {
      return new Date(team.updated_at).toDateString();
    }
  };
}

if (Meteor.isServer) {
}
