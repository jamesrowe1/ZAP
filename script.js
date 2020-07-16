// jQuery
//DOM Elements
var searchBar = $("#search");

$(document).ready(function () {
  $(".sidenav").sidenav();
});

//user enters page
//User Nav
// if user click on the logo - button
// button returns user to main page
//searchbar
// ==========================================================
// DEPENDENCIES
var getPic = document.querySelector("img");
var seacrhInput = document.querySelector("#search");
// add event listener
getPic.addEventListener("click", function (event) {
  event.preventDefault();
  console.log(getPic);
});
// this function populates card with image from user search
function getPic() {}
var name = "";
var myArray = [];

function that() {
  name = document.getElementById("txtbox_gamename").value; // Getting the typed value
  myArray.push(name); // storing into an array
  console.log(myArray);
}

function search() {
  var z = prompt("Search Id Number");
  for (i in myArray) {
    if (z == myArray[i]) {
      document.getElementById("batman").innerHTML = z; //Looping the array and checking if the item exist
      break;
    } else {
      document.getElementById("batman").innerHTML = "Does not exist";
    }
  }
}
//cards of image from game plus info
var picDiv = $("<div>");
var p = $("<p>");
var gameImage = $("<img>");
// gameImage.attr("src", results[i].images.fixed_height.url);
picDiv.append(p);
picDiv.append(gameImageUrl);
// $("#").prepend(picDiv);

// ==================================================
//pull categories of data
//save button
var myGame = document.querySelectorAll(".save");
function saveGame() {
  // get most recent submission
  //unsure of gametitle
  var myGame = JSON.parse(localStorage.getItem("gameTitle"));

  myGame.addEventListener("click", function (event) {
    event.preventDefault();
    console.log("myGame");
  });
}

//share button
var myShare = document.querySelectorAll(".share");
function shareGame() {
  // get most recent submission
  //unsure of gametitle

  //   remember to tak out the alert!!!
  myShare.addEventListener("click", function (event) {
    event.preventDefault();
    console.log("myShare");
    alert("Done and waiting for James ajax stuff");
  });
}
//     on click
//     pull from API
//     pulls up lists according to User input

//get specific details from rawg api
var gameName = "lego Batman";

var price = "$19.99";
var storeCheapID;
var gameDescription = "we are awesome coders";
var gameImageUrl;
var gameCheapID;
var esrb = "";

searchBar.on("keypress", function (event) {
  var keycode = event.keyCode;
  if (keycode === 13) {
    event.preventDefault();
    gameName = searchBar.val();
    console.log(gameName);
    //all the ajax stuff here
    //Rawg API has weird naming conventions
    var gameRawg = gameName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    gameRawg = gameRawg.replace(/-{2,}/g, "-");
    //CheapShark API also has weird naming conventions
    var gameCheap = gameName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    //gets details from rawgAPI
    $.ajax({
      url: "https://api.rawg.io/api/games/" + gameRawg,
      method: "GET",
    }).then(function (rawgResponse) {
      console.log(rawgResponse);
      //esrb rating
      if (rawgResponse.esrb_rating === null) {
        esrb = "No ESRB Rating";
      } else {
        esrb = rawgResponse.esrb_rating.name;
      }
      //this has <p> in it. let's try to use it to make the card clean
      gameDescription = rawgResponse.description;
      //setting the image
      gameImageUrl = rawgResponse.background_image;
      console.log(esrb);
      console.log(gameDescription);
      console.log(gameImageUrl);
    });

    //get array of games closely matching from cheapshark api
    var settings = {
      async: true,
      crossDomain: true,
      url:
        "https://cheapshark-game-deals.p.rapidapi.com/games?limit=60&title=" +
        gameCheap +
        "&exact=0",
      method: "GET",
      headers: {
        "x-rapidapi-host": "cheapshark-game-deals.p.rapidapi.com",
        "x-rapidapi-key": "629a103ae7msh8d2e000534865ffp18dc6ejsna10a77d719b1",
      },
    };

    $.ajax(settings).done(function (cheapResponseArr) {
      console.log(cheapResponseArr);
      gameCheapID = cheapResponseArr[0].gameID;

      //nested call to cheap as details are needed from above
      //get specific info about 1 game (wow) cheapshark
      var settings = {
        async: true,
        crossDomain: true,
        url:
          "https://cheapshark-game-deals.p.rapidapi.com/games?id=" +
          gameCheapID,
        method: "GET",
        headers: {
          "x-rapidapi-host": "cheapshark-game-deals.p.rapidapi.com",
          "x-rapidapi-key":
            "629a103ae7msh8d2e000534865ffp18dc6ejsna10a77d719b1",
        },
      };

      $.ajax(settings).done(function (cheapResponseSingle) {
        console.log(cheapResponseSingle);
        price = cheapResponseSingle.deals[0].price;
        console.log(price);
        storeCheapID = cheapResponseSingle.deals[0].storeID;

        //nested call to cheap as storeid needed from above
        //cheapshark stores
        var settings = {
          async: true,
          crossDomain: true,
          url: "https://cheapshark-game-deals.p.rapidapi.com/stores",
          method: "GET",
          headers: {
            "x-rapidapi-host": "cheapshark-game-deals.p.rapidapi.com",
            "x-rapidapi-key":
              "629a103ae7msh8d2e000534865ffp18dc6ejsna10a77d719b1",
          },
        };

        $.ajax(settings).done(function (cheapStoresResponse) {
          console.log(storeCheapID);
          console.log(cheapStoresResponse);
          //cause store id is +1 of array value...
          console.log(cheapStoresResponse[storeCheapID - 1].storeName);
        });
      });
    });
  }
});
