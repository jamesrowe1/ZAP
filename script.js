// jQuery
//DOM Elements
var searchForm = $("#searchForm");
var searchBar = $("#search");
var bigContainer = $("#bigContainer");

//initialize
var rawgResponseGlobal;

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
//

// ==================================================
//pull categories of data

//share button
var myShare = document.querySelectorAll(".share");
// myShare.addEventListener("click", function (event) {
//   event.preventDefault();
//   console.log("myShare");
//   alert("Done and waiting for James ajax stuff");
// });
// function shareGame() {
//   // get most recent submission
//   //unsure of gametitle

//   //   remember to tak out the alert!!!

// }
//     on click
//     pull from API
//     pulls up lists according to User input

//get specific details from rawg api
// var gameName = "lego Batman";

// var price = "$19.99";
// var storeCheapID;
// var gameDescription = "we are awesome coders";
// var gameImageUrl;
// var gameCheapID;
// var esrb = "";
// var storeName;
// var isF2P = false;

searchForm.on("submit", function (event) {
  event.preventDefault();

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
  };

  RawgAPI(gameCardObj);
});

function RawgAPI(gameCardObj) {
  //all the ajax stuff here
  //Rawg API has weird naming conventions
  gameCardObj.gameRawg = gameCardObj.gameName
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase();
  gameCardObj.gameRawg.replace(/-{2,}/g, "-");
  //CheapShark API also has weird naming conventions
  gameCardObj.gameCheap = gameCardObj.gameName
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  //gets details from rawgAPI
  $.ajax({
    url: "https://api.rawg.io/api/games/" + gameCardObj.gameRawg,
    method: "GET",
  }).then(function (rawgResponse) {
    console.log(rawgResponse);
    rawgResponseGlobal = rawgResponse;
    //esrb rating
    if (rawgResponse.esrb_rating === null) {
      gameCardObj.esrb = "No ESRB Rating";
    } else {
      gameCardObj.esrb = rawgResponse.esrb_rating.name;
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
    console.log(gameCardObj);

    //get array of games closely matching from cheapshark api
    CheapSharkDealsAPI(gameCardObj);
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
    console.log(cheapResponseArr);
    console.log("hey" + rawgResponseGlobal);
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
    console.log(cheapResponseSingle);
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

    console.log(gameCardObj);
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
  cardImgDiv.addClass("card-image");
  var gameImg = $("<img>");
  gameImg.attr("src", game.gameImageUrl);

  //create cardTitle
  var cardTitle = $("<span>");
  cardTitle.addClass("card-title red-text");
  cardTitle.text(game.gameName);

  //create esrb rating div
  var cardESRB = $("<div>");
  cardESRB.addClass("card-content card-esrb");
  cardESRB.text("ESRB Rating: " + game.esrb);

  //create card description
  var cardDescription = $("<div>");
  cardDescription.addClass("card-content");
  cardDescription.html(game.gameDescription);

  //create price div
  var cardPrice = $("<div>");
  cardPrice.addClass("card-content card-price");
  cardPrice.text("Price: " + game.price);

  //create store div
  var cardStore = $("<div>");
  cardStore.addClass("card-content card-store");
  cardStore.text("Available at: " + game.storeName);

  //create buttons
  var cardButtons = $("<div>");
  cardButtons.addClass("card-content card-buttons");
  var shareButton = $("<a>");
  shareButton.addClass("btn-share waves-effect waves-light btn");
  shareButton.text("Share");

  var likeButton = $("<button>");
  likeButton.addClass("btn-like");
  likeButton.text("Like");
  likeButton.click(likeBtnClick);
  likeButton.data("gameObj", JSON.stringify(game));

  //append everything
  cardImgDiv.append(cardTitle);
  cardImgDiv.append(gameImg);

  cardDiv.append(cardImgDiv);
  //cardDiv.append(gameImg);
  cardDiv.append(cardDescription);
  cardDiv.append(cardESRB);
  cardDiv.append(cardPrice);
  cardDiv.append(cardStore);
  cardButtons.append(shareButton);
  cardButtons.append(likeButton);
  cardDiv.append(cardButtons);
  bigContainer.prepend(cardDiv);

<<<<<<< HEAD
  $(".btn-like").on("click", function (event) {
    // $("this").toggleClass("clicked");
    event.preventDefault();
    //   var userLike = localStorage.setItem("click");
    // localStorage["storedClicks"] = clicks
    var userLike = JSON.parse(localStorage.getItem("click")) || [];
    userLike.unshift(gameName);
    localStorage.setItem("click", JSON.stringify(userLike));
    console.log(userLike);

    //localStorage.setItem("user", JSON.stringify(user));
  });
  // share button here
  // include a hide attribute so that the modal is hidden as default
  $('.btn-share').on('click', function (event) {
    alert('It works')
    // Get the modal
    $.
=======
  $(".btn-share").on("click", function (event) {
    //   // get most recent submission
    //   //unsure of gametitle
    alert("It works");
>>>>>>> 3babf9bc03d7aafaa03a5675eb9abba2fad8a283
    //   //   remember to tak out the alert!!!
    // make a modal with a linkto the image

    $(window).on('load', function(){
	
      $.expr[":"].external = function(a) {		
        var linkhn = a.hostname.split('.').reverse();
        var linkHref = linkhn[1] + "." + linkhn[0];
        
        var domainhn = window.location.hostname.split('.').reverse();
        var domainHref = domainhn[1] + "." + domainhn[0];
      
        return !a.href.match(/^mailto\:/) && !a.href.match(/^tel\:/) && linkHref !== domainHref;
      };
      
      $("a:external").addClass("ext_link");
      
      $(function() {
        
        $('a.ext_link').click(function() {
           // open a modal 
          $('a:external').attr('data-toggle', 'modal');
          $('a:external').attr('data-target', '#speedbump');
          //go to link on modal close
          var url = $(this).attr('href');
          $('.btn-modal.btn-continue').click(function() {
            window.open(url);
            $('.btn-modal.btn-continue').off();
          });
          $('.btn-modal.btn-close').click(function() {
            $('#speedbump').modal('hide');
            $('.btn-modal.btn-close').off();
          }); 
        });
        
      });  
    });most recent submission
    //   //unsure of gametitle

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName('close')[0]
    modal.style.display = 'block'

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
      modal.style.display = 'none'
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target !== modal) {
        modal.style.display = 'none'
      }
    }
  });

}

function likeBtnClick(event) {
  alert("CLICKED");

  var favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  // if (favorites === null) {
  //   favorites = [];
  // } else {
  //   favorites = JSON.parse(favorites);
  // }

  // alert("HERE");
  var gameObj = $(this).data("gameObj");
  gameObj = JSON.parse(gameObj);

  favorites.unshift(gameObj);

  // console.log(favorites);

  localStorage.setItem("favorites", JSON.stringify(favorites));

  //   var userLike = localStorage.setItem("click");
  // localStorage["storedClicks"] = clicks
  // var userLike = JSON.parse(localStorage.getItem("click")) || [];
  // userLike.unshift(gameName);
  // localStorage.setItem("click", JSON.stringify(userLike));
  // console.log(userLike);

  //localStorage.setItem("user", JSON.stringify(user));
}
