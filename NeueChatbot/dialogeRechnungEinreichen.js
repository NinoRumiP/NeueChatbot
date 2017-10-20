var builder = require('botbuilder');
var request = require('request-promise').defaults({ encoding: null });

module.exports = {
    rechnungEinreichen: function (session, args, next) {
         session.beginDialog('RechnungVerarbeiten');
    }
}



