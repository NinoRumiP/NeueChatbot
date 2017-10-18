
var builder = require('botbuilder');

var fetchUrl = require("fetch").fetchUrl;

var querystring = require('querystring');

module.exports = {
    Leistungsabfrage: function (session, args, next) {
        var fitnessCenterEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'FitnessCenterList');

        if (fitnessCenterEntity) {
            session.conversationData['FitnessCenter'] = fitnessCenterEntity.resolution.values[0];
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
                session.conversationData['FitnessCenter'] = results.response;
            }

            session.beginDialog('Versicherungstyp');
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

function checkCertAndInsure(session) {
    var restURL = "http://35.189.74.56/fCenters/search/findByName?name=" + querystring.escape(session.conversationData['FitnessCenter']);

    fetchUrl(restURL, function (error, meta, body) {
        var obj = JSON.parse(body);

        if (obj._embedded.fCenters.length == 0) {
            session.send("Tut mir leid! Ihr Fitnessabo wird nicht bezahlt, weil Ihr Fitnesszentrum nicht zertifziert ist.");
        } else if (session.conversationData['UserInsureType'] == 'Grundversicherung') {
            session.send("Tut mir leid! Ihr Fitnessabo wird nicht bezahlt, weil Sie keine Zusatzversicherung haben");
        } else if (session.conversationData['UserProductType'] == 'Balance' || session.conversationData['UserProductType'] == 'Premium') {
            session.send("Wir übernehmen " + session.conversationData['UserDiscount'] + " CHF pro Kalenderjahr für Ihr Fitnessabo");
        } else {
            session.send("Wir übernehmen ein Teil von Ihrem Fitnessabo");
        }
    });
}

function checkCert(session) {
    var restURL = "http://35.189.74.56/fCenters/search/findByName?name=" + querystring.escape(session.conversationData['FitnessCenter']);

    fetchUrl(restURL, function (error, meta, body) {
        var obj = JSON.parse(body);

        if (obj._embedded.fCenters.length == 0) {
            session.send("Tut mir leid! Ihr Fitnessabo wird nicht bezahlt, weil Ihr Fitnesszentrum " + session.conversationData['FitnessCenter'] + " nicht zertifziert ist.");
            session.endDialog();
        } else {
            session.beginDialog('Versicherungstyp');
        }
    });
}

