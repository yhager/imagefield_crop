<?php

/**
 * @file
 * hook_file and imagefield_crop file functions.
 */
function imagefield_crop_file_insert($file) {
  // REFACTOR: Take cropping dimensions from the widget settings if possible
  list($width, $height) = explode('x', '500x500');

  // scale image for cropping
  if (imagefield_file_is_image($file)) {
    $info = image_get_info($file->filepath);
    if($info['width'] < $width || $info['height'] < $height) {
      $newfile = drupal_clone($file);
      file_copy($newfile->filepath, imagefield_crop_file_admin_crop_display_path($newfile));
    }
    else {
      image_scale($file->filepath, imagefield_crop_file_admin_crop_display_path($file), $width, $height);
    }
  }
}

function imagefield_crop_file_update($file) {
  // update admin thumbnail
  imagefield_file_insert($file);
}

function imagefield_crop_file_delete($file) {
  // delete admin thumbnail.
  if (imagefield_file_is_image($file))
    file_delete(imagefield_crop_file_admin_crop_display_path($file));
}

// create the path to the file to be used for displaying the crop interface.
function imagefield_crop_file_admin_crop_display_path($file) {
  //dsm($file);
  $file = (object)$file;
  return $file->filepath .'.crop_display.jpg';
}

// Original file to crop from
function imagefield_crop_file_admin_original_path($file) {
  // REFACTOR: Save original file and return it here. Using the displayed crop for convenience
  return imagefield_crop_file_admin_crop_display_path($file);
}
