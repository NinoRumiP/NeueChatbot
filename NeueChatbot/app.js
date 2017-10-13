// This loads the environment variables from the .env file
require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
var Promise = require('bluebird');
var request = require('request-promise').defaults({ encoding: null });
var dialogeLeistung = require('./dialogeLeistung');
var dialogeRechnungEinreichen = require('./dialogeRechnungEinreichen');
var dialogSuche = require('./dialogSuche');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
// Create connector and listen for messages
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function (session) {
    var msg = session.message;
    if (msg.attachments.length) {

        // Message with attachment, proceed to download it.
        // Skype & MS Teams attachment URLs are secured by a JwtToken, so we need to pass the token from our bot.
        var attachment = msg.attachments[0];
        var fileDownload = checkRequiresToken(msg)
            ? requestWithToken(attachment.contentUrl)
            : request(attachment.contentUrl);

        fileDownload.then(
            function (response) {

                // Send reply with attachment type & size
                var reply = new builder.Message(session)
                    .text('Rechnung von Fitness Abo vom Typ %s bekommen. Wir werden diese bearbeiten und uns bei dir melden', attachment.contentType, response.length);
                session.send(reply);

            }).catch(function (err) {
                console.log('Error downloading attachment:', { statusCode: err.statusCode, message: err.response.statusMessage });
            });
    } else {
        session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
    }
});

// You can provide your own model by specifing the 'LUIS_MODEL_URL' environment variable
// This Url can be obtained by uploading or creating your model from the LUIS portal: https://www.luis.ai/
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

// Intent Help
bot.dialog('Help', function (session) {
    session.endDialog('Hi! Wie kann ich dir helfen?');
}).triggerAction({
    matches: 'Help'
});

// Intent Leistungsabfrage
bot.dialog('Leistungsabfrage', [dialogeLeistung.leistungsabfrage, dialogeLeistung.Versicherungstyp]).triggerAction({
    matches: 'Leistungsabfrage'
});

// Intent Leistungsabfrage. Dialog FitnessZentrumFragen
bot.dialog('FitnessZentrumFragen', dialogeLeistung.FitnessZentrumFragen);

// Intent FitnessSuche
bot.dialog('FitnessSuche', dialogSuche.suche).triggerAction({
    matches: 'FitnessSuche'
});

// Intent RechnungEinReichen
bot.dialog('RechnungEinReichen', dialogeRechnungEinreichen.rechnungEinreichen).triggerAction({
    matches: 'RechnungEinReichen'
});


// Request file with Authentication Header
var requestWithToken = function (url) {
    return obtainToken().then(function (token) {
        return request({
            url: url,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/octet-stream'
            }
        });
    });
};

// Promise for obtaining JWT Token (requested once)
var obtainToken = Promise.promisify(connector.getAccessToken.bind(connector));

var checkRequiresToken = function (message) {
    return message.source === 'skype' || message.source === 'msteams';
};