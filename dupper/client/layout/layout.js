GitPrjs = new Mongo.Collection("gitPrj");

//Arguments for get repos
gitToken = "token ";
gitApi = "https://api.github.com/";
gitRepo = gitApi + "user/repos";

Meteor.subscribe("gitPrj");

/* update the  cfg*/
var prjIndex = 0;
var cfgDep = new Deps.Dependency;
var setPrjIndex = function (index) {
    prjIndex = index;
    cfgDep.changed();
}
var getPrjIndex = function () {
    cfgDep.depend();
    return prjIndex;
}

Template.layout.helpers({
    /* update the droplist  */
    gitPrjNames: function () {
        Meteor.call("getUserRepo", Meteor.userId(), function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                Session.set("currRepo", result);
            }
        });

        var prjs = Session.get("currRepo");

        //set the index so the cfg files will be updated as well
        setPrjIndex(0);

        return prjs;
    },


    dockerCfg: function () {
        var index = getPrjIndex();

        prjs = GitPrjs.findOne({
            "owner": Meteor.userId()
        }).gitPrjs;

        return prjs[index].cfg.docker;
    },

    buildCfg: function () {
        var index = getPrjIndex();

        prjs = GitPrjs.findOne({
            "owner": Meteor.userId()
        }).gitPrjs;

        return prjs[index].cfg.build;
    }

});

Template.layout.events({
    /* form submit */
    'submit .config-form': function (event) {
        var cfg = event.target;
        Meteor.call("setPrjCfg", Meteor.userId(), cfg.gitPrjs.value, cfg.dockerConfig.value, cfg.buildConfig.value, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
            }
        });
        alert("updated!");
        return false;
    },

    /* droplist changed */
    'change .gitPrjs': function (event) {
        setPrjIndex($(".gitPrjs").prop('selectedIndex'));
        return;
    }
});

// This the stub, real function is in server side
Meteor.methods({
    /*API to get the git projects from the User's Repo*/
    getUserRepo: function (id) {
        // fetch the user's repo from github.com
        var user = Meteor.users.find({
            _id: id
        }).fetch();

        var repo = HTTP.call("GET", gitRepo, {
            headers: {
                "User-Agent": "curl/7.43.0",
                "Authorization": gitToken + user[0].services.github.accessToken
            }
        }).data;

        var obj = {};
        if (GitPrjs.find({
                owner: id
            }).count() == 0) {
            // add new entry
            obj.owner = id;
            obj.gitPrjs = [];
            for (var i = 0; i < repo.length; i++) {
                obj.gitPrjs[i] = {
                    name: "",
                    url: ""
                };
                obj.gitPrjs[i].name = repo[i].name;
                obj.gitPrjs[i].url = repo[i].url;
            }
            GitPrjs.insert(obj);
        } else {
            //update the docment
            obj.gitPrjs = [];
            for (var i = 0; i < repo.length; i++) {
                obj.gitPrjs[i] = {
                    name: "",
                    url: ""
                };
                obj.gitPrjs[i].name = repo[i].name;
                obj.gitPrjs[i].url = repo[i].url;
            }

            GitPrjs.update({
                owner: id
            }, {
                $set: {
                    gitPrjs: obj.gitPrjs
                }
            })
        }

        return GitPrjs.findOne({
            owner: id
        }).gitPrjs;
    },

    setPrjCfg: function (id, prjName, prjDockerCfg, prjBuildCfg) {
        GitPrjs.update({
            "owner": id,
            "gitPrjs.name": prjName
        }, {
            $set: {
                "gitPrjs.$.cfg.docker": prjDockerCfg,
                "gitPrjs.$.cfg.build": prjBuildCfg
            }
        });
    }
});
