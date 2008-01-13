$Id$

= Overview =
imagefield_crop provides a widget for cropping an image after upload.


= Usage =
When the user uploads an image, the image is presented inside a cropping area. A cropping box is show inside, and the user can resize and move it. Upon clicking 'preview' or 'submit', the image is cropped and the result is saved within the node.


= Prerequisites =
The imagefield_crop module uses interface elements library to implement the resize interface. The following modules are required:
* jquery_interface (which by itself requires jquery_update).
* imagefield (since imagefield_crop is just an image widget module, not a field module)


= Installation =

* Install the module and enable it.
* Then on the image field configuration page (admin/content/types/<content_type>/fields/<your_image_field>) choose the 'Image with cropping' widget.
* Save your field, and edit it again. There you can see the widget settings form where you can choose the cropping box size, and other configuration options.
* Upon uploading an image, or editing an existing node, the image cropping interface will be presented.


= Issues that you could help with =

* Sometimes you will need to use the 'refresh' button on your browser to see the updated image. I haven't tracked this down yet and help will be appreciated.
* Only one widget per page is supported (no multiple values, no multiple fields with this widget in the node). This is mostly a limitation of the javascript part of this module, and help here will be appreciated.
* The module requires the PHP GD library, and will not work if any other library is selected. I believe this limitation can be removed for Drupal 6, where the drupal image library is improved.
