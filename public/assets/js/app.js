
$(document).on("click", ".addnotes", function() {
    
    console.log("The add notes button worked!");

    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-value");
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .done(function(data) {
        console.log(data);
        // The title of the article
        $("#notes").append("<h5>" + data.title + "</h5>");
        // A textarea to add a new note body
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $("#notes").append("<button data-value='" + data._id + "' id='savenote' class='btn-sm btn-info' data-dismiss='modal'>SAVE NOTE</button>");
        // A close button
        $("#notes").append("<button data-dismiss='modal' class='btn-danger btn-sm'>CLOSE</button>");
  
        // If there's a note in the article
        if (data.note) {
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
      });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  console.log("The save note button worked!");
    // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-value");
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .done(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#bodyinput").val("");
  });
