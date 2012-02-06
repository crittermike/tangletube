(function($){

  var Video = Backbone.Model.extend({
    defaults: {
      url: 'http://www.youtube.com/watch?v=8X-nzihGVH8',
    },
    linkToID: function(){
      url = this.get('url');
      if (url == '') {
        return '8X-nzihGVH8'; 
      }
      var video_id = url.split('v=')[1];
      var ampersandPosition = video_id.indexOf('&');
      if(ampersandPosition != -1) {
        video_id = video_id.substring(0, ampersandPosition);
      }
      return video_id;
    }
  });
  
  var VideoList = Backbone.Collection.extend({
    model: Video
  });

  var VideoView = Backbone.View.extend({
    tagName: 'li', 
    events: { 
      'click span.delete': 'remove'
    },    
    initialize: function(){
      _.bindAll(this, 'render', 'remove'); 

      this.model.bind('change', this.render);
    },
    render: function(){
      var videoid = this.model.linkToID();
      $(this.el).html('<div class="player" id="' + videoid + '"></div>');

      var linkstring = 'http://tangletube.com/?';
      var vidcount = 1;
      $('.player').each(function() {
        linkstring += 'v' + vidcount + '=' + $(this).attr('id') + '&';
        vidcount++;
      });
      linkstring += 'v' + vidcount + '=' + videoid + '&';
      $('#linkinput').val(linkstring);

      return this; 
    },
    remove: function(){
      $(this.el).remove();
    }
  });
  
  var VideoListView = Backbone.View.extend({
    el: $('#videos'), 
    events: {
      'submit #addform': 'addItem',
      'click #playbutton': 'playAll',
      'click #pausebutton': 'pauseAll',
      'click #rewindbutton': 'rewindAll'
    },
    initialize: function(){
      _.bindAll(this, 'render', 'addItem', 'appendItem', 'playAll', 'pauseAll', 'rewindAll');
      
      this.collection = new VideoList();
      this.collection.bind('add', this.appendItem); 
      this.render();

      urlParams = getQueryString();
      var i = 0;
      for (key in urlParams) {
        var vid = new Video();
        vid.set({ 
          url: 'http://youtube.com/watch?v=' + urlParams[key]
        });
        this.collection.add(vid);
      }
      
    },
    render: function(){
      var self = this;
      $(this.el).append("<ul></ul>");
      _(this.collection.models).each(function(item){ // in case collection is not empty
        self.appendItem(item);
      }, this);
    },
    addItem: function(){
      if ($('#linkfield').val() == '') {
        alert('Please paste in a YouTube link.');
        return;
      }
      var vid = new Video();
      vid.set({
        url: $('#linkfield').val()
      });
      $('#linkfield').val('');
      this.collection.add(vid);
    },
    appendItem: function(video){
      var vidView = new VideoView({
        model: video
      });
      $('ul', this.el).append(vidView.render().el);
      $('#' + video.linkToID()).tubeplayer({
        width: 470,
        height: 270,
        initialVideo: video.linkToID()
      });
    },
    playAll: function() {
      $('.player').each(function(){
        $(this).tubeplayer('play');
      });
    },
    pauseAll: function() {
      $('.player').each(function(){
        $(this).tubeplayer('pause');
      });
    },
    rewindAll: function() {
      $('.player').each(function(){
        $(this).tubeplayer('seek', 0);
      });
    },
  });

  var videoListView = new VideoListView();
})(jQuery);

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
