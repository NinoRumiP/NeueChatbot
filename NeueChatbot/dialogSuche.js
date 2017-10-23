var builder = require('botbuilder');
var fetch = require('node-fetch');

module.exports = {

    suche: function (session, args, next) {
        // try extracting entities
        var locationEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'LocList');
        if (!locationEntity) {
            locationEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Location');
        }
        var sendMsg =  function (s, i, o) {
            session.send('%s, %s', s.name, s.website);
        }
        if (locationEntity) {
            fetch('http://35.189.74.56/fCenters/search/findByLocationContainingIgnoreCase?location=' + locationEntity.entity.toString())
                .then(response => response.json())
                .then(data => {
                    data._embedded.fCenters.forEach(sendMsg);
                }).catch(err => {
                    console.error('An error ocurred', err);
                });
        } else {
            session.endDialog('Ich habe leider nicht verstanden wo sie ein Fitness Center suchen');
        } 
    }
}