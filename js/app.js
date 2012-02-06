var App = Em.Application.create({
  ready: function() {
    urlParams = getQueryString();
    for (key in urlParams) {
      App.videosController.createVideo('http://youtube.com/watch?v=' + urlParams[key]);
    }
  }
});

App.Video = Em.Object.extend({
  url: null,
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
  createVideo: function(url) {
    var video = App.Video.create({url: url});
    this.pushObject(video);
  },
  toQueryString: function() {
    // Convert all the videos to a query string in the format v1=<video1-ID>&v2=<video2-ID>...
    var linkstring = 'http://tangletube.com?';
    this.forEach(function(item, index) {
      linkstring += 'v' + index + '=' + item.get('videoid') + '&';
    }, this);
    return linkstring;
  }.property('@each.url')
});

App.AddVideoView = Em.View.extend({
  tagName: 'form',
  classNames: ['form-inline'],
  submit: function() {
    event.preventDefault();
    url = this.$('#linkfield').val();
    if (url) {
      App.videosController.createVideo(this.$('#linkfield').val());
      this.$('#linkfield').val('').focus();
    } else {
      alert('Please enter a valid YouTube video URL.');
    }
  }
});

App.VideoView = Em.View.extend({
  tagName: 'li',
  didInsertElement: function() {
    videoid = this.get('video').get('videoid');
    $('#videos li#' + this.get('elementId')).tubeplayer({
      width: 470,
      height: 270,
      initialVideo: videoid
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
