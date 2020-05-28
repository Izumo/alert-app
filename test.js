var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var async = require('async');

var url = 'mongodb://mongodb:mongodb@localhost:27017/alerts';
var document = 'alerts';

var _db;

function init_db(callback) {
    console.log("------ connect ------");

    client = new MongoClient(url, { useUnifiedTopology: true } );
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("------ connected ------");
        _db = client.db(document);

        callback(err);
    })
}

function insert_alert(db, alert, callback) {
    console.log("------ insert ------");
    
    var collection = db.collection("alerts")
    collection.insertOne(alert, function(err, result) {
        assert.equal(null, err);
        console.log("------ inserted ------");

        callback(null);
    });
        
}

async.waterfall([
    function(callback) {
        init_db(callback);
    },
    function(callback) {
        insert_alert(_db, {a: "a", b: "b"}, callback);
    }
], function(err) {
	console.log(err);
        if (err) throw err;
        console.log("------ done ------");
});


