//store the search query entered into form
var query;

//make an audio object
var currentSong = new Audio();

//set the type of search we are doing (artist, album or track);
// var queryType = 'artist';

//keep count of how many calls were made to 'get tracks'
//use this number to paginate result
var getTracksPage = 0;


var $searchForm = $('#search-form');

//when search form is used
$searchForm.on('submit', function (event) {
  event.preventDefault();
  /* Act on the event */

  //create an object of all form values
  query = $(this).serializeArray();

  //get the typed value ( the artist the user searched for)
  query = query[0].value;

  // run function to search all tracks
  getTracks(query);

  //log what the user searched for
  console.log('the query being searched for : ' + query);

  //clear the form
  $(this).trigger('reset');

  //clear the results container
  $('#tracks').html('');

  //get the artist top tracks
  //@todo: use this later when an artist name is chosen
  // getArtistTopTracks(query);

});






function showTrackItem(collection, container) {
  //if returning all tracks by user query object has property of all tracks
  // called `items` and if returning the top 10 popular tracks the property containing
  // track info is named `tracks`
  if(collection.hasOwnProperty('items')){
    //create the html template for each item in array
    $.each(collection.items, function (index, el) {
      createTrackItem(el, container);
    });
    //break out of if statement
    return;
  };
  //this is being called only if returning popular artist tracks
  $.each(collection.tracks, function (index, el) {
    createTrackItem(el, container);
  });
};





//search by word and return all searches
function getTracks(q){
  var query = q;
  $.ajax({
    url: 'https://api.spotify.com/v1/search',
    data: {
      q: query,
      type: 'track',
      limit: 50
    }
  })
  .done(function(data) {
    console.log("success");
    var tracks = data.tracks;
    console.log(tracks);
    showTrackItem(tracks, '#tracks');
    getTracksPage++;

  })
  .fail(function() {
    console.log("error");
  })
  .always(function() {
    console.log("get all tracks has completed");
  });

};




function getArtistTopTracks(q){
  var query = q;

  var a1 = $.ajax({
    //search the database with users requested artist
    url: 'https://api.spotify.com/v1/search',
    data: {
      q: query,
      type: 'artist',
      limit: 50
    }
  });
  var a2 = a1.then(function (data) {
    console.log(data.artists.items);
    var artistPopularOrder = _.orderBy(data.artists.items, ['popularity'], ['desc']);
    var popularArtist = artistPopularOrder[0];
    console.log(popularArtist);
    return $.ajax({
      url: 'https://api.spotify.com/v1/artists/' + popularArtist.id + '/top-tracks',
      data: {
        country: 'CA'
      }
    })
  });
  a2.done(function (data) {
    console.log(data)
    showTrackItem(data, '#tracks');
  });
};



function createTrackItem(track, container) {
  var trackHtml = $('<div>', {
    class: 'track'
  });
  var artistName = $('<div>', {
    class: 'artist__name'
  });
  var trackImage = $('<img>', {
    class: 'track__image'
  });
  var trackInfo = $('<div>', {
    class: 'track-info'
  });
  var trackTitle = $('<p>', {
    class: 'track__title'
  });
  var trackNumber = $('<p>', {
    class: 'track__number'
  });
  var trackPopularity = $('<p>', {
    class: 'track__popularity'
  });
  var trackAlbum = $('<p>', {
    class: 'track__album'
  });
  trackTitle.appendTo($(trackInfo));
  artistName.appendTo($(trackInfo));
  trackAlbum.appendTo($(trackInfo));
  trackNumber.appendTo($(trackInfo));
  trackPopularity.appendTo($(trackInfo));
  trackImage.appendTo($(trackHtml));
  trackInfo.appendTo($(trackHtml));
  $(trackHtml).attr('data-audio-url', track.preview_url);
  $(trackTitle).text('Song Name: ' + track.name);
  $(trackNumber).text('Track Number: ' + track.track_number);
  $(trackPopularity).text('Popularity: ' + track.popularity);
  $(trackAlbum).text('Album:' + track.album.name);
  $(trackImage).attr('src', track.album.images[1].url);
  $(trackHtml).appendTo(container);
};
$(document).on('click', '.track', function (event) {
  event.preventDefault();
  /* Act on the event */
  var songUrl = $(this).attr('data-audio-url');
  playSong(songUrl);
});
$('.btn').click(function () {
  $('#search-form').css("opacity", "0");
  $('#search-form').css("visibility", "hidden");
  setTimeout(function () {
    $('.track').css("opacity", "1");
  }, 1000);
});



function playSong(url) {
  currentSong.src = url;
  currentSong.play();
}



//random bg images
var images = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpeg', '6.jpeg', '7.jpeg', '8.jpeg'];
$('body').css({
  'background': 'url(img/' + images[Math.floor(Math.random() * images.length)] + ')'
});
