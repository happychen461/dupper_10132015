GitPrjs = new Mongo.Collection("gitPrj");

//Arguments for get repos
gitToken = "token ";
gitApi = "https://api.github.com/";
gitRepo = gitApi + "user/repos";


Meteor.publish("gitPrj", function () {

    return GitPrjs.find({
        owner: this.userId
    });
});

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
            /*
            obj.gitPrjs = [];
            for (var i = 0; i < repo.length; i++) {
                obj.gitPrjs[i] = {
                    name: "",
                    url: "",
                    cfg:
                };
                obj.gitPrjs[i].name = repo[i].name;
                obj.gitPrjs[i].url = repo[i].url;
                obj.git
            }

            GitPrjs.update({
                owner: id
            }, {
                $set: {
                    gitPrjs: obj.gitPrjs
                }
            })
            */
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
