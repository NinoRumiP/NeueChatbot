
var builder = require('botbuilder');

module.exports = {
    help: function (session) {
        session.endDialog('Hi! Wie kann ich dir helfen?');
    },    

    leistungsabfrage: function (session, args, next) {
        // try extracting entities
        var fitnessCenterEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'FitnessCenter');

        var answer = "Wo möchten Sie ein Fitnessabo abschliessen";

        answer += fitnessCenterEntity.entity.toString();

        session.endDialog(answer.toString());
    }
}