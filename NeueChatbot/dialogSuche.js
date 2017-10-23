var builder = require('botbuilder');
var fetch = require('node-fetch');

module.exports = {

    suche: function (session, args, next) {
        // try extracting entities
        var locationEntity = builder.EntityRecognizer.findEntity(args.entities, 'LocList');
        if (!locationEntity) {
            locationEntity = builder.EntityRecognizer.findEntity(args.entities, 'Location');
        }
        var sendMsg = function (fCenters) {
            var fitnessCenterListeResponseChat = 'Ich habe folgende Fitness Center für dich gefunden: \n\r';
            for (let fCenter of fCenters) {
                fitnessCenterListeResponseChat += "* " + fCenter.name + ", " + fCenter.website + "\r\n";
            }
            session.send(fitnessCenterListeResponseChat);
        }
        if (locationEntity) {
            fetch('http://35.189.74.56/fCenters/search/findByLocationContainingIgnoreCase?location=' + locationEntity.entity.toString())
                .then(response => response.json())
                .then(data => {
                    sendMsg(data._embedded.fCenters);
                }).catch(err => {
                    console.error('An error ocurred', err);
                });
        } else {
            session.endDialog('Ich habe leider nicht verstanden wo sie ein Fitness Center suchen');
        } 
    }
}