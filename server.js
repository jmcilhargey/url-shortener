var express = require("express");
var app = express();
var mongo = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/test";

mongo.connect(url, function(err, db) {
  
  if (err) { throw err; }
  console.log("Database connected!");
  
  db.createCollection("sites", {
    capped: true,
    size: 100000,
    max: 1000
  });
  
  app.use(express.static(__dirname));
  app.use(express.bodyParser());
  
  function randomUrl() {
    var key = "abcdefghijklmnopqrstuvwxyz0123456789"
    var random = [];
    
    for (var i = 0; i < 4; i++) {
      var char = Math.floor(Math.random() * (key.length))
      random.push(key[char]);
    }
    return random.join("");
  }
  
  app.post("/", function(req, res) {
    var entry = {
      longsite : req.body.entry,
      shortsite : "https://url-service.herokuapp.com/" + randomUrl()
    };
    db.collection("sites").insert(entry);
    res.json(entry);
  });
  
  app.get("/:site", function(req, res) {
    var query = req.params.site;
    db.collection("sites").findOne({ "shortsite" : "https://url-service.herokuapp.com/" + query }, function(err, result) {
      if (err) { throw err }
      if (result) {
        res.redirect(result.longsite);
      } else {
        res.redirect("/");
      }
    });
  });
  
  app.listen(process.env.PORT || 3000, function() {
  console.log("Ready! Listening on port " + process.env.PORT);
  });
  
});




