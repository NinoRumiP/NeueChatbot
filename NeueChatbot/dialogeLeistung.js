
var builder = require('botbuilder');

var fetchUrl = require("fetch").fetchUrl;

module.exports = {
    leistungsabfrage: function (session, args, next) {
        var fitnessCenterEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'FitnessCenter');

        if (fitnessCenterEntity) {
            session.conversationData['FitnessCenter'] = fitnessCenterEntity.entity;
            checkCert(session)
        } else {
            session.beginDialog('FitnessZentrumFragen');
        }
    },

    FitnessZentrumFragen: [
        function (session) {
            builder.Prompts.text(session, "Welches ist Ihr Fitnesszentrum");
        },
        function (session, results) {
            if (results.response) {
                session.userData.fitnessCenter = results.response;
                session.conversationData['FitnessCenter'] = results.response;
                session.dialogData.fitnessCenter = results.response;
                session.save();
            }

            session.beginDialog('Versicherungstyp');
        }
    ],

    Versicherungstyp: [
        function (session, args, next) {
            builder.Prompts.choice(session, "Welche Versicherungsprodukte hast du?", "Ohne Zusatzversicherung|Mit Zusatzversicherung", { listStyle: builder.ListStyle.button });
        },
        function (session, results) {
            session.conversationData['Versicherungstyp'] = results.response;

            checkCertAndInsure(session)

            session.endDialogWithResult(results);
        }
    ]
}

function checkCertAndInsure(session) {
    var restURL = "http://chatbotsandbox.getsandbox.com/v1.0/fitnesses/" + session.conversationData['FitnessCenter'];

    console.log(restURL.toString());

    fetchUrl(restURL, function (error, meta, body) {
        console.log(body.toString());
        var obj = JSON.parse(body);
        console.log(obj.certified);

        if (!JSON.parse(String(obj.certified).toLowerCase())) {
            session.send("Tut mir leid! Ihr Fitnessabo wird nicht bezahlt, weil Ihr Fitnesszentrum nicht zertifziert ist.");
        } else if (session.conversationData['Versicherungstyp'].entity == 'Ohne Zusatzversicherung') {
            session.send("Tut mir leid! Ihr Fitnessabo wird nicht bezahlt, weil Sie keine Zusatzversicherung haben");
        } else {
            session.send("Ihr Fitnessabo wird bezahlt!");
        }
    });
}

function checkCert(session) {
    var restURL = "http://chatbotsandbox.getsandbox.com/v1.0/fitnesses/" + session.conversationData['FitnessCenter'];

    console.log(restURL.toString());

    fetchUrl(restURL, function (error, meta, body) {
        console.log(body.toString());
        var obj = JSON.parse(body);
        console.log(obj.certified);

        if (!JSON.parse(String(obj.certified).toLowerCase())) {
            session.send("Tut mir leid! Ihr Fitnessabo wird nicht bezahlt, weil Ihr Fitnesszentrum nicht zertifziert ist.");
            session.endDialog();
        } else {
            session.beginDialog('Versicherungstyp');
        }
    });
}

