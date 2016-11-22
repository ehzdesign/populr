var query;
//make an audio object
var currentSong = new Audio();
//set the type of search we are doing (artis, album or track);
var queryType = 'artist';
//store the popluar artist searched in order to use the ID
// var popularArtist;
//store the popular artist
var $searchForm = $('#search-form');
$searchForm.on('submit', function (event) {
    event.preventDefault();
    /* Act on the event */
    //create an object of all form values
    query = $(this).serializeArray();
    //get the typed value ( the artist the user searched for)
    query = query[0].value;
    //log what the user searched for
    console.log('the artist the user searched for : ' + query);
    $(this).trigger('reset');
    $('#popular-tracks').html('');
    var a1 = $.ajax({
        //search the database with users requested artist
        url: 'https://api.spotify.com/v1/search'
        , data: {
            q: query
            , type: queryType
            , limit: 50
        }
    });
    var a2 = a1.then(function (data) {
        console.log(data.artists.items);
        var artistPopularOrder = _.orderBy(data.artists.items, ['popularity'], ['desc']);
        var popularArtist = artistPopularOrder[0];
        console.log(popularArtist);
        return $.ajax({
            url: 'https://api.spotify.com/v1/artists/' + popularArtist.id + '/top-tracks'
            , data: {
                country: 'CA'
            }
        })
    });
    a2.done(function (data) {
        console.log(data)
        showTopAlbums(data);
    });
});

function showTopAlbums(albums) {
    $.each(albums.tracks, function (index, el) {
        createTrackItem(el);
    });
};

function createTrackItem(track) {
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
    $(trackHtml).appendTo('#popular-tracks');
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
// <div class="track">
//   <img src="#" alt="" class="track__image">
//   <p class="track__title"></p>
//   <p class="track__number"></p>
//   <p class="popularity"></p>
//   <!-- add a preview url button -->
//   <p class="track__album"></p>
// </div>
//random bg images
var images = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpeg', '6.jpeg', '7.jpeg', '8.jpeg'];
$('body').css({
    'background': 'url(img/' + images[Math.floor(Math.random() * images.length)] + ')'
});