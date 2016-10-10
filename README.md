# Billy-radio
Billy-radio provides an edX widget for listening to a Billy radio station.


### Installation
To install the Billy-radio widget, first login in to the edX course management system. Next, go to the course for which you would like to use the Billy-radio widget. Go to Content > Files & Uploads and upload frames.html. Finally, add the following piece of JavaScript somewhere on the main page of your course:

``
<a id="mooc-radio-link"></a><script src="http://egbertbouman.github.io/billy-radio/widget.js"></script>
``

This will create a link to the Billy-radio widget.


### Display modes
Billy-radio is available in two different display modes:
* As a pop-up separate from edx.
* As an iframe displayed on top of edX.

The display mode is automatically selected by Billy-radio, depending on which features your browser supports.


### How iframe mode works
If you have a recent browser, Billy-radio will likely load as an iframe. In iframe mode the widget is placed on top of edX using 2 iframes:
* One iframe for browsing edX. This iframe is sandboxed to prevent edX from breaking out of the iframe.
* One iframe for showing the widget.

Note: We can't put edX in an iframe is we are hosting the parent html file on a different domain. This is due to the ```X-Frame-Options: ORIGIN``` header being set by the server. Luckily, we can work around this by uploading frames.html to edX (see the installation section), and using this to display the widget.


### Billy-radio in action
![Billy-radio screenshot](/doc/billy-radio-screenshot.jpg?raw=true)


# Acknowledgements
This work has received partial funding from the European Union's Seventh Framework Programme (FP7/2007-2013) under grant agreement n° 610594 CrowdRec.
