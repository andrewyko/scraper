var express = require("express");
var mongoose = require("mongoose");
var router = express.Router();
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Requiring our Note and Article models
var Note = require("../models/Note.js");
var Article = require("../models/Article.js");

// Routes
// ======

router.get("/", function(req, res) {
    Article.find({}, function(err, data) {
      var hbsObject = {
          article: data
        };
        res.render("index", hbsObject);
    });
  });

router.get("/saved", function(req, res){
    Article.find({}, function(err, data) {
        var hbsObject = {
            article: data
          };
          res.render("saved", hbsObject);
      });
});

// A GET request to scrape the Ars Technica website
router.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    request("https://www.espn.com/", function(error, response, html) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(html);
      // Now, we grab every h2 within an article tag, and do the following:
      $("article.contentItem").each(function(i, element) {
  
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this).find("h1").text();
        result.link = $(this).find("a").attr("href");
        result.about = $(this).find("p").text();
  
        // Using our Article model, create a new entry
        // This effectively passes the result object to the entry (and the title and link)
        var entry = new Article(result);
  
        // Now, save that entry to the db
        entry.save(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          // Or log the doc
          else {
            console.log(doc);
          }
        });
  
      });
    });
    // Tell the browser that we finished scraping the text
    Article.find({}, function(err, data) {
      var hbsObject = {
          article: data
        };
        res.render("scraping", hbsObject);
    });
  });
  
  // This will get the articles we scraped from the mongoDB
  router.get("/articles", function(req, res) {
  
  
    // TODO: Finish the route so it grabs all of the articles
    Article.find({}, function(err, data) {
      res.send(data);
    })
    
  
  
  });
  
  // This will grab an article by it's ObjectId
  router.get("/articles/:id", function(req, res) {
  
    // Use our Note model to make a new note from the req.body
    Article.findOne({"_id":req.params.id}).populate("note")
    
      .exec(function(error, doc) {
    
        if (error) {
          res.send(error);
        }
        else {
          res.send(doc);
        }
      });
    
    });
   
  
  
  // Create a new note or replace an existing note
  router.post("/articles/:id", function(req, res) {
  
    // and update it's "note" property with the _id of the new note
    var newNote = new Note(req.body);
    console.log(newNote);
    // Save the new note to mongoose
    newNote.save(function(error, doc) {
      // Send any errors to the browser
      if (error) {
        res.send(error);
      }
      // Otherwise
      else {
        // Find our user and push the new note id into the User's notes array
        Article.findOneAndUpdate({"_id":req.params.id}, { $set: { "note": doc._id } }, { new: true }, function(err, newdoc) {
          // Send any errors to the browser
          if (err) {
            res.send(err);
          }
          // Or send the newdoc to the browser
          else {
            console.log(newdoc);
            res.send(newdoc);
          }
        });
      }
    });
  
  });

    // Save the article by updating the articles saved to 1(true);
    router.get('/save/:id?', function (req, res) {
        // Set the _id retrieved from the req.params.id of the article the user would like to save to a variable
        var id = req.params.id;
        // Find the  article by id
        Article.findById(id, function (err, article) {
            if (err) return handleError(err);
            //set saved to 1(true)
            article.saved = 1;
            //save the update in mongoDB
            article.save(function (err, updatedArticle) {
                if (err) return handleError(err);
                res.redirect("/saved");
            })

        })
    });

    // Bring user to the saved html page showing all their saved articles
    router.get('/saved', function (req, res) {
        //find all articles
        Article.find({}, function (err, doc) {
            if (err) return handleError (err);
                //set up data to show in handlebars
                var hbsObject = {article: doc};
                res.render('saved', hbsObject);
        });
    });
    // Delete article from the saved articles page
    router.get('/delete/:id?', function (req, res) {
        var id = req.params.id; // set the _id of the article the user would like to delete from saved to a variable
        // Find the  article by id
        Article.findById(id, function (err, article) {
            article.saved = 0; //set saved to 0(false) so it will be removed from the saved page

            // save the updated changes to the article
            article.save(function (err, updatedArticle) {
                if (err) return handleError(err); //if err
                res.redirect('/saved'); //redirect back to the saved page as the updated data will effect the view
            })
        })
    });

module.exports = router;