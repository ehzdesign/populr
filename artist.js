//make an audio object
var currentAudio = new Audio();

getArtistTopTracks('21 savage');

// displayCurrentSongInfo(currentTrack);

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
      spacing: -0.5,
      nav: false,
      buttons: false,
      onItemSwitch: function(c,p){
        displayCurrentSongInfo(c);
        playSong(c);
      }
    });
    var currentTrack = $('.flipster__item--current');
    // console.log(currentTrack);
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
  // var artistName = $('<div>', {
  //   class: 'artist__name'
  // });
  var trackImage = $('<img>', {
    class: 'track__image'
  });
  // var trackInfo = $('<div>', {
  //   class: 'track-info'
  // });
  // var trackTitle = $('<p>', {
  //   class: 'track__title'
  // });
  // var trackNumber = $('<p>', {
  //   class: 'track__number'
  // });
  // var trackPopularity = $('<p>', {
  //   class: 'track__popularity'
  // });
  // var trackAlbum = $('<p>', {
  //   class: 'track__album'
  // });
  // trackTitle.appendTo($(trackInfo));
  // artistName.appendTo($(trackInfo));
  // trackAlbum.appendTo($(trackInfo));
  // trackNumber.appendTo($(trackInfo));
  // trackPopularity.appendTo($(trackInfo));
  trackImage.appendTo($(trackContainer));
  // trackInfo.appendTo($(trackHtml));
  $(trackContainer).attr('data-audio-url', track.preview_url);
  $(trackContainer).attr('data-track-title', track.name);
  $(trackContainer).attr('data-track-popularity', track.popularity);

  // $(trackTitle).text('Song Name: ' + track.name);
  // $(trackNumber).text('Track Number: ' + track.track_number);
  // $(trackPopularity).text('Popularity: ' + track.popularity);
  // $(trackAlbum).text('Album:' + track.album.name);
  $(trackImage).attr('src', track.album.images[1].url);
  // $(trackHtml).appendTo(container);
  $(trackContainer).appendTo(container);
};


$(document).on('click', '.flipster__item--current', function (event) {
  event.preventDefault();
  // /* Act on the event */
  // var songUrl = $(this).attr('data-audio-url');
  playSong($(this));
  // displayCurrentSongInfo(this);
});


function playSong(track) {
  var songUrl = $(track).attr('data-audio-url');
  currentAudio.src = songUrl;
  currentAudio.play();
}

function displayCurrentSongInfo(track){
  console.log($(track));
  console.log($(track).attr('data-track-title'));
  $('.current-song-title').text($(track).attr('data-track-title'));
  $('.current-song-popularity').text('popularity: ' + $(track).attr('data-track-popularity'));
}
