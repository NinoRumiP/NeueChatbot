
var builder = require('botbuilder');

module.exports = {

    suche: function (session, args, next) {
        // try extracting entities
        var locationEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Location');

        fetch('/api/rest/abc')
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(err => {
                console.error('An error ocurred', err);
            });

        session.endDialog('Wo möchten Sie ein Fitnessabo abschliessen' + locationEntity.entity.text);
    }
}