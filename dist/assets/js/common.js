/*!
  * Hello World v1.0.0 (https://github.com/ivan8i/hello-world)
  * Copyright 2013-2024 Ivan Yew / GongKia
  * Licensed under MIT (https://github.com/ivan8i/hello-world/blob/master/LICENSE)
  */
console.log('common');
// Feather Icons
feather.replace();
console.log('custom');
(function ($) {
  $('a').on('click', function (e) {
    e.preventDefault();
    console.log('clicked', $(this).attr('href'));
    var scrollOffset = 0;
    if ($(this).is('a[href^="#"]') && $(this).attr('href').length >= 2) {
      $('html, body').animate({
        scrollTop: $($.attr(this, 'href')).offset().top + scrollOffset
      }, 1500);
      return false;
    }
  });
})(jQuery);
//# sourceMappingURL=common.js.map
