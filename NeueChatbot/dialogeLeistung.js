
var builder = require('botbuilder');

var fetchUrl = require("fetch").fetchUrl;

module.exports = {

    leistungsabfrage: function (session, args, next) {
        // try extracting entities
        var fitnessCenterEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'FitnessCenter');

        console.log('Fitness Leistung abfragen');

        if (fitnessCenterEntity) {
            session.conversationData['FitnessCenter'] = fitnessCenterEntity.entity;

            var urlFitness = "http://chatbotsandbox.getsandbox.com/v1.0/fitnesses/" + fitnessCenterEntity.entity.toString();

            console.log(urlFitness.toString());

            fetchUrl(urlFitness, function (error, meta, body) {
                console.log(body.toString());
                var obj = JSON.parse(body);
                console.log(obj.certified);

                if (!!JSON.parse(String(obj.certified).toLowerCase())) {
                    session.dialogData.searchType = 'FitnessCenter';
                    builder.Prompts.text(session, 'Ihr Fitnesszentrum ist zertifiziert');

                } else {
                    // no entities detected, ask user for a destination
                    builder.Prompts.text(session, 'Ihr Fitnesszentrum ist leider nicht zertifiziert');
                }
            });
        } else {
            console.log('Fitness Zentrum wird nicht identifiziert');

            session.beginDialog('FitnessZentrumFragen');
        }
    },

    FitnessZentrumFragen: [
        function (session) {
            builder.Prompts.text(session, "Wo ist Ihr Fitnesszentrum (z.B. Migro Fitnesspark)");
        },
        function (session, results) {
            if (!results.response) {
                session.conversationData['FitnessCenter'] = results.response;
            }

            session.endDialogWithResult(results);
        }
    ],

    Versicherungstyp: function (session) {
        session.endDialog('Welche Versicherung hast du?');
    }
}