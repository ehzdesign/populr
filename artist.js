//make an audio object
var currentAudio = new Audio();

//store the html element containing the current track item
var currentTrack;

var currentTrackTime = 10;

//keep track of song state
var isPlaying = false;

var $searchForm = $('#search-form');

var init = false;


$('#play-pause-button').addClass('play-pause-button-paused');

//when search form is used
$searchForm.on('submit', function (event) {
  event.preventDefault();
  /* Act on the event */

  //create an object of all form values
  query = $(this).serializeArray();

  //get the typed value ( the artist the user searched for)
  query = query[0].value;

  // run function to search all tracks
  createCoverFLow();

  //get the artist top tracks
  //@todo: use this later when an artist name is chosen
  getArtistTopTracks(query);

  //log what the user searched for
  console.log('the query being searched for : ' + query);

  //clear the form
  $(this).trigger('reset');

  if(!init){
    init = true;
  }

  initApp();



});


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
    //display artist info in artist section
    createArtistInfo(popularArtist);
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
    // initialize flipster cover flow

      $(".my-flipster").flipster({
        style: 'carousel',
        start: 0,
        spacing: -0.5,
        nav: false,
        buttons: false,
        onItemSwitch: function(c,p){
          displayCurrentSongInfo(c);
          playSong(c);
          currentTrack = c;
        }
      });

    currentTrack = $('.flipster__item--current');
    console.log(currentTrack);
    displayCurrentSongInfo(currentTrack);
  });
};

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

function createArtistInfo(artist, container){
  // set background image with artist image
  $('#artist').css('background-image', 'url(' + artist.images[0].url + ')');
  $('.artist-info__name').text(artist.name);
  if(artist.followers.total){
    $('.followers__amount').text(artist.followers.total.toLocaleString());
    $('.followers__title').text('followers');
  }
}


function createTrackItem(track, container) {
  var trackContainer = $('<li>', {
    class: 'track'
  });

  var trackImage = $('<img>', {
    class: 'track__image'
  });

  trackImage.appendTo($(trackContainer));
  $(trackContainer).attr('data-audio-url', track.preview_url);
  $(trackContainer).attr('data-track-title', track.name);
  $(trackContainer).attr('data-track-popularity', track.popularity);
  $(trackImage).attr('src', track.album.images[1].url);
  $(trackContainer).appendTo(container);
};


$(document).on('click', '.flipster__item--current', function (event) {
  event.preventDefault();
  // /* Act on the event */

  playSong($(this));
});


function playSong(track) {
  var songUrl = $(track).attr('data-audio-url');
  currentAudio.src = songUrl;
  currentAudio.play();
  console.log(currentAudio.currentTime);
}

function setTrackTime(audio){
  audio.currentTime = currentTrackTime;
  console.log(currentTrackTime + ': this is curent track time');
}

function pauseSong() {
  $(currentAudio).trigger('pause');
}

function displayCurrentSongInfo(track){
  console.log($(track));
  console.log($(track).attr('data-track-title'));
  $('.current-song-title').text($(track).attr('data-track-title'));
  $('.current-song-popularity').text('popularity: ' + $(track).attr('data-track-popularity'));
}

function createCoverFLow(){
  $('#coverflow').html('');
  $('#coverflow').append('<div class="my-flipster"><ul class="tracks" id="tracks"></ul></div>');

}

function audioControls(){
  if(init){
    $('#play-pause-button').show();
  }
}

function initApp(){
  audioControls();
}

$(document).on('click', '#play-pause-button', function(event){

  // $(this).toggleClass('paused');
  $(this).toggleClass('play-pause-button-paused');
  if(currentAudio.paused || !(currentAudio.play)){
    playSong(currentTrack);
    // $(this).text('pause');
    if(currentTrackTime > 0){
      setTrackTime(currentAudio);
    }
  }else if(currentAudio.play){
    console.log('pause');
    pauseSong();
    currentTrackTime = currentAudio.currentTime;
    // $(this).text('play');
  }
});
