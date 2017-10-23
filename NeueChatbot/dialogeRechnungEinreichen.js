var builder = require('botbuilder');
var fetchUrl = require("fetch").fetchUrl;

module.exports = {
    Step1Login: function (session, args, next) {
        builder.Prompts.choice(session, "Sie müssen sich zuerst einloggen, um Ihre Rechnung hochzuladen. Bitte wählen Sie einen Testbenutzer aus?", "Lukas|Hans|Barbara", { listStyle: builder.ListStyle.button });
    },
    Step2RechnungHochladen: function(session, results) {
        session.conversationData['Username'] = results.response.entity;

        var restURL = "http://chatbotsandbox.getsandbox.com/v1.0/product/" + session.conversationData['Username'];

        fetchUrl(restURL, function (error, meta, body) {
            var obj = JSON.parse(body);

            session.conversationData['UserInsureType'] = String(obj.type);
            session.conversationData['UserProductType'] = String(obj.product);
            session.conversationData['UserDiscount'] = String(obj.discount);

            builder.Prompts.attachment(session, "Hallo " + session.conversationData['Username'] + "! Die Rechnung fürs Fitness kann direkt hier im Chat postet werden, wir werden diese dann umgehend bearbeiten");
        });
    }
}



