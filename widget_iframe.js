window.onmessage = function(event) {
  if (event.data === "close") {
    $('#widget').remove();
  }
};

$(document).ready(function() {
    // We need to specify the full URL of the widget. We could work around this with document.currentScript, but there's not enough browser support yet..
    $(".course-content").append('<iframe id="widget" src="http://egbertbouman.github.io/billy-radio/widget.html" scrolling="no" marginheight="0" marginwidth="0" style="position: fixed; bottom: 10px; right: 10px; z-index: 999; height: 100px; width: 370px; border: none;"></iframe>');

    var course = $$course_id;
    var user = $('.user-link > div').text().trim();
    console.log('course=' + course + '; user=' + user);
});
