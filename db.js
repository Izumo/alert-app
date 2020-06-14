var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var async = require('async');

var env = process.env;

var MONGODB_USER = env.MONGODB_USER ? env.MONGODB_USER : "mongodb";
var MONGODB_PASS = env.MONGODB_PASS ? env.MONGODB_PASS : "mongodb";
var MONGODB_HOST = env.MONGODB_SERVICE_HOST ? env.MONGODB_SERVICE_HOST : "localhost";
var MONGODB_PORT = env.MONGODB_SERVICE_PORT ? env.MONGODB_SERVICE_PORT : "27017";
var MONGODB_DB   = env.MONGODB_DB   ? env.MONGODB_DB   : "alerts";
var MONGODB_COLLECTION = env.MONGODB_COLLECTION   ? env.MONGODB_COLLECTION   : "alerts";

var URL = 'mongodb://' + MONGODB_USER + ':' + MONGODB_PASS + '@' + 
          MONGODB_HOST + ':' + MONGODB_PORT + '/' + MONGODB_DB

var _db;

//-------------------------------------------------
// Initialize MongoDB driver and connect to the db
//-------------------------------------------------
exports.init_db = function (callback) {
    console.log("------ connect ------");
    console.log(URL);

    client = new MongoClient(URL, { useUnifiedTopology: true } );
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("------ connected ------");
        _db = client.db(MONGODB_DB);

        callback(err);
    })
}

//------------------------
// insert an alert record
//------------------------
exports.insert_alert = function (alert, callback) {
    console.log("------ insert ------");
    console.log(alert); // for debug
    
    var collection = _db.collection(MONGODB_COLLECTION)
    collection.insertOne(alert, function(err, result) {
        assert.equal(null, err);
        console.log("------ inserted ------");

        console.log("--- after insertion ---");
        console.log(alert);
        console.log("------");
        callback(null);
    });
}

//----------------------------------------------
// find the alert record which have the pattern
//----------------------------------------------
exports.search_alert = function (pattern, callback) {
//  console.log("------ find ------");
    
    var collection = _db.collection(MONGODB_COLLECTION)
    collection.find(pattern).toArray(function(err, result) {
        assert.equal(null, err);
//      console.log("------ found ------");
	
	callback(null, result);
    });
}

//-------------------------------------------------
// update the alert records which have the pattern
//-------------------------------------------------
exports.update_alert = function (where, set, callback) {
    console.log("------ update ------");

    var collection = _db.collection(MONGODB_COLLECTION)
    collection.updateMany(where, set, function(err) {
        assert.equal(null, err);
        console.log("------ updated ------");
	
	callback(null);
    });
}

