var App = Em.Application.create({
  ready: function() {
    // Here, we check to see if there's data in the query string about vidoes, and if so, create them.
    count = 0;
    urlParams = getQueryString();
    // Loop through all the videos in the query string.
    while ('vid' + count in urlParams) {
      // For each one, grab its URL, volume, and start time, then create it.
      video = 'http://youtube.com/watch?v=' + urlParams['vid' + count];
      volume = urlParams['vol' + count];
      time = urlParams['time' + count];
      App.videosController.createVideo(video, volume, time, true);
      count++;
    }
  }
});

App.Video = Em.Object.extend({
  url: null,
  volume: 100,
  time: 0,
  autoplay: false,
  videoid: function() {
    // Convert the video's URL to its 11-digit YouTube ID.
    var id = this.get('url').split('v=')[1];
    var ampersandPosition = id.indexOf('&');
    if(ampersandPosition != -1) {
      id = id.substring(0, ampersandPosition);
    }
    return id;
  }.property('url')
});

App.videosController = Em.ArrayProxy.create({
  content: [],
  createVideo: function(url, volume, time, autoplay) {
    var video = App.Video.create({url: url, volume: volume, time: time, autoplay: autoplay});
    this.pushObject(video);
  },
  toQueryString: function() {
    // Convert all the videos to a query string in the format v1=<video1-ID>&v2=<video2-ID>...
    // This is used for generating shareable links.
    var linkstring = 'http://tangletube.com?';
    this.forEach(function(item, index) {
      linkstring += 'vid' + index + '=' + item.get('videoid') + '&';
      linkstring += 'vol' + index + '=' + item.get('volume') + '&';
      linkstring += 'time' + index + '=' + item.get('time') + '&';
    }, this);
    return linkstring;
  }.property('@each.url')
});

App.AddVideoView = Em.View.extend({
  addVideo: function() {
    event.preventDefault();
    if ($('#videoInput').val()) {
      App.videosController.createVideo($('#videoInput').val(), $('#volumeInput').val(), $('#timeInput').val(), false);
      $('#videoInput').val('').focus();
    } else {
      alert('Please enter a valid YouTube video URL.');
    }
  }
});

App.VideoView = Em.View.extend({
  tagName: 'li',
  didInsertElement: function() {
    var elid = this.get('elementId');
    video = this.get('video');
    $('#videos li#' + elid).tubeplayer({
      width: 470,
      height: 270,
      initialVideo: video.get('videoid'),
      start: video.get('time'),
      volume: video.get('volume'),
      autoPlay: video.get('autoplay')
    });
  },
  delete: function() {
    App.videosController.removeObject(this.get('video'));
  }
});

App.VideoControlsView = Em.View.extend({
  rewind: function() {
    $('#videos li').each(function(){
      $(this).tubeplayer('seek', 0);
    });
  },
  pause: function() {
    $('#videos li').each(function(){
      $(this).tubeplayer('pause');
    });
  },
  play: function() {
    $('#videos li').each(function(){
      $(this).tubeplayer('play');
    });
  }
});

function getQueryString() {
  var urlParams = {};
  var e,
      a = /\+/g,  // Regex for replacing addition symbol with a space
      r = /([^&=]+)=?([^&]*)/g,
      d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
      q = window.location.search.substring(1);
  while (e = r.exec(q))
    urlParams[d(e[1])] = d(e[2]);
  return urlParams;
};
