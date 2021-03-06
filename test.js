var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var async = require('async');


var url;
const dbname = 'alerts';
const document = 'alerts';


var _db;

mongoService = process.env.MONGODB_SERVICE.toUpperCase();
if (mongoService) {
    const host = process.env[mongoService + '_SERVICE_HOST'];
    const port = process.env[mongoService + '_SERVICE_PORT'];
    const user = process.env.MONGODB_USER;
    const pass = process.env.MONGODB_PASS;

    console.log(process.env);

    url = 'mongodb://' + user + ':' + pass + '@' + host + ':' + port + '/' + dbname;
}
else {
    url = 'mongodb://mongodb:mongodb@localhost:27017/alerts';
}


function init_db(callback) {
    console.log("------ connecting " + url + "  ------");

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

function search_alert(db, pattern, callback) {
    console.log("------ find ------");

    var collection = db.collection("alerts")
    collection.find(pattern).toArray(function(err, result) {
        assert.equal(null, err);
        console.log("------ found ------");
	
	callback(null, result);
    });
}

function update_alert(db, where, set, callback) {
    console.log("------ update ------");

    var collection = db.collection("alerts")
    collection.updateMany(where, set, function(err) {
        assert.equal(null, err);
        console.log("------ updated ------");
	
	callback(null);
    });
}

async.waterfall([
    function(callback) {
        init_db(callback);
    },
    function(callback) {
        insert_alert(_db, {a: "a", b: "b"}, callback);
    },
    function(callback) {
        search_alert(_db, {a: "a"}, function(err, result) {
            console.log(result);
            callback(null);
        });
    },
    function(callback) {
        update_alert(_db, {a: "a"}, {$set: {b: "c"}}, callback);
    }
], function(err) {
        if (err) throw err;
        console.log("------ done ------");
});


