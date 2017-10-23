// This loads the environment variables from the .env file
require('dotenv-extended').load();

var request = require('request-promise').defaults({ encoding: null });
var builder = require('botbuilder');
var restify = require('restify');
var Promise = require('bluebird');
var fs = require("fs");
var dialogeLeistung = require('./dialogeLeistung');
var dialogeRechnungEinreichen = require('./dialogeRechnungEinreichen');
var dialogeStatusabfrage = require('./dialogeStatusabfrage');
var dialogSuche = require('./dialogSuche');
var login = require('./login');
var fetchUrl = require("fetch").fetchUrl;

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

server.get('/', respond);

function respond(req, res, next) {
    fs.readFile("./default.htm", function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        res.end();
    });
    next();
}

const intents = new builder.IntentDialog({
    recognizers: [
        new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/38cf11ae-17f5-474e-ade7-6bd911c6135d?subscription-key=70686d23fae0437c8c214d8ec23c6d62&timezoneOffset=0&verbose=true&q=')
    ]
});

var bot = new builder.UniversalBot(connector, {
    localizerSettings: {
        defaultLocale: "de"
    }
});

intents.matches('Hello', 'Hello');
intents.matches('Leistungsabfrage', 'Leistungsabfrage');
intents.matches('Help', 'Help');
intents.matches('FitnessSuche', 'FitnessSuche');
intents.matches('RechnungEinReichen', 'RechnungEinReichen');
intents.matches('Statusabfrage', 'Statusabfrage');

// Root Dialog
bot.dialog('/', intents);

// Login
bot.dialog(
    'Login', login.Login
).triggerAction({
    matches: /^Login$/i
});

// Intent Help
bot.dialog('Help', function (session) {
    session.endDialog('Ich kann abklären ob du für dein Fitness Abo Geld von uns zugute hast. Frage einfach ob du für dein Fintess etwas bezahlt bekommst. Wenn du ein neues Fitness suchst kann ich dir auch dabei helfen. Wenn du dann von uns Geld zugute hast, kannst du direkt hier im Chat die Rechnung hochladen');
}).triggerAction({
    matches: 'Help'
 });

// Intent Hello
bot.dialog('Hello', function (session) {
    session.endDialog('Hallo, ich bin der CSS Fitness Center Bot, ich beantworte dir alle Fragen zum Thema zuschuss zum Fitness Abo, für mehr Infos tippe Hilfe');
});

// Intent Statusabfrage
bot.dialog('Statusabfrage',
    dialogeStatusabfrage.Statusabfrage
).beginDialogAction({
    matches: 'Statusabfrage'
});

// Intent Leistungsabfrage
bot.dialog('Leistungsabfrage',
    dialogeLeistung.Leistungsabfrage
).beginDialogAction({
    matches: 'Leistungsabfrage'
});

// Intent Leistungsabfrage. Dialog FitnessZentrumFragen
bot.dialog('FitnessZentrumFragen', dialogeLeistung.FitnessZentrumFragen);

// Intent Leistungsabfrage. Dialog Versicherungstyp
bot.dialog('Versicherungstyp', dialogeLeistung.Versicherungstyp);

// Intent FitnessSuche
bot.dialog(
    'FitnessSuche', dialogSuche.suche
).beginDialogAction({
    matches: 'FitnessSuche'
});

// Intent RechnungEinReichen
bot.dialog(
    'RechnungEinReichen', dialogeRechnungEinreichen.rechnungEinreichen
).beginDialogAction({
    matches: 'RechnungEinReichen'
});

bot.dialog('RechnungVerarbeiten', [
    function (session) {
        builder.Prompts.attachment(session, 'Sie können die Rechnung fürs Fitnes direkt hier im Chat posten, wir werden diese dann umgehend bearbeiten');
    },
    function (session, results) {
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
                        .text('Rechnung von Fitness Abo vom Typ %s bekommen. Wir werden diese bearbeiten und uns bei dir melden', attachment.contentType);
                    session.send(reply);

                    session.endDialog();

                }).catch(function (err) {
                    console.log('Error downloading attachment:', { statusCode: err.statusCode, message: err.response.statusMessage });
                });
        } else {
            session.send('Sorry, ich verstehe \'%s\'. Tippe \'Hilfe\' wenn du weitere Infos willst.', session.message.text);
        }

        session.endDialog();
    }
]);

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



