var builder = require('botbuilder');

module.exports = {
    Statusabfrage: function (session, args, next) {
        session.send('Vielen Dank für Ihre Anfrage. Ich werde Ihre Anfrage an Agenten weiterleiten!');
        session.endDialog();
    }
}