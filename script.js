// jQuery

$(document).ready(function () {
  $(".sidenav").sidenav();
});

//user enters page
//User Nav
// if user click on the logo - button
// button returns user to main page
// drop down menu (hamurger icon
//     1.search games button with space for user input or directs to user input page
//     2.about ZAP button that links to page with images and info about ZAP App

// Possible Search categories
//     1. game prices
//     2. ESRB rating (Entertainment Software Rating Board: E= everyone; E10+= Everyone 10 and older; T=Teen; M=Mature 17+; A=Adults only; RP - Rating Pending
//     3. popularity

// The drop down menu - buttons
//     Each button pulls the correspodning data for the game
//onclick funciton
//link to first html
//3 separate carousel containers of different games from API
//buttons of each image if not cards
//each image is a button
//below the image there are buttons (like, info, ratings) (click then reveal price)
//pull categories of data
//drop down menu categories with categories that link with buttons
//each button
//contact page
//about page linked to (link and logo)

//  About Zap Page
//     Image
//     paragraph explaining the App- asscess to thousands of gaes to quickly search...

// Game Search Page
//     User input for game name -
//     User input for genre
//     Uer input for age

//     button
//     on click
//     pull from API
//     pulls up lists according to User input

//     and then theuser needs to click on???
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
