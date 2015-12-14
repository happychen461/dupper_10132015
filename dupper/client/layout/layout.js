GitPrjCfgs = new Mongo.Collection("gitPrjCfg");

if (Meteor.isClient) {

  Template.body.events({
      'submit .config-form':function(event){
          var cfg = event.target;
          alert(cfg.gitPrjs.value);
          alert(cfg.dockerConfig.value);
          alert(cfg.buildConfig.value);
          alert(Meteor.userId());

          GitPrjCfgs.insert({
              gitPrjName: cfg.gitPrjs.value,
              dockerCfg: cfg.dockerConfig.value,
              buildCfg: cfg.buildConfig.value,
              owner: Meteor.userId()
          });

          alert("good");
          return false;
      },
      'change .gitPrjs': function(event,tmpl){
          Session.set('gitPrjName',tmpl.find('.gitPrjs').value);
      }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
