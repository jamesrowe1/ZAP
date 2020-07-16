// jQuery

$(document).ready(function () {
  $(".sidenav").sidenav();
});

//user enters page
//User Nav
// if user click on the logo - button
// button returns user to main page
//searchbar
// ==========================================================
//cards of image from game plus info
var gameName = "World of Warcraft";
var gameDescription = "we are awesome coders";
var gameImageUrl =
  "https://media.rawg.io/media/games/1dc/1dca31934274ae06195b71cafe56f375.jpg";
            var picDiv = $("<div>");
            var p = $("<p>");
            p.text(results[i].rating);
            var gameImage = $("<img>");
            gameImage.attr("src", results[i].images.fixed_height.url);
            picDiv.append(p);
            picDiv.append(gameImage);
            $("#gifs-appear-here").prepend(picDiv);
           
          }
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

$.ajax({
  url: "https://api.rawg.io/api/games/world-of-warcraft",
  method: "GET",
}).then(function (response) {
  console.log(response);
});

//get array of games closely matching from cheapshark api
var settings = {
  async: true,
  crossDomain: true,
  url:
    "https://cheapshark-game-deals.p.rapidapi.com/games?limit=60&title=worldofwarcraft&exact=0",
  method: "GET",
  headers: {
    "x-rapidapi-host": "cheapshark-game-deals.p.rapidapi.com",
    "x-rapidapi-key": "629a103ae7msh8d2e000534865ffp18dc6ejsna10a77d719b1",
  },
};

$.ajax(settings).done(function (response) {
  console.log(response);
});

//get specific info about 1 game (wow) cheapshark
var settings = {
  async: true,
  crossDomain: true,
  url: "https://cheapshark-game-deals.p.rapidapi.com/games?id=217145",
  method: "GET",
  headers: {
    "x-rapidapi-host": "cheapshark-game-deals.p.rapidapi.com",
    "x-rapidapi-key": "629a103ae7msh8d2e000534865ffp18dc6ejsna10a77d719b1",
  },
};

$.ajax(settings).done(function (response) {
  console.log(response);
});

//cheapshark stores
var settings = {
  async: true,
  crossDomain: true,
  url: "https://cheapshark-game-deals.p.rapidapi.com/stores",
  method: "GET",
  headers: {
    "x-rapidapi-host": "cheapshark-game-deals.p.rapidapi.com",
    "x-rapidapi-key": "629a103ae7msh8d2e000534865ffp18dc6ejsna10a77d719b1",
  },
};

$.ajax(settings).done(function (response) {
  console.log(response);
});
