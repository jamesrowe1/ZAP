// jQuery

$(document).ready(function () {
  $(".sidenav").sidenav();
});

//user enters page
<<<<<<< HEAD

//zap logo is a button that brings you to splash/homepage page
//onclick funciton
//link to first html

//3 separate carosul containers of different games from API
//buttons of each image if not cards
//each image is a button

//below the image there are buttons (like, info, ratings) (click then reveal price)
//pull categories of data
//drop down menu categories with categories that link with buttons
//each button

//contact page

//about page linked to (link and logo)
=======
//User Nav
// if user click on the logo - button
// button returns user to main page
//searchbar

//cards of image from game plus info
//pull categories of data
//save button
//share button

//     button
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
	"async": true,
	"crossDomain": true,
	"url": "https://cheapshark-game-deals.p.rapidapi.com/stores",
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "cheapshark-game-deals.p.rapidapi.com",
		"x-rapidapi-key": "629a103ae7msh8d2e000534865ffp18dc6ejsna10a77d719b1"
	}
}

$.ajax(settings).done(function (response) {
	console.log(response);
});
>>>>>>> 2ab8cb1d46a04e0f9dff2bdc7e6074ee02fd0ff6
