// jQuery

$(document).ready(function () {
  $(".sidenav").sidenav();
});

$.ajax({
  url: "https://api.rawg.io/api/games/fortnite",
  method: "GET",
}).then(function (response) {
  console.log(response);
});
