(function ($) {
  $('a').on('click', function(e) {
    e.preventDefault()
    console.log('clicked', $(this).attr('href'));
    let scrollOffset = 0
    if ($(this).is('a[href^="#"]') && $(this).attr('href').length >= 2) {
      $('html, body').animate({
        scrollTop: $($.attr(this, 'href')).offset().top + scrollOffset
      }, 1500);
      return false;
    }
  })
})(jQuery);