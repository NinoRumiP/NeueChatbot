
var builder = require('botbuilder');
var fetch = require("fetch").fetch;



module.exports = {

    suche: function (session, args, next) {
        // try extracting entities
        var locationEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Location');

        var sendMsg =  function (s, i, o) {
            session.send('%s, %s', s.name, s.url);
        }

        fetch('http://chatbotsandbox.getsandbox.com/v1.0/fitnesses/')
            .then(response => response.json())
            .then(data => {
                data.forEach(sendMsg);
                }).catch(err => {
                console.error('An error ocurred', err);
            });

        session.endDialog('Wo möchten Sie ein Fitnessabo abschliessen' + locationEntity.entity.text);
    }
}