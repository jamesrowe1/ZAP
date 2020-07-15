// jQuery

$(document).ready(function () {
  $(".sidenav").sidenav();
});

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