// jQuery
//DOM Elements
var searchForm = $("#searchForm");
var searchBar = $("#search");
var bigContainer = $("#bigContainer");

//initialize
var rawgResponseGlobal;
var allGamesArr = [];

$(document).ready(function () {
  $(".sidenav").sidenav();
});

//allow clicking icon to do something
$("#searchIcon").on("click", function (event) {
  event.preventDefault();
  searchTime(event);
});
searchForm.on("submit", function (event) {
  event.preventDefault();
  searchTime(event);
});

function searchTime() {
  //show the preloader until the card is ready to show
  $("#preloader").show();
  var gameCardObj = {
    gameName: searchBar.val(),
    gameImageUrl: "",
    gameRawg: "",
    gameCheap: "",
    gameCheapID: "",
    storeCheapID: "",
    isF2P: "",
    esrb: "",
    gameDescription: "",
    price: "",
    storeName: "",
    clip: "",
  };
  searchForm.trigger("reset");
  RawgAPI(gameCardObj);
}

function RawgAPI(gameCardObj) {
  //all the ajax stuff here
  //Rawg API has weird naming conventions
  gameCardObj.gameRawg = gameCardObj.gameName
    .replace("'", "")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
  //gameCardObj.gameRawg = gameCardObj.gameRawg.replace(/-+/g, "-");

  //CheapShark API also has weird naming conventions
  gameCardObj.gameCheap = gameCardObj.gameName
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  //gets details from rawgAPI
  $.ajax({
    url: "https://api.rawg.io/api/games/" + gameCardObj.gameRawg,
    method: "GET",
    success: function (rawgResponse) {
      console.log(rawgResponse);
      //make sure its not a redirect
      if (rawgResponse.hasOwnProperty("redirect")) {
        gameCardObj.gameName = rawgResponse.slug;
        RawgAPI(gameCardObj);
      } else {
        rawgResponseGlobal = rawgResponse;

        $("#gameNotFound").show;
        //esrb rating
        if (rawgResponse.esrb_rating === null) {
          gameCardObj.esrb = "No ESRB Rating";
        } else {
          gameCardObj.esrb = rawgResponse.esrb_rating.name;
        }
        if (rawgResponse.clip !== null) {
          gameCardObj.clip = rawgResponse.clip.clip;
        }
        //this has <p> in it. let's try to use it to make the card clean
        gameCardObj.gameDescription = rawgResponse.description;
        //setting the image
        gameCardObj.gameImageUrl = rawgResponse.background_image;
        gameCardObj.gameName = rawgResponse.name;

        //figure out of if game is f2p
        for (var k = 0; k < rawgResponse.tags.length; k++) {
          if (rawgResponse.tags[k].name === "Free to Play") {
            gameCardObj.isF2P = true;
          }
        }

        //get array of games closely matching from cheapshark api
        CheapSharkDealsAPI(gameCardObj);
      }
    },
    error: function (xhr, ajaxOptions, thrownError) {
      if (xhr.status === 404) {
        $("#preloader").hide();
        $("#gameNotFound").modal();
        $("#gameNotFound").modal("open");
      }
    },
  });
}

/**
 * This API is to get the best deal
 */
function CheapSharkDealsAPI(gameCardObj) {
  var settings = {
    async: true,
    crossDomain: true,
    url:
      "https://cheapshark-game-deals.p.rapidapi.com/games?limit=60&title=" +
      gameCardObj.gameCheap +
      "&exact=0",
    method: "GET",
    headers: {
      "x-rapidapi-host": "cheapshark-game-deals.p.rapidapi.com",
      "x-rapidapi-key": "629a103ae7msh8d2e000534865ffp18dc6ejsna10a77d719b1",
    },
  };

  $.ajax(settings).done(function (cheapResponseArr) {
    console.log(rawgResponseGlobal);
    //if there are places to buy, or its F2P, set not to sale
    if (
      cheapResponseArr.length === 0 ||
      gameCardObj.isF2P ||
      rawgResponseGlobal.stores.length === 0
    ) {
      gameCardObj.price = "Not for sale online";
      gameCardObj.storeName = "Not for sale online";
      addCard(gameCardObj);
    } else {
      gameCardObj.gameCheapID = cheapResponseArr[0].gameID;

      //nested call to cheap as details are needed from above
      //get specific info about 1 game (wow) cheapshark
      CheapSharkAPI(gameCardObj);
    }
  });
}

function CheapSharkAPI(gameCardObj) {
  var settings = {
    async: true,
    crossDomain: true,
    url:
      "https://cheapshark-game-deals.p.rapidapi.com/games?id=" +
      gameCardObj.gameCheapID,
    method: "GET",
    headers: {
      "x-rapidapi-host": "cheapshark-game-deals.p.rapidapi.com",
      "x-rapidapi-key": "629a103ae7msh8d2e000534865ffp18dc6ejsna10a77d719b1",
    },
  };

  $.ajax(settings).done(function (cheapResponseSingle) {
    //set default here
    gameCardObj.price = cheapResponseSingle.deals[0].price;
    gameCardObj.storeCheapID = cheapResponseSingle.deals[0].storeID;

    //find the lowest price
    for (var l = 0; l < cheapResponseSingle.deals.length; l++) {
      if (cheapResponseSingle.deals[l].price < gameCardObj.price) {
        gameCardObj.price = cheapResponseSingle.deals[l].price;
        gameCardObj.storeCheapID = cheapResponseSingle.deals[l].storeID;
      }
    }

    //nested call to cheap as storeid needed from above
    //cheapshark stores
    CheapStoresAPI(gameCardObj);
  });
}

function CheapStoresAPI(gameCardObj) {
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

  $.ajax(settings).done(function (cheapStoresResponse) {
    console.log(gameCardObj.storeCheapID);
    console.log(cheapStoresResponse);
    //cause store id is +1 of array value...
    console.log(cheapStoresResponse[gameCardObj.storeCheapID - 1].storeName);
    gameCardObj.storeName =
      cheapStoresResponse[gameCardObj.storeCheapID - 1].storeName;
    console.log(gameCardObj.gameImageUrl);
    addCard(gameCardObj);
  });
}

function addCard(game) {
  //create card div
  var cardDiv = $("<div>");
  cardDiv.addClass("card");

  //create card image div

  var cardImgDiv = $("<div>");
  cardImgDiv.addClass("card-image center #b71c1c red darken-4");
  var gameImg = $("<img>");
  gameImg.attr("src", game.gameImageUrl);

  //create cardTitle
  var cardTitle = $("<span>");
  cardTitle.addClass("card-title white-text");
  cardTitle.html("<h4>" + game.gameName + "</h4>");

  //create esrb rating div
  var cardESRB = $("<div>");
  cardESRB.addClass("card-content card-esrb");
  cardESRB.html("<h5>ESRB Rating: </h5>" + game.esrb);

  //create card description
  var cardDescription = $("<div>");
  cardDescription.addClass("card-content");
  cardDescription.html("<h5> Game Description : </h5>" + game.gameDescription);

  //create price div
  var cardPrice = $("<div>");
  cardPrice.addClass("card-content card-price");
  cardPrice.html("<h5>Price: </h5>" + game.price);

  //create store div
  var cardStore = $("<div>");
  cardStore.addClass("card-content card-store");
  cardStore.html("<h5>Available at: </h5>" + game.storeName);

  //create buttons
  var cardButtons = $("<div>");
  cardButtons.addClass("card-content card-buttons");

  //share button
  var shareButton = $("<a>");
  shareButton.addClass("btn-share waves-effect waves-light btn modal-trigger");
  shareButton.attr("href", "#myModal");
  shareButton.click(shareBtnClick);
  shareButton.text("Share");
  shareButton.data("gameObj", JSON.stringify(game));

  //like button
  var likeButton = $("<button>");
  likeButton.addClass("btn-like waves-effect waves-light btn");
  likeButton.text("Like");
  likeButton.click(likeBtnClick);
  likeButton.data("gameObj", JSON.stringify(game));

  //video button
  var videoButton = $("<button>");
  videoButton.addClass("btn-like waves-effect waves-light btn");
  videoButton.text("See a Preview");
  videoButton.click(videoBtnClick);
  videoButton.data("gameObj", JSON.stringify(game));

  //append everything
  cardImgDiv.append(cardTitle);
  cardImgDiv.append(gameImg);

  cardDiv.append(cardImgDiv);

  cardDiv.append(cardDescription);
  cardDiv.append(cardESRB);
  cardDiv.append(cardPrice);
  cardDiv.append(cardStore);
  cardButtons.append(shareButton);
  cardButtons.append(likeButton);
  if (game.clip !== "") {
    cardButtons.append(videoButton);
  }
  cardDiv.append(cardButtons);
  //hide the preloader
  $("#preloader").hide();
  //append the card to the container
  bigContainer.prepend(cardDiv);
}

function shareBtnClick(event) {
  // modal pops up
  $("#myModal").modal();
  event.preventDefault();
  var gameObj = $(this).data("gameObj");
  console.log(gameObj);
  gameObj = JSON.parse(gameObj);
  $("#imageLink").text(gameObj.gameImageUrl);
  // make close (x) work
  // close button?
}
//like button function which is later linked to the populator function- passes an object
function likeBtnClick(event) {
  var favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  var gameObj = $(this).data("gameObj");
  console.log(gameObj);
  gameObj = JSON.parse(gameObj);
  console.log(gameObj);
  //check to make sure the object is not already in the like array
  var gameObjCheck;
  gameObjCheck = favorites.filter((game) => {
    if (game.gameName === gameObj.gameName) {
      return true;
    }
  });
  if (gameObjCheck.length === 0) {
    //add the new like into favorites if it is not already there
    favorites.unshift(gameObj);
  } else {
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
}
//this funciton is for the video preview which opens a new window and autoplays the clip
function videoBtnClick(event) {
  console.log($(this).data);
  var gameObj = $(this).data("gameObj");
  gameObj = JSON.parse(gameObj);
  window.open(gameObj.clip, "Clip of " + gameObj.gameName);
}
//this function links to likes page HTML which takes the stored data (likes) and populates page
function likePopulator() {
  var favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites.forEach((element) => {
    addCard(element);
  });
}

$("#getAllGames").on("click", function () {
  getAllGames("https://api.rawg.io/api/games?page_size=40", 0);
});

function getAllGames(url, timesrun) {
  $.ajax({
    url: "https://api.rawg.io/api/games?page_size=40",
    method: "GET",
    success: function (allGamesPage) {
      console.log(allGamesPage);
      allGamesPage.results.forEach((game) => {
        allGamesArr.push('"' + game.name + '"' + ": null");
      });
      console.log(allGamesArr);
      timesrun++;
      if (timesrun < 10) {
        getAllGames(allGamesPage.next, timesrun);
      }
      $("#stuff").text(allGamesArr);
    },
    error: function (xhr, ajaxOptions, thrownError) {},
  });
}
//auto complete function (awesome block of code)
$(document).ready(function () {
  $("input.autocomplete").autocomplete({
    data: {
      "Grand Theft Auto V": null,
      "Portal 2": null,
      "The Witcher 3: Wild Hunt": null,
      "Tomb Raider (2013)": null,
      "The Elder Scrolls V: Skyrim": null,
      "Left 4 Dead 2": null,
      "Borderlands 2": null,
      "BioShock Infinite": null,
      Portal: null,
      "Life is Strange": null,
      "Counter-Strike: Global Offensive": null,
      Limbo: null,
      BioShock: null,
      "Half-Life 2": null,
      "Team Fortress 2": null,
      "Red Dead Redemption 2": null,
      "DOOM (2016)": null,
      "PAYDAY 2": null,
      "Fallout 4": null,
      "Grand Theft Auto IV": null,
      "Dota 2": null,
      "God of War": null,
      "The Walking Dead: Season 1": null,
      "Rocket League": null,
      "METAL GEAR SOLID V: THE PHANTOM PAIN": null,
      "Destiny 2": null,
      "Half-Life 2: Lost Coast": null,
      Warframe: null,
      "Metro 2033": null,
      "Horizon Zero Dawn": null,
      "The Witcher 2: Assassins of Kings Enhanced Edition": null,
      Terraria: null,
      "Rise of the Tomb Raider": null,
      "Middle-earth: Shadow of Mordor": null,
      "Half-Life 2: Episode One": null,
      HITMAN: null,
      "Spec Ops: The Line": null,
      "Half-Life 2: Episode Two": null,
      "Batman: Arkham Knight": null,
      "BioShock 2": null,
      "Grand Theft Auto V": null,
      "Portal 2": null,
      "The Witcher 3: Wild Hunt": null,
      "Tomb Raider (2013)": null,
      "The Elder Scrolls V: Skyrim": null,
      "Left 4 Dead 2": null,
      "Borderlands 2": null,
      "BioShock Infinite": null,
      Portal: null,
      "Life is Strange": null,
      "Counter-Strike: Global Offensive": null,
      Limbo: null,
      BioShock: null,
      "Half-Life 2": null,
      "Team Fortress 2": null,
      "Red Dead Redemption 2": null,
      "DOOM (2016)": null,
      "PAYDAY 2": null,
      "Fallout 4": null,
      "Grand Theft Auto IV": null,
      "Dota 2": null,
      "God of War": null,
      "The Walking Dead: Season 1": null,
      "Rocket League": null,
      "METAL GEAR SOLID V: THE PHANTOM PAIN": null,
      "Destiny 2": null,
      "Half-Life 2: Lost Coast": null,
      Warframe: null,
      "Metro 2033": null,
      "Horizon Zero Dawn": null,
      "The Witcher 2: Assassins of Kings Enhanced Edition": null,
      Terraria: null,
      "Rise of the Tomb Raider": null,
      "Middle-earth: Shadow of Mordor": null,
      "Half-Life 2: Episode One": null,
      HITMAN: null,
      "Spec Ops: The Line": null,
      "Half-Life 2: Episode Two": null,
      "Batman: Arkham Knight": null,
      "BioShock 2": null,
      "Grand Theft Auto V": null,
      "Portal 2": null,
      "The Witcher 3: Wild Hunt": null,
      "Tomb Raider (2013)": null,
      "The Elder Scrolls V: Skyrim": null,
      "Left 4 Dead 2": null,
      "Borderlands 2": null,
      "BioShock Infinite": null,
      Portal: null,
      "Life is Strange": null,
      "Counter-Strike: Global Offensive": null,
      Limbo: null,
      BioShock: null,
      "Half-Life 2": null,
      "Team Fortress 2": null,
      "Red Dead Redemption 2": null,
      "DOOM (2016)": null,
      "PAYDAY 2": null,
      "Fallout 4": null,
      "Grand Theft Auto IV": null,
      "Dota 2": null,
      "God of War": null,
      "The Walking Dead: Season 1": null,
      "Rocket League": null,
      "METAL GEAR SOLID V: THE PHANTOM PAIN": null,
      "Destiny 2": null,
      "Half-Life 2: Lost Coast": null,
      Warframe: null,
      "Metro 2033": null,
      "Horizon Zero Dawn": null,
      "The Witcher 2: Assassins of Kings Enhanced Edition": null,
      Terraria: null,
      "Rise of the Tomb Raider": null,
      "Middle-earth: Shadow of Mordor": null,
      "Half-Life 2: Episode One": null,
      HITMAN: null,
      "Spec Ops: The Line": null,
      "Half-Life 2: Episode Two": null,
      "Batman: Arkham Knight": null,
      "BioShock 2": null,
      "Grand Theft Auto V": null,
      "Portal 2": null,
      "The Witcher 3: Wild Hunt": null,
      "Tomb Raider (2013)": null,
      "The Elder Scrolls V: Skyrim": null,
      "Left 4 Dead 2": null,
      "Borderlands 2": null,
      "BioShock Infinite": null,
      Portal: null,
      "Life is Strange": null,
      "Counter-Strike: Global Offensive": null,
      Limbo: null,
      BioShock: null,
      "Half-Life 2": null,
      "Team Fortress 2": null,
      "Red Dead Redemption 2": null,
      "DOOM (2016)": null,
      "PAYDAY 2": null,
      "Fallout 4": null,
      "Grand Theft Auto IV": null,
      "Dota 2": null,
      "God of War": null,
      "The Walking Dead: Season 1": null,
      "Rocket League": null,
      "METAL GEAR SOLID V: THE PHANTOM PAIN": null,
      "Destiny 2": null,
      "Half-Life 2: Lost Coast": null,
      Warframe: null,
      "Metro 2033": null,
      "Horizon Zero Dawn": null,
      "The Witcher 2: Assassins of Kings Enhanced Edition": null,
      Terraria: null,
      "Rise of the Tomb Raider": null,
      "Middle-earth: Shadow of Mordor": null,
      "Half-Life 2: Episode One": null,
      HITMAN: null,
      "Spec Ops: The Line": null,
      "Half-Life 2: Episode Two": null,
      "Batman: Arkham Knight": null,
      "BioShock 2": null,
      "Grand Theft Auto V": null,
      "Portal 2": null,
      "The Witcher 3: Wild Hunt": null,
      "Tomb Raider (2013)": null,
      "The Elder Scrolls V: Skyrim": null,
      "Left 4 Dead 2": null,
      "Borderlands 2": null,
      "BioShock Infinite": null,
      Portal: null,
      "Life is Strange": null,
      "Counter-Strike: Global Offensive": null,
      Limbo: null,
      BioShock: null,
      "Half-Life 2": null,
      "Team Fortress 2": null,
      "Red Dead Redemption 2": null,
      "DOOM (2016)": null,
      "PAYDAY 2": null,
      "Fallout 4": null,
      "Grand Theft Auto IV": null,
      "Dota 2": null,
      "God of War": null,
      "The Walking Dead: Season 1": null,
      "Rocket League": null,
      "METAL GEAR SOLID V: THE PHANTOM PAIN": null,
      "Destiny 2": null,
      "Half-Life 2: Lost Coast": null,
      Warframe: null,
      "Metro 2033": null,
      "Horizon Zero Dawn": null,
      "The Witcher 2: Assassins of Kings Enhanced Edition": null,
      Terraria: null,
      "Rise of the Tomb Raider": null,
      "Middle-earth: Shadow of Mordor": null,
      "Half-Life 2: Episode One": null,
      HITMAN: null,
      "Spec Ops: The Line": null,
      "Half-Life 2: Episode Two": null,
      "Batman: Arkham Knight": null,
      "BioShock 2": null,
      "Grand Theft Auto V": null,
      "Portal 2": null,
      "The Witcher 3: Wild Hunt": null,
      "Tomb Raider (2013)": null,
      "The Elder Scrolls V: Skyrim": null,
      "Left 4 Dead 2": null,
      "Borderlands 2": null,
      "BioShock Infinite": null,
      Portal: null,
      "Life is Strange": null,
      "Counter-Strike: Global Offensive": null,
      Limbo: null,
      BioShock: null,
      "Half-Life 2": null,
      "Team Fortress 2": null,
      "Red Dead Redemption 2": null,
      "DOOM (2016)": null,
      "PAYDAY 2": null,
      "Fallout 4": null,
      "Grand Theft Auto IV": null,
      "Dota 2": null,
      "God of War": null,
      "The Walking Dead: Season 1": null,
      "Rocket League": null,
      "METAL GEAR SOLID V: THE PHANTOM PAIN": null,
      "Destiny 2": null,
      "Half-Life 2: Lost Coast": null,
      Warframe: null,
      "Metro 2033": null,
      "Horizon Zero Dawn": null,
      "The Witcher 2: Assassins of Kings Enhanced Edition": null,
      Terraria: null,
      "Rise of the Tomb Raider": null,
      "Middle-earth: Shadow of Mordor": null,
      "Half-Life 2: Episode One": null,
      HITMAN: null,
      "Spec Ops: The Line": null,
      "Half-Life 2: Episode Two": null,
      "Batman: Arkham Knight": null,
      "BioShock 2": null,
      "Grand Theft Auto V": null,
      "Portal 2": null,
      "The Witcher 3: Wild Hunt": null,
      "Tomb Raider (2013)": null,
      "The Elder Scrolls V: Skyrim": null,
      "Left 4 Dead 2": null,
      "Borderlands 2": null,
      "BioShock Infinite": null,
      Portal: null,
      "Life is Strange": null,
      "Counter-Strike: Global Offensive": null,
      Limbo: null,
      BioShock: null,
      "Half-Life 2": null,
      "Team Fortress 2": null,
      "Red Dead Redemption 2": null,
      "DOOM (2016)": null,
      "PAYDAY 2": null,
      "Fallout 4": null,
      "Grand Theft Auto IV": null,
      "Dota 2": null,
      "God of War": null,
      "The Walking Dead: Season 1": null,
      "Rocket League": null,
      "METAL GEAR SOLID V: THE PHANTOM PAIN": null,
      "Destiny 2": null,
      "Half-Life 2: Lost Coast": null,
      Warframe: null,
      "Metro 2033": null,
      "Horizon Zero Dawn": null,
      "The Witcher 2: Assassins of Kings Enhanced Edition": null,
      Terraria: null,
      "Rise of the Tomb Raider": null,
      "Middle-earth: Shadow of Mordor": null,
      "Half-Life 2: Episode One": null,
      HITMAN: null,
      "Spec Ops: The Line": null,
      "Half-Life 2: Episode Two": null,
      "Batman: Arkham Knight": null,
      "BioShock 2": null,
      "Grand Theft Auto V": null,
      "Portal 2": null,
      "The Witcher 3: Wild Hunt": null,
      "Tomb Raider (2013)": null,
      "The Elder Scrolls V: Skyrim": null,
      "Left 4 Dead 2": null,
      "Borderlands 2": null,
      "BioShock Infinite": null,
      Portal: null,
      "Life is Strange": null,
      "Counter-Strike: Global Offensive": null,
      Limbo: null,
      BioShock: null,
      "Half-Life 2": null,
      "Team Fortress 2": null,
      "Red Dead Redemption 2": null,
      "DOOM (2016)": null,
      "PAYDAY 2": null,
      "Fallout 4": null,
      "Grand Theft Auto IV": null,
      "Dota 2": null,
      "God of War": null,
      "The Walking Dead: Season 1": null,
      "Rocket League": null,
      "METAL GEAR SOLID V: THE PHANTOM PAIN": null,
      "Destiny 2": null,
      "Half-Life 2: Lost Coast": null,
      Warframe: null,
      "Metro 2033": null,
      "Horizon Zero Dawn": null,
      "The Witcher 2: Assassins of Kings Enhanced Edition": null,
      Terraria: null,
      "Rise of the Tomb Raider": null,
      "Middle-earth: Shadow of Mordor": null,
      "Half-Life 2: Episode One": null,
      HITMAN: null,
      "Spec Ops: The Line": null,
      "Half-Life 2: Episode Two": null,
      "Batman: Arkham Knight": null,
      "BioShock 2": null,
      "Grand Theft Auto V": null,
      "Portal 2": null,
      "The Witcher 3: Wild Hunt": null,
      "Tomb Raider (2013)": null,
      "The Elder Scrolls V: Skyrim": null,
      "Left 4 Dead 2": null,
      "Borderlands 2": null,
      "BioShock Infinite": null,
      Portal: null,
      "Life is Strange": null,
      "Counter-Strike: Global Offensive": null,
      Limbo: null,
      BioShock: null,
      "Half-Life 2": null,
      "Team Fortress 2": null,
      "Red Dead Redemption 2": null,
      "DOOM (2016)": null,
      "PAYDAY 2": null,
      "Fallout 4": null,
      "Grand Theft Auto IV": null,
      "Dota 2": null,
      "God of War": null,
      "The Walking Dead: Season 1": null,
      "Rocket League": null,
      "METAL GEAR SOLID V: THE PHANTOM PAIN": null,
      "Destiny 2": null,
      "Half-Life 2: Lost Coast": null,
      Warframe: null,
      "Metro 2033": null,
      "Horizon Zero Dawn": null,
      "The Witcher 2: Assassins of Kings Enhanced Edition": null,
      Terraria: null,
      "Rise of the Tomb Raider": null,
      "Middle-earth: Shadow of Mordor": null,
      "Half-Life 2: Episode One": null,
      HITMAN: null,
      "Spec Ops: The Line": null,
      "Half-Life 2: Episode Two": null,
      "Batman: Arkham Knight": null,
      "BioShock 2": null,
      "Grand Theft Auto V": null,
      "Portal 2": null,
      "The Witcher 3: Wild Hunt": null,
      "Tomb Raider (2013)": null,
      "The Elder Scrolls V: Skyrim": null,
      "Left 4 Dead 2": null,
      "Borderlands 2": null,
      "BioShock Infinite": null,
      Portal: null,
      "Life is Strange": null,
      "Counter-Strike: Global Offensive": null,
      Limbo: null,
      BioShock: null,
      "Half-Life 2": null,
      "Team Fortress 2": null,
      "Red Dead Redemption 2": null,
      "DOOM (2016)": null,
      "PAYDAY 2": null,
      "Fallout 4": null,
      "Grand Theft Auto IV": null,
      "Dota 2": null,
      "God of War": null,
      "The Walking Dead: Season 1": null,
      "Rocket League": null,
      "METAL GEAR SOLID V: THE PHANTOM PAIN": null,
      "Destiny 2": null,
      "Half-Life 2: Lost Coast": null,
      Warframe: null,
      "Metro 2033": null,
      "Horizon Zero Dawn": null,
      "The Witcher 2: Assassins of Kings Enhanced Edition": null,
      Terraria: null,
      "Rise of the Tomb Raider": null,
      "Middle-earth: Shadow of Mordor": null,
      "Half-Life 2: Episode One": null,
      HITMAN: null,
      "Spec Ops: The Line": null,
      "Half-Life 2: Episode Two": null,
      "Batman: Arkham Knight": null,
      "BioShock 2": null,
    },
    onAutocomplete: function (data) {
      searchTime();
    },
  });
});
