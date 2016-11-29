//make an audio object
var currentAudio = new Audio();

//store the html element containing the current track item
var currentTrack;

//store the current track time of song when being played to be used when using the pause function to resume from paused point of audio
var currentTrackTime;

//keep track of audio state
var isPlaying = false;

//get the search form
var searchForm = $('#search-form');

//get the search error message
var searchErrorMessage = $('#search-error');

//get the play pause button
var playPauseButton = $('#play-pause-button');

//used to store a bool if results from api call is found
var results;

//used to initialize the app
var init = false;

//start play pause button with play icon
playPauseButton.addClass('play-pause-button-paused');

//action when search form is used
searchForm.on('submit', function (event) {
  event.preventDefault();
  /* Act on the event */

  //create an object of all form values
  query = $(this).serializeArray();

  //get the typed value ( the artist the user searched for)
  query = query[0].value;

  //get the artist top tracks
  //@todo: use this later when an artist name is chosen
  getArtistTopTracks(query);

  if(results != false){
    createCoverFLow();
  }

  //log what the user searched for
  console.log('the query being searched for : ' + query);

  //clear the form
  $(this).trigger('reset');


  if(!init){
    init = true;
  }

  //start the app
  initApp();



});


//search spotify for chosen artist
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
    if( data.artists.items.length <= 0 ){
        console.log('no results');
        showSearchError();
        results = false;
        return;
    };
    //tell app that results have been found
    results = true;
    //order the artists by popularity to get the most common artist
    var artistPopularOrder = _.orderBy(data.artists.items, ['popularity'], ['desc']);
    //get the first artist with the highest popularity rating
    var popularArtist = artistPopularOrder[0];
    console.log(popularArtist);
    //display artist info in artist section
    createArtistInfo(popularArtist, data);
    return $.ajax({
      url: 'https://api.spotify.com/v1/artists/' + popularArtist.id + '/top-tracks',
      data: {
        country: 'CA'
      }
    })
  });
  a2.done(function (data) {
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
          playPauseAnimate();
          currentTrack = c;
        }
      });

    // set the element with current class as the global current track
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

//set the info for the artist container
function createArtistInfo(artist, data){
  console.log(data);
  // set background image with artist image
  if(artist.images.length > 0){
    $('#artist').css('background-image', 'url(' + artist.images[0].url + ')');
  }else{
    console.log('fix it');
  }
  $('.artist-info__name').text(artist.name);
  if(artist.followers.total){
    $('.followers__amount').text(artist.followers.total.toLocaleString());
    $('.followers__title').text('followers');
  }
}


//create the element to contain the track/album
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


//function to be called when clicking on the album cover
$(document).on('click', '.flipster__item--current', function (event) {
  event.preventDefault();
  // /* Act on the event */
  isPlaying = true;
  playSong($(this));
  playPauseAnimate();
});

//add click events when cover flow is clicked to commence the song to play
$(document).on('click', '#play-pause-button', function(event){
  songControl();
});

//add spacebar control for songs
document.body.onkeydown = function(e){
  if(e.keyCode == 32){
    //your code
    songControl();
  }
}

//remove the error message when starting to type in search form
$('#search').keypress(function(event) {
  /* Act on the event */
  searchErrorMessage.fadeOut('300');
});

//play the audio
function playSong(track) {
  //set the song source by the elements data-attribute
  var songUrl = $(track).attr('data-audio-url');
  currentAudio.src = songUrl;
  //enable the audio to strat playing
  currentAudio.play();
  //set playing to true
  isPlaying = true;
}

//store the track time globally for the current song to be used when resuming same song
function setTrackTime(audio){
  audio.currentTime = currentTrackTime;
  console.log(currentTrackTime + ': this is curent track time');
}

//pause the currently playing track
function pauseSong() {
  $(currentAudio).trigger('pause');
  isPlaying = false;
}

//display song title along with popularity score
function displayCurrentSongInfo(track){
  console.log($(track));
  console.log($(track).attr('data-track-title'));
  $('.current-song-title').text($(track).attr('data-track-title'));
  $('.current-song-popularity').text('popularity: ' + $(track).attr('data-track-popularity'));
}

//create the cover flow container and clear when new artist is searched
function createCoverFLow(){
  $('#coverflow').html('');
  $('#coverflow').append('<div class="my-flipster"><ul class="tracks" id="tracks"></ul></div>');

}

//enable the play button
function audioControls(){
  //if app is started by succesfully finding a result show the play button
  if(init){
    playPauseButton.show();
  }
}

//control the audio
function songControl(){
  if(currentAudio.paused || !(currentAudio.play)){
    playSong(currentTrack);
    playPauseAnimate();
    if(currentTrackTime > 0){
      setTrackTime(currentAudio);
    }
  }else if(currentAudio.play){
    console.log('pause');
    pauseSong();
    playPauseAnimate();
    currentTrackTime = currentAudio.currentTime;
  }
}

//animate the play/pause button
function playPauseAnimate(){
  playPauseButton.toggleClass('play-pause-button-paused');
  if(isPlaying){
    playPauseButton.removeClass('play-pause-button-paused');
  }
}

//show search artist error message (artist not found)
function showSearchError(){
  searchErrorMessage.fadeIn('fast');
}

//initialize app
function initApp(){
  audioControls();
}

// uncomment below to see cool bubbles in background
// must uncomment the canvas in index.html as well 

//bg animation
// var circles = [],
//     canvas = document.getElementById("canvas1"),
//     context = canvas.getContext("2d"),
//
//     // SETTINGS
//     opacity = 0.4,                                      // the opacity of the circles 0 to 1
//     colors = ['rgba(80, 80, 80,' + opacity + ')',       // an array of rgb colors for the circles
//               'rgba(111, 111, 111,' + opacity + ')',
//               'rgba(230, 230, 230,' + opacity + ')',
//               'rgba(200, 200, 200,' + opacity + ')',
//               'rgba(150, 150, 150,' + opacity + ')'
//              ],
//     minSize = 1,                                        // the minimum size of the circles in px
//     maxSize = 6,                                       // the maximum size of the circles in px
//     numCircles = 200,                                   // the number of circles
//     minSpeed = -2,                                     // the minimum speed, recommended: -maxspeed
//     maxSpeed = 6,                                    // the maximum speed of the circles
//     expandState = true;                                      // the direction of expansion
//
// function buildArray() {
//     'use strict';
//
//     for (var i =0; i < numCircles ; i++){
//         var color = Math.floor(Math.random() * (colors.length - 1 + 1)) + 1,
//             left = Math.floor(Math.random() * (canvas.width - 0 + 1)) + 0,
//             top = Math.floor(Math.random() * (canvas.height - 0 + 1)) + 0,
//             size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize,
//             leftSpeed = (Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed)/10,
//             topSpeed = (Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed)/10,
//             expandState = expandState;
//
//             while(leftSpeed == 0 || topSpeed == 0){
//                 leftSpeed = (Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed)/10,
//                 topSpeed = (Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed)/10;
//             }
//         var circle = {color:color, left:left, top:top, size:size, leftSpeed:leftSpeed, topSpeed:topSpeed, expandState:expandState };
//         circles.push(circle);
//     }
// }
//
// function build(){
//     'use strict';
//
//     for(var h = 0; h < circles.length; h++){
//         var curCircle = circles[h];
//         context.fillStyle = colors[curCircle.color-1];
//         context.beginPath();
//         if(curCircle.left > canvas.width+curCircle.size){
//             curCircle.left = 0-curCircle.size;
//             context.arc(curCircle.left, curCircle.top, curCircle.size, 0, 2 * Math.PI, false);
//         }else if(curCircle.left < 0-curCircle.size){
//             curCircle.left = canvas.width+curCircle.size;
//             context.arc(curCircle.left, curCircle.top, curCircle.size, 0, 2 * Math.PI, false);
//         }else{
//             curCircle.left = curCircle.left+curCircle.leftSpeed;
//             context.arc(curCircle.left, curCircle.top, curCircle.size, 0, 2 * Math.PI, false);
//         }
//
//         if(curCircle.top > canvas.height+curCircle.size){
//             curCircle.top = 0-curCircle.size;
//             context.arc(curCircle.left, curCircle.top, curCircle.size, 0, 2 * Math.PI, false);
//
//         }else if(curCircle.top < 0-curCircle.size){
//             curCircle.top = canvas.height+curCircle.size;
//             context.arc(curCircle.left, curCircle.top, curCircle.size, 0, 2 * Math.PI, false);
//         }else{
//             curCircle.top = curCircle.top+curCircle.topSpeed;
//             if(curCircle.size != maxSize && curCircle.size != minSize && curCircle.expandState == false){
//               curCircle.size = curCircle.size-0.1;
//             }
//             else if(curCircle.size != maxSize && curCircle.size != minSize && curCircle.expandState == true){
//               curCircle.size = curCircle.size+0.1;
//             }
//             else if(curCircle.size == maxSize && curCircle.expandState == true){
//               curCircle.expandState = false;
//               curCircle.size = curCircle.size-0.1;
//             }
//             else if(curCircle.size == minSize && curCircle.expandState == false){
//               curCircle.expandState = true;
//               curCircle.size = curCircle.size+0.1;
//             }
//             context.arc(curCircle.left, curCircle.top, curCircle.size, 0, 2 * Math.PI, false);
//         }
//
//         context.closePath();
//         context.fill();
//         context.ellipse;
//     }
// }
//
//
// var xVal = 0;
//
// window.requestAnimFrame = (function (callback) {
//     'use strict';
//     return window.requestAnimationFrame ||
//     window.webkitRequestAnimationFrame ||
//     window.mozRequestAnimationFrame ||
//     window.oRequestAnimationFrame ||
//     window.msRequestAnimationFrame ||
//     function (callback) {
//         window.setTimeout(callback, 1000/60);
//     };
// })();
//
// function animate() {
//     'use strict';
//     var canvas = document.getElementById("canvas1"),
//         context = canvas.getContext("2d");
//
//     // clear the canvas
//     context.clearRect(0, 0, canvas.width, canvas.height);
//
//
//     // draw the next frame
//     xVal++;
//     build();
//
//     //console.log("Prep: animate ==> requestAnimFrame");
//     // request a new frame
//     requestAnimFrame(function () {
//         animate();
//     });
// }
// window.onload = function () {
//     'use strict';
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     buildArray();
//     animate();
// };
//
//
// window.onresize = function () {
//     'use strict';
//     console.log("resize");
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     //buildArray();
//     animate();
// };
