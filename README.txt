$Id$

= Overview =
imagefield_crop provides a widget for cropping an image after upload.


= Usage =
When the user uploads an image, the image is presented inside a cropping area.
A cropping box is shown inside, and the user can resize and move it. Upon
clicking 'preview' or 'submit', the image is cropped and the result is saved
within the node.

Watch the screencast[1] by capellic[2]

  [1] http://capellic.com/blog/imagefield-crop
  [2] http://drupal.org/user/192467

= Features =

* Dynamic preview is presented during cropping
* Original image is displayed every time for re-cropping
* The original image is used for cropping, for best quality
* Ability to define the crop interface resolution
* Ability to define the output image resolution and enforce it


= Prerequisites =
* imagefield (http://drupal.org/project/imagefield)
* filefield (http://drupal.org/project/filefield)
* imageapi (http://drupal.org/project/imageapi)
* Graphics processing engine (gd, imagemagick, or anything else imageapi.module can work with).


= Installation =
* To install the module copy the 'imagefield_crop' folder to your sites/all/modules directory.
* Go to admin/build/modules. Enable the module.
  Read more about installing modules at http://drupal.org/node/70151


= Configuration and usage =
* We assume that you have already created a new content type. Edit your content type fields at admin/content/types
* Click on appropriate MANAGE FIELDS link.
* Add a new field. To do so click on SELECT A FIELD TYPE dropdown menu. Select FILE. Click on FILE UPLOAD dropdown menu. Select IMAGE WITH CROPPING.
* Click on SAVE button.
* Follow instructions on the next page. You can choose the cropping box size, and other configuration options. If unsure leave default configuration. Click on SAVE FIELD SETTINGS button.
* Create a new item at /node/add
* Click on BROWSE button. Select an image.
* Click on UPLOAD button
* Upon uploading an image, or editing an existing node, the image cropping interface will be presented.


= Contribute. Report issue. Request support. Request new feature. =
* Go to the module issue queue at http://drupal.org/project/issues/imagefield_crop?status=All&categories=All
* Click on CREATE A NEW ISSUE link.
* Fill the form.
* To get a status report on your request go to http://drupal.org/project/issues/user

