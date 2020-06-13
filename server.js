var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var db = require('./db.js');

var app = express();

var env = process.env;

var LISTEN_PORT = env.PORT ? env.PORT : 8080;

//------------------------------------------------------------
// Convert JSON timestamp object to timestamp string
//------------------------------------------------------------
function getTimestampString(timestamp) {

    // use JSON data as it is
    return timestamp;

    var date = new Date(timestamp);
    // These methods are return local time
    var YYYY = date.getFullYear();
    // make zero-padding string
    var MM = ('0' + (date.getMonth() + 1)).slice(-2);
    var DD = ('0' + date.getDate()).slice(-2);
    var hh = ('0' + date.getHours()).slice(-2);
    var mm = ('0' + date.getMinutes()).slice(-2);
    var ss = ('0' + date.getSeconds()).slice(-2);
    var milli = date.getMilliseconds();

    return YYYY + '-' + MM + '-' + DD + 'T' + hh + ':' + mm + ':' + ss + '.' + milli;
}

//------------------------------------------------------------
// convert alert object to string
//------------------------------------------------------------
function formatAlert(alert) {

    return getTimestampString((new Date()).toISOString()) + ' ' +
           '[' + getTimestampString(alert.startsAt) + '] ' + 
           '(' + alert.status + ') ' +
           alert.alertname +
           ': ' +
           alert.severity + 
           ': ' +
           alert.message;
}

//------------------------------------------------------------
// convert alert object (for watchdog) to string
//------------------------------------------------------------
function formatWatchdog(alert) {

    return getTimestampString((new Date()).toISOString()) + ' ' +
           '[' + getTimestampString(alert.startsAt) + '] ' + 
           '(' + alert.status + ') ' +
           alert.alertname;
}

//------------------------------------------------------------
// build alert object from POST message
//------------------------------------------------------------
function buildAlertObject(alertmessage) {
    var alert = {};

    alert.status      = alertmessage.status;
    alert.startsAt    = alertmessage.startsAt;
    alert.fingerprint = alertmessage.fingerprint;
    alert.alertname   = alertmessage.labels.alertname;
    alert.severity    = alertmessage.labels.severity;
    alert.message     = alertmessage.annotations.message;

    return alert;
}

//------------------------------------------------------------
// express setting
//------------------------------------------------------------
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//------------------------------------------------------------
// POST handler for alert webhook
//------------------------------------------------------------
app.post('/webhook/', (req, res) => {
  res.sendStatus(200);

  for (var i in req.body.alerts) {
//  var alert = buildAlertObject(req.body.alerts[i]);
    var incoming = req.body.alerts[i];

    var pattern = {};;
    pattern.startsAt    = incoming.startsAt;
    pattern.fingerprint = incoming.fingerprint;
    console.log('--- pattern ---');
    console.log(pattern);
    console.log('--- pattern ---');

    // search for alert already posted
    db.search_alert(pattern, function(err, result) {
        if (result.length > 0) {
            // this alert was previously fired
            found = result[0];     // assume only one record is in DB

            // check those status
            if (found.status == 'firing' && incoming.status == 'resolved') {
                // now it's resolved, update it
                db.update_alert(pattern, {$set: {status: 'resolved'}}, function(err) {
                    console.log(formatAlert(buildAlertObject(incoming)));
                });
            }
            else
            {
                // its already resolved, do nothing.
            }
        }
        else {
            // this is the first firing, save it
            db.insert_alert(incoming, function() {
                console.log(formatAlert(buildAlertObject(incoming)));
            });
        }
    });
  }
});

//------------------------------------------------------------
// POST handler for watchdog
//------------------------------------------------------------
app.post('/watchdog/', (req, res) => {
  res.sendStatus(200);

  for (var i in req.body.alerts) {
    var alert = buildAlertObject(req.body.alerts[i]);

    console.log(formatWatchdog(alert));
  }
});

//------------------------------------------------------------
// Connect DB and make HTTP server
//------------------------------------------------------------
db.init_db(function(err) {

    var server = app.listen(LISTEN_PORT, function () {

        var host = server.address().address;
        var port = server.address().port;

        console.log('listening at http://%s:%s', host, port);
    })
});



