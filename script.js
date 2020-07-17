// jQuery
//DOM Elements
var searchBar = $("#search");
var bigContainer = $("#bigContainer");
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
var storeName;
var isF2P = false;

searchBar.on("keypress", function (event) {
  var keycode = event.keyCode;
  isF2P = false;
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
      gameName = rawgResponse.name;

      //figure out of if game is f2p
      for (var k = 0; k < rawgResponse.tags.length; k++) {
        if (rawgResponse.tags[k].name === "Free to Play") {
          isF2P = true;
        }
      }
      console.log(esrb);
      console.log(gameDescription);
      console.log(gameImageUrl);

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
          "x-rapidapi-key":
            "629a103ae7msh8d2e000534865ffp18dc6ejsna10a77d719b1",
        },
      };

      $.ajax(settings).done(function (cheapResponseArr) {
        console.log(cheapResponseArr);

        //if there are places to buy, or its F2P, set not to sale
        if (
          cheapResponseArr.length === 0 ||
          isF2P ||
          rawgResponse.stores.length === 0
        ) {
          price = "Not for sale online";
          storeName = "Not for sale online";
          addCard();
        } else {
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
            //set default here
            price = "$" + cheapResponseSingle.deals[0].price;
            storeCheapID = cheapResponseSingle.deals[0].storeID;

            //find the lowest price
            for (var l = 0; l < cheapResponseSingle.deals.length; l++) {
              if (cheapResponseSingle.deals[l].price < price) {
                price = cheapResponseSingle.deals[l].price;
                storeCheapID = cheapResponseSingle.deals[l].storeID;
              }
            }

            console.log(price);
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
              storeName = cheapStoresResponse[storeCheapID - 1].storeName;
              console.log(gameImageUrl);
              addCard();
            });
          });
        }
      });
    });
  }
});

function addCard() {
  //create card div
  var cardDiv = $("<div>");
  cardDiv.addClass("card");

  //create card image div

  var cardImgDiv = $("<div>");
  cardImgDiv.addClass("card-image center");
  var gameImg = $("<img>");
  gameImg.attr("src", gameImageUrl);

  //create cardTitle
  var cardTitle = $("<span>");
  cardTitle.addClass("card-title red-text");
  cardTitle.text(gameName);

  //create esrb rating div
  var cardESRB = $("<div>");
  cardESRB.addClass("card-content card-esrb");
  cardESRB.html("<h2>ESRB Rating: </h2>" + esrb);

  //create card description
  var cardDescription = $("<div>");
  cardDescription.addClass("card-content");
  cardDescription.html("<h2>Game Description:</h2>" + gameDescription);

  //create price div
  var cardPrice = $("<div>");
  cardPrice.addClass("card-content card-price");
  cardPrice.html("<h2>Price: </h2>" + price);

  //create store div
  var cardStore = $("<div>");
  cardStore.addClass("card-content card-store");
  cardStore.html("<h2>Available at: </h2>" + storeName);

  //create buttons
  var cardButtons = $("<div>");
  cardButtons.addClass("card-content card-buttons");
  var shareButton = $("<a>");
  shareButton.addClass("btn-share waves-effect waves-light btn");
  shareButton.text("Share");
  var likeButton = $("<a>");
  likeButton.addClass("btn-like waves-effect waves-light btn");
  likeButton.text("Like");

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
