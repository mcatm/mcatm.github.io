(function($) {

  $(window).on('resize.adjustHeight', function() {
    var winHeight = $(window).height(),
        offsetHeight = $('.js-offset').outerHeight();
    if ($(window).width() > 980) {
      $('.js-wrapper').css('minHeight', winHeight - offsetHeight);
    } else {
      $('.js-wrapper').css('minHeight', 0);
    }
  }).trigger('resize.adjustHeight');
  

})(jQuery);