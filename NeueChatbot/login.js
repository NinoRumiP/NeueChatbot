var builder = require('botbuilder');
var fetchUrl = require("fetch").fetchUrl;

module.exports = {
    Login: [
        function (session, args, next) {
            builder.Prompts.choice(session, "Wählen Sie einen Testbenutzer aus", "Lukas|Hans|Barbara", { listStyle: builder.ListStyle.button });
        },
        function (session, results) {
            session.conversationData['Username'] = results.response.entity;


            var restURL = "http://chatbotsandbox.getsandbox.com/v1.0/product/" + session.conversationData['Username'];

            fetchUrl(restURL, function (error, meta, body) {
                var obj = JSON.parse(body);

                session.conversationData['UserInsureType'] = String(obj.type);
                session.conversationData['UserProductType'] = String(obj.product);
                session.conversationData['UserDiscount'] = String(obj.discount);

                session.endDialog("Hallo " + session.conversationData['Username'] + "! Du hast " + String(obj.type) + " und das Produkt " + String(obj.product));
            });
        }
    ]
}