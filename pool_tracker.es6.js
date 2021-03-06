Players = new Meteor.Collection("players");
Teams   = new Meteor.Collection("teams");

if (Meteor.isClient) {

  Template.leaderboard.players = function () {
    return Players.find({}, { sort: { score: -1, name: 1 }});
  };

  Template.player.teams = function () {
    return Teams.find({ _id: { $in: this.teams }}, { sort: { pick_order: 1 }});
  };

  Template.player.name_stylized = function () {
    if (this.handicap > 0) {
      return this.name + " *";
    } else {
      return this.name;
    }
  };

  Template.updateTime.time = function () {
    let team = Teams.findOne({});
    if (team) {
      return new Date(team.updated_at).toDateString();
    }
  };
}
