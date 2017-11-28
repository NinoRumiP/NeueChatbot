var builder = require('botbuilder');

module.exports = {
    Statusabfrage: function (session, args, next) {
        if (session.conversationData['UploadStatus'] == 'upload') {
            session.send('Vielen Dank für Ihre Anfrage. Ihre Rechnung wurde hochgeladen und wird in den nächsten 2 Tagen von unseren Agenten bearbeitet.');
        } else {
            session.send('Vielen Dank für Ihre Anfrage. Wir haben noch keine Rechnung von ihnen erhalten, bitte laden sie doch eine Rechnung hoch.');
        }
        session.endDialog();
    }
}