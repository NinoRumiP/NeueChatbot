var builder = require('botbuilder');
var fetchUrl = require("fetch").fetchUrl;
var querystring = require('querystring');

module.exports = {
    Leistungsabfrage: function (session, args, next) {
        var entityList = builder.EntityRecognizer.findEntity(args.intent.entities, 'FitnessCenterList');  // Not machine learned
        var entitySimple = builder.EntityRecognizer.findEntity(args.intent.entities, 'FitnessCenter'); // Machine learned

        if (entityList) {
            session.conversationData['FitnessCenter'] = entityList.resolution.values[0];
            checkCertAndInsure(session)
        } else if (entitySimple) {
            session.conversationData['FitnessCenter'] = entitySimple.entity;
            checkCertAndInsure(session)
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
                session.conversationData['FitnessCenter'] = results.response;
                extractEntity(session);
            }
        }
    ],

    Versicherungstyp: [
        function (session, args, next) {
            if (typeof session.conversationData['Username'] == "undefined") {
                builder.Prompts.choice(session, "Welche Versicherungsprodukte hast du?", "Grundversicherung|Zusatzversicherung", { listStyle: builder.ListStyle.button });
            } else {
                checkCertAndInsure(session)
            }
        },
        function (session, results) {
            session.conversationData['UserInsureType'] = results.response.entity;
            checkCertAndInsure(session)
            session.endDialog();
        }
    ]
}

function extractEntity(session) {
    var luisURL = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/38cf11ae-17f5-474e-ade7-6bd911c6135d?subscription-key=70686d23fae0437c8c214d8ec23c6d62&timezoneOffset=0&verbose=true&q=" + "Bezahlt ihr mein abo von " + querystring.escape(session.conversationData['FitnessCenter']);

    fetchUrl(luisURL, function (error, meta, body) {
        var obj = JSON.parse(body);

        var entityList = builder.EntityRecognizer.findEntity(obj.entities, 'FitnessCenterList');  // Not machine learned
        var entitySimple = builder.EntityRecognizer.findEntity(obj.entities, 'FitnessCenter'); // Machine learned

        if (entityList) {
            session.conversationData['FitnessCenter'] = entityList.resolution.values[0];
        } else if (entitySimple) {
            session.conversationData['FitnessCenter'] = entitySimple.entity;
        } 

        checkCertAndInsure(session)
    });
}

function checkCertAndInsure(session) {
    var restURL = "http://35.189.74.56/fCenters/search/findByName?name=" + querystring.escape(session.conversationData['FitnessCenter']);

    fetchUrl(restURL, function (error, meta, body) {
        var obj = JSON.parse(body);

        if (obj._embedded.fCenters.length == 0) {
            session.send("Tut mir leid! Ihr Fitnessabo wird nicht bezahlt, weil Ihr Fitnesszentrum " + session.conversationData['FitnessCenter'] + " nicht zertifziert ist.");
        } else if (typeof session.conversationData['UserInsureType'] == 'undefined') {
            session.beginDialog('Versicherungstyp');
        } else if (session.conversationData['UserInsureType'] == 'Grundversicherung') {
            session.send("Tut mir leid! Ihr Fitnessabo wird nicht bezahlt, weil Sie keine Zusatzversicherung haben");
        } else if (session.conversationData['UserProductType'] == 'Balance' || session.conversationData['UserProductType'] == 'Premium') {
            session.send("Wir übernehmen " + session.conversationData['UserDiscount'] + " CHF pro Kalenderjahr für Ihr Fitnessabo");
        } else {
            session.send("Wir übernehmen ein Teil von Ihrem Fitnessabo");
        }
    });
}

