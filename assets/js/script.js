(function($) {

  /* ----------------------------------------------------------
  
    ￼Size Adjust
  
  ---------------------------------------------------------- */

  $(window).on('resize.adjustHeight', function() {
    var winHeight = $(window).height(),
        maxHeight = winHeight,
        offsetHeight = $('.js-offset').outerHeight();
    if ($(window).width() > 980) {
      
      $('.js-wrapper').each(function() {
        var tmpHeight = $(this).outerHeight();
        if (maxHeight < tmpHeight) maxHeight = tmpHeight;
      });

      $('.js-wrapper').css('minHeight', maxHeight);
    } else {
      $('.js-wrapper').css('minHeight', 0);
    }
  }).trigger('resize.adjustHeight');

  /* ----------------------------------------------------------
  
    ￼New Window
  
  ---------------------------------------------------------- */

  $('a').each(function() {
    var href = $(this).attr('href');
    if (href.match(/^http/)) $(this).attr('target', '_blank');
  });

})(jQuery);