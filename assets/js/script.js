(function($) {

  $(window).on('resize.adjustHeight', function() {
    var winHeight = $(window).height(),
        offsetHeight = $('.js-offset').outerHeight();
    if ($(window).width() > 980) {
      console.log($('.js-wrapper').height());
      if ( winHeight > $('.js-wrapper').height() ) $('.js-wrapper').css('minHeight', winHeight - offsetHeight);
    } else {
      $('.js-wrapper').css('minHeight', 0);
    }
  }).trigger('resize.adjustHeight');


})(jQuery);