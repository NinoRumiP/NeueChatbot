var builder = require('botbuilder');
var fetch = require('node-fetch');
var querystring = require('querystring');

module.exports = {

    suche: function (session, args, next) {
        var loc = "";
        var entityList = builder.EntityRecognizer.findEntity(args.entities, 'LocList');
        var entitySimple = builder.EntityRecognizer.findEntity(args.entities, 'Location');

        if (entityList) {
            loc = entityList.resolution.values[0];
        } else if (entitySimple) {
            loc = entitySimple.entity;
        } else {
            session.endDialog('Ich habe leider nicht verstanden wo sie ein Fitness Center suchen');
            return;
        }

        var sendMsg = function (fCenters) {
            if (fCenters && fCenters.length > 0) {
                var fitnessCenterListeResponseChat = 'Ich habe folgende Fitness Center für dich gefunden: \n\r';
                for (let fCenter of fCenters) {
                    fitnessCenterListeResponseChat += "* " + fCenter.name + ", " + fCenter.website + "\r\n";
                }
                session.endDialog(fitnessCenterListeResponseChat);
            } else {
                session.endDialog('Ich habe leider keine Fitness Center gefunden');
            }
        }
      
        fetch(encodeURI('http://35.189.74.56/fCenters/search/findByLocationContainingIgnoreCase?location=' + loc))
            .then(response => response.json())
            .then(data => {
                sendMsg(data._embedded.fCenters);
            }).catch(err => {
                console.error('An error ocurred', err);
            });
    }
}