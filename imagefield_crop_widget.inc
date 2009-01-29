<?php

// $Id$

// load imagefield widget, so we can extend it, and not fully replace it
module_load_include('inc','imagefield', 'imagefield_widget');


function imagefield_crop_widget_widget_settings_form($widget) {
  $form = imagefield_widget_widget_settings_form($widget);
  $form['collapsible'] = array(
    '#type' => 'radios',
    '#title' => t('Collapsible behavior'),
    '#options' => array(
      1 => t('None.'),
      2 => t('Collapsible, expanded by default.'),
      3 => t('Collapsible, collapsed by default.'),
    ),
    '#default_value' => isset($widget['collapsible']) ? $widget['collapsible'] : 2,
  );
  $form['resolution'] = array(
    '#type' => 'textfield', 
    '#title' => t('The resolution to crop the image onto'), 
    '#default_value' => isset($widget['resolution']) ? $widget['resolution'] : '200x150',
    '#size' => 15, 
    '#maxlength' => 10, 
    '#description' => 
    t('The output resolution of the cropped image, expressed as WIDTHxHEIGHT (e.g. 640x480). Set to 0 not to rescale after cropping. Note: output resolution must be defined in order to present a dynamic preview.'),
    '#element_validate' => array('_imagefield_crop_widget_settings_resolution_validate'),
  );
  $form['enforce_ratio'] = array(
    '#type' => 'checkbox',
    '#title' => t('Enforce box crop box ratio'),
    '#default_value' => isset($widget['enforce_ratio']) ? $widget['enforce_ratio'] : 1,
    '#description' => t('Check this to force the ratio of the output on the crop box. NOTE: If you leave this unchecked but enforce an output resolution, the final image might be distorted'),
    '#element_validate' => array('_imagefield_crop_widget_settings_enforce_ratio_validate'),
  );

  $form['croparea'] = array(
    '#type' => 'textfield',
    '#title' => t('The resolution of the cropping area'),
    '#default_value' => isset($widget['croparea']) ? $widget['croparea'] : '500x500',
    '#size' => 15,
    '#maxlength' => 10,
    '#description' => t('The resolution of the area used for the cropping of the image. Image will displayed at this resolution for cropping. Use WIDTHxHEIGHT format, zero values are permitted, e.g. 500x0 will limit crop box to 500 pixels width.'),
    '#element_validate' => array('_imagefield_crop_widget_settings_croparea_validate'),
  );
  
  $form['always_show'] = array( // REFACTOR: give a better name
    '#type' => 'checkbox',
    '#title' => t('Always show the cropping area'),
    '#default_value' => isset($widget['always_show']) ? $widget['always_show'] : 0,
    '#description' => t('Check this to show the cropping area even before the image is uploaded'),
  );

  return $form;
}

function _imagefield_crop_widget_settings_resolution_validate($element, &$form_state) {
  list($rw, $rh) = explode('x', $form_state['values']['resolution']);
  if ($form_state['values']['enforce_ratio'] &&
      (!is_numeric($rw) || intval($rw) != $rw || $rw <= 0 ||
       !is_numeric($rh) || intval($rh) != $rh || $rh <= 0)) {
    form_error($element, t('Target resolution must be defined as WIDTHxHEIGHT if resolution is to be enforced'));
  }
}

function _imagefield_crop_widget_settings_enforce_ratio_validate($element, &$form_state) {
  if ($form_state['values']['resolution'] && !$form_state['values']['enforce_ratio']) {
    drupal_set_message('Output resolution is defined, but not enforced. Final images might be distroted');
  }
}

function _imagefield_crop_widget_settings_croparea_validate($element,&$form_state) {
  if ($form_state['values']['croparea']) {
    list($cw, $ch) = explode('x', $form_state['values']['croparea']);
    if (!is_numeric($cw) || intval($cw) != $cw || $cw < 0 ||
        !is_numeric($ch) || intval($ch) != $ch || $ch < 0) {
      form_error($element, t('Crop area resolution must be defined as WIDTHxHEIGHT'));
    }
  }
}

function imagefield_crop_widget_widget_settings_validate($widget) {
  _imagefield_crop_verify_gd();
  // for some reason, filefield expects an array here. Make it happy. #357945
  return array();
}

function imagefield_crop_widget_widget_settings_save($widget) {
  $settings = array('collapsible', 'resolution', 'enforce_ratio', 'croparea', 'always_show'/*, 'use_unscaled'*/);
  return array_merge($settings, imagefield_widget_widget_settings_save($widget));
}

/**
 * FormAPI theme function. Theme the output of an image field.
 */
function theme_imagefield_crop_widget(&$element) {
//  dpm(__FUNCTION__ . "[{$element['#type']}]");
  
  return theme('form_element', $element, $element['#children']);
}

function imagefield_crop_widget_widget_process($element, $edit, &$form_state, $form) {

  $file = $element['#value'];

  $field = content_fields($element['#field_name'], $element['#type_name']);

  $module_path = drupal_get_path('module', 'imagefield_crop');

  drupal_add_js($module_path . '/Jcrop/js/jquery.Jcrop.js');
  drupal_add_css($module_path . '/Jcrop/css/jquery.Jcrop.css');

  if ($field['widget']['resolution']) {
    list($w, $h) = explode('x', $field['widget']['resolution']);

    // ratio is zero when not enforced
    $ratio = $field['widget']['enforce_ratio'] * $w/$h;
  }
  else {
    // no output resolution requested
    $ratio = 0;
  }

  if ($field['widget']['croparea']) {
    list($bwidth, $bheight) = explode('x', $field['widget']['croparea']);
  }
  else {
    $bwidth = $bheight = 0;
  }
  // for some reason, drupal_add_js(.., 'setting') does not work as expected
  drupal_add_js("Drupal.imagefield_crop = { ratio : $ratio, box_width: $bwidth, box_height: $bheight }", 'inline');
  drupal_add_js($module_path . '/imagefield_crop.js'); 

  $element['#collapsible'] = ($field['widget']['collapsible'] != 1);
  $element['#collapsed'] = ($field['widget']['collapsible'] == 3);

  $crop_attrs = array(
    'x'   => array('default' => 0),
    'y'   => array('default' => 0),
    'width'  => array('default' => $w ? $w : 50),
    'height' => array('default' => $h ? $h : 50),
    'changed' => array('default' => 0),
  );

  if (!empty($file)) {
    //$element['data']['#theme'] = 'imagefield_crop_edit_crop_image_row';
    //$element['data']['#croparea'] = $field['widget']['croparea'];
      
    if (is_file($file['filepath']) && (list($width, $height, $type, $image_attributes) = @getimagesize($file['filepath']))) {
      if ($field['widget']['enforce_ratio']) {
        //list($fw, $fh) = explode('x', $field['widget']['resolution']);
        //$ratio = $fw/$fh;
        $image_ratio = $width/$height;
        if ($ratio > $image_ratio) {
          $height = $width/$ratio;
        }
        else {
          $width = $height*$ratio;
        }
        // if the enforced ratio is different, force crop
        $crop_attrs['changed']['default'] = ($ratio != $image_ratio);
        
      }
      $crop_attrs['width']['default'] = $width;
      $crop_attrs['height']['default'] = $height;
    }

    $crop_display = $file;
    $crop_display['filepath'] = imagefield_crop_file_admin_crop_display_path($file);
    $element['data']['cropbox'] = array(
      '#type' => 'markup',
      '#value' => theme('imagefield_crop_cropbox', $crop_display, $crop_display['alt'], $crop_display['title'], NULL, FALSE),
    );
    
    $element['data']['crop'] = array(
      '#weight' => -10,
    );
    
    foreach ($crop_attrs as $attr => $value) {
      $element['data']['crop'][$attr] = array(
        '#type' => 'hidden',
        '#title' => $attr,
        '#size' => 4,
        '#maxlength' => 25,
        '#weight' => $value['weight'],
        '#attributes' => array('class' => 'edit-image-crop-'. $attr),
        '#value' => $file['data']['crop'][$attr] ? $file['data']['crop'][$attr] : $value['default'],
      );
    }
    
    /**
     * Show crop preview
     */
    if (!$edit) {
      // show only on non-posted forms. the theme function might add js settings which we do not want on
      // posted forms.
      $element['data']['crop-preview'] = array(
        '#type' => 'markup',
        '#value' => theme('imagefield_crop_dynamic_preview', $crop_display, $field['widget']['resolution']),
      );
    }    
  }
  else {
    if ($field['widget']['always_show']) {
      // just show croppable area, without any image
      $element['data'] = array(
        //'#theme' => 'imagefield_crop_edit_crop_image_row', 
        //'#croparea' => $field['widget']['croparea'],
      );
      $element['data']['cropbox'] = array(
        '#type' => 'markup',
        /* REFACTOR: use different theme based on croppable widget settings */
        '#value' => theme('imagefield_crop_cropbox', NULL, '', '', NULL, FALSE),
      );
    }
  }
  return $element;
}

function imagefield_crop_widget_widget_value($element, $edit = FALSE) {
  if ($edit) {
    $file = field_file_load($edit['fid']);
    $field = content_fields($element['#field_name'], $element['#type_name']);
    
    $crop = $edit['data']['crop'];
    if ($crop['changed']) {
      // save crop time, for preview
      variable_set('imagefield_crop_query_string', REQUEST_TIME);
      _imagefield_crop_resize(imagefield_crop_file_admin_original_path($file),
                              $crop,
                              $field['widget']['resolution'],
                              $file['filepath']);
    }
  }

  return array();
}

function imagefield_crop_widget_widget_validate($element) {
  // Check if crop values are not empty
}


function theme_imagefield_crop_cropbox($file = NULL, $alt = '', $title = '', $attributes = NULL, $getsize = TRUE) {
  // REFACTOR: consider multiple images
  $attributes = array_merge((array)$attributes + array('id' => 'cropbox'));
  return theme('imagefield_image', $file, $alt, $title, $attributes, $getsize);
}


function theme_imagefield_crop_dynamic_preview($file, $resolution) {
  $file = (array)$file;
  if (!is_file($file['filepath'])) {
    return '<!-- file not found: '. $file['filepath'] .' -->';
  }
  list($widget_width, $widget_height) = explode('x', $resolution);
  
  $image_attributes = array();
  if (list($width, $height, $type, $image_attributes) = @getimagesize($file['filepath'])) {
    $alt = $file['alt'] ? $alt : 'jcrop preview';
    $title = $file['title'] ? $title : '';
    $url = file_create_url($file['filepath']);
    $settings = array(
      'imagefield_crop' => array(
        'preview' => array(
          'orig_width' => $width,
          'orig_height' => $height,
          'width' => $widget_width,
          'height' => $widget_height,
        ),
      ),
    );
    // REFACTOR: Support multiple fields (i.e. add element delta to setting array)
    drupal_add_js($settings, 'setting');
    return '<div class="jcrop-preview-wrapper" style="width:'. $settings['imagefield_crop']['preview']['width'] .'px;height:'. $settings['imagefield_crop']['preview']['height'] .'px;overflow:hidden;"><img src="'. check_url($url) .'" alt="'.
      check_plain($alt) .'" title="'. check_plain($title) .'" class="jcrop-preview" /></div>';
  }
  return '<!-- could not get imagesize, possibly corrupt or non image. '. $file['filepath'] .' -->';

  
}

function _imagefield_crop_resize($src, $crop = NULL, $resize = 0, $dst = NULL) {
  if (!is_file($src)) {
    return FALSE;
  }

/**
 * The drupal image API is not good enough:
 * 1. It enforces file saving between operations
 * 2. In case of lossy compression (jpeg) quality is reduced on every action (http://drupal.org/node/128963)
 *
 * ==> REFACTOR: Use drupal 6 image toolkit functions instead
 */
  if (!_imagefield_crop_verify_gd()) {
    return FALSE;
  }
  
  $info = image_get_info($src);

  if (!$info) {
    return FALSE;
  }

  // if an unscaled version of the image exists, we should use it for cropping
  $unscaled = $src .'.unscaled';
  if (is_file($unscaled)) {
    $unscaled_info = image_get_info($unscaled);
    $scale=array();
    $scale['width'] = $unscaled_info['width']/$info['width'];
    $scale['height'] = $unscaled_info['height']/$info['height'];
    if (!empty($crop)) {
      $crop['x'] *= $scale['width'];
      $crop['y'] *= $scale['height'];
      $crop['width'] *= $scale['width'];
      $crop['height'] *= $scale['height'];
    }
    $src = $unscaled;
    $info = $unscaled_info;
  }
  

 // find the final image dimensions
  list($width, $height) = array($info['width'], $info['height']);
  if ($resize) {
    list($width, $height) = explode('x', $resize);
  }
  elseif (!empty($crop)) {
    list($width, $height) = array($crop['width'], $crop['height']);
  }

  /* REFACTOR: Don't scale up */

  $im = image_gd_open($src, $info['extension']);
  $res = imageCreateTrueColor($width, $height);
  $background = imageColorAllocate($res, 255, 255, 255);

  imageCopyResampled($res, $im,
                     0, 0,
                     $src_x = $crop['x'] ? $crop['x'] : 0, $src_y = $crop['y'] ? $crop['y'] : 0,
                     $width, $height,
                     $src_w = $crop['width'] ? $crop['width'] : $info['width'],
                     $src_h = $crop['height'] ? $crop['height'] : $info['height']);
  $ratio_w = $width/$src_w;
  $ratio_h = $height/$src_h;

  /**
   * Fill background around the image if required.
   * Note that if it is not required, the rectangles are outside of the
   * image boundaries anyway.
   * REFACTOR: verify which is better in performance - with conditionals or w/o
   * REFACTOR: This was a feature in the original implementation, but probably not needed anymore
   */
  /* bottom */
  imageFilledRectangle($res, 0, $ratio_h*($info['height']-$src_y),
                       $width, $height, $background);
  /* right */
  imageFilledRectangle($res, $ratio_w*($info['width']-$src_x), 0,
                       $width, $height, $background);
  /* top */
  if ($src_y<0) {    
    imageFilledRectangle($res, 0, 0,
                         $width, $ratio_h*(-1)*$src_y, $background);
  }
  /* left */
  if ($src_x<0) {
    imageFilledRectangle($res, 0, 0,
                         $ratio_w*(-1)*$src_x, $height, $background);
  }
  
  $result = image_gd_close($res, empty($dst) ? $src : $dst, $info['extension']);
  imageDestroy($im);
  imageDestroy($res);
  return $result;
}

