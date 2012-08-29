;(function( $, window, document, undefined ){

  var ThumbnailMode = function(el, options){
      this.el = el;
      this.options = options;
      
      // bind all prototype functions to the main object
      _.bindAll(this);
  };

  // the plugin prototype
  ThumbnailMode.prototype = {
    defaults: {
      createTriggerEl: false,
      $toggle: undefined,
      $targetContainer: undefined,
      callback: null,
      manualDestination: false,
      thumbName: null,
      thumbDestinationName: null
    },

    init: function() {
      // Introduce defaults that can be extended either
      // globally or using an object literal.
      this.opts = $.extend({}, this.defaults, this.options);
      console.log(this.opts);
      // declare base DOM elements
      this.state = {
        isOpen: false
      };
      this.$ul = $(this.el).find('ul');
      this.$lis = this.$ul.find('li');
      this.$container = $(this.opts.$targetContainer);
      this.$toggle = $(this.opts.$toggle);

      this.renderContainer();

      // if using manual thumbnail selection, init
      if (this.opts.manualDestination) { // make sure the callback is a function
        this.getManualThumbnails();
      } else {
        this.getAllThumbnails();
      }

      this.buildThumbnails();
      this.initToggle();

      // init callback if defined as function
      if (this.opts.callback && typeof this.opts.callback == 'function') { // make sure the callback is a function
        this.initThumbnailCallback();
      };

      return this;
    },

    renderContainer: function () {
      var containerHTML = 
      '<div class="thumbnailsWrapper">' +
        '<ul class="thumbnailsList">' +
        '</ul' +
      '</div'

      this.opts.$targetContainer.append(containerHTML);
      this.$overlay = $('.thumbnailsWrapper');
    },

    getAllThumbnails: function () {
      var _this = this;
      var _n = 0;
      this.thumbnailsData = [];

      var imagesToThumbnail = _this.$ul.find('img');
      imagesToThumbnail.each(function () {
        thumbnailObj = {
          src: $(this).attr('src'),
          page: $(this).closest('li').index() + 1,
          alt: $(this).attr('alt')
        }
        _this.thumbnailsData.push(thumbnailObj);
      });
    },

    getManualThumbnails: function () {
      var _this = this;
      var _n = 0;
      this.thumbnailsData = [];

      var imagesToThumbnail = _this.$ul.find('img[' + this.opts.thumbName + ']');

      imagesToThumbnail.each(function () {
        var _destination = $(this).attr(_this.opts.thumbName);
        thumbnailObj = {
          src: $(this).attr('src'),
          page: _this.$ul.find('[' + _this.opts.thumbDestinationName + '=' + _destination + ']').index() + 1,
          alt: $(this).attr('alt')
        }
        _this.thumbnailsData.push(thumbnailObj);
      });

    },

    buildThumbnails: function () {
      var _this = this;

      var thumbnailTemplate = '' +
        '{{#thumbs}}' +
        '<li class="thumb" data-page="{{page}}">' +
          '<img src={{src}} alt={{alt}} />' +
        '</li>' +
        '{{/thumbs}}'

      var thumbnailsData = {
        thumbs: _this.thumbnailsData
      };

      var thumbnailsHTML = Mustache.to_html(thumbnailTemplate, thumbnailsData);

      _this.$container.find('.thumbnailsList').html(thumbnailsHTML);
    },

    initToggle: function () {
      var _this = this;
      _this.$toggle.on('click', function () {
        if (_this.state.isOpen) {
          _this.close();
        } else {
          _this.open();
        }
      });
    },

    open: function () {
      var _this = this;
      _this.$overlay.show();
      _this.state.isOpen = true;
      setTimeout(function () {
        _this.$overlay.addClass('open');
      }, 300);

      // trigger the open event on the container
      $(this).trigger('thumbnail-mode-open');
    },

    close: function () {
      var _this = this;
      _this.state.isOpen = false;
      _this.$overlay.removeClass('open');
      setTimeout(function(){
        _this.$overlay.hide();
      }, 1200);
    },

    initThumbnailCallback: function () {
      var _this = this;
      $('.thumbnailsList').on('click', 'li', function (li) {
        _this.state.$selectedThumb = $(this);
        _this.opts.callback.call(_this);
      });
    }

  };

  ThumbnailMode.defaults = ThumbnailMode.prototype.defaults;

  $.fn.thumbnailMode = function(options, callback) {
    var callback = callback ? callback : null;
    return new ThumbnailMode(this, options, callback).init();
  };

})( jQuery, window , document );