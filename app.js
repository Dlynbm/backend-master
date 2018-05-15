const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
//const objectId = require('mongodb').ObjectId;
const dbName = 'dlyn';


const userSchema = mongoose.Schema({
    userid: String,
    name: String,
    email: String,
    age: Number,

});

const User = mongoose.model('User', userSchema);

const url = 'mongodb://localhost:27017';

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    const dbo = db.db('dlyn');
    dbo.createCollection("users", function (err, res) {
        if (err) throw err;
        console.log("Collection created");
        db.close();
    });
});

let allUsers =[{userid: '001', name: 'Chad Payne', email: 'padarak@live.com', age: '45'}];
let user;

app.use(express.static('public'));
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));



//get user data
app.get('/get-data', function(req, res, next) {
    let resultArray = [];
    MongoClient.connect(url, function(err, deb) {
        assert.equal(null, err);
        let cursor = db.collection('users').find();
        cursor.forEach(function(doc, err) {
            resultArray.push(doc);
        }, function() {
            db.close();
            res.render('/new-user', {individualuser: resultArray});
        });
    });
});

//create new user
app.post('/new-user', function(req, res, next) {
    const individualuser = {
        userid: req.body.userid,
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    };
    MongoClient.connect(url, function (err, client) {
        const db = client.db(dbName);
        const collection = db.collection('users');
        db.collection('users').insertOne({individualuser}, function (err, result) {
            console.log("item inserted");
            client.close();
        });
        collection.find({}).toArray(function (err, docs) {
            console.log("Found the following records");
            console.log(docs);
            res.render('confirm', ({
                users: docs
            }));
        });
    });
});

//get edit pug file
    app.get('/edit/:edit', function (req, res, next) {

        MongoClient.connect(url, function (err, client) {
            const db = client.db(dbName);
            const collection = db.collection('users');
            collection.find({'individualuser.userid': req.params.edit}).toArray(function (err, docs) {
                console.log("Found one user");
                console.log(docs);
                res.render('edit', ({
                    users: docs
                }));
                client.close();
            });
        });
    });

//edit and update data
        app.post('/edit', function (req, res, next) {
            const individualuser = {
                userid: req.body.userid,
                name: req.body.name,
                email: req.body.email,
                age: req.body.age
            };
            const id = req.body.individualuser;
            MongoClient.connect(url, function (err, client) {
                const db = client.db(dbName);
                const collection = db.collection('users');
                collection.updateOne({'individualuser.userid':req.body.userid,individualuser}, function (err, docs) {
                    console.log('user updated');
                    //client.close();
                });
                collection.find({}).toArray(function (err, docs) {
                    console.log("Updated the user info");
                    console.log(docs);
                    res.render('confirm', ({
                        users: docs
                    }));
                    client.close();
                });
            });
        });

//delete data
            app.get('/delete/:id', function (req, res) {
                MongoClient.connect(url, function (err, client) {
                    const db = client.db(dbName);
                    const collection = db.collection('users');
                    collection.deleteOne({'individualuser.userid': req.params.id}, function (err, result) {
                        console.log('user deleted');

                    });
                    collection.find({}).toArray(function (err, docs) {
                        console.log("Found the following records");
                        console.log(docs);
                        res.render('confirm', ({
                            users: docs
                        }));
                        client.close();
                    });
                });
            });

app.listen(4200, function () {
    console.log('the app is running');
});





