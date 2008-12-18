/* $Id$ */

Drupal.behaviors.imagefield_crop = function (context) { 
  $('#cropbox', context).Jcrop({
    onChange: showPreview, //<== only slows us down
    onSelect: setCoords,
    aspectRatio: Drupal.imagefield_crop.ratio,
    setSelect: getDimensions()
  });   

  function setCoords(c) {
    setDimensions(c.x, c.y, c.w, c.h);
      // REFACTOR: only show preview if user requested in widget settings
    //showPreview(c);
  };

  function showPreview(c) {
   
    var rx = Drupal.settings.imagefield_crop.preview.width / c.w;
    var ry = Drupal.settings.imagefield_crop.preview.height / c.h;
    
    $('.jcrop-preview', context).css({
      width: Math.round(rx * Drupal.settings.imagefield_crop.preview.orig_width) + 'px',
      height: Math.round(ry * Drupal.settings.imagefield_crop.preview.orig_height) + 'px',
      marginLeft: '-' + Math.round(rx * c.x) + 'px',
      marginTop: '-' + Math.round(ry * c.y) + 'px'
    });
      
  };
  // get select box dimensions from the form
  function getDimensions() {
    x =  parseInt($(".edit-image-crop-x", context).val()); 
    y =  parseInt($(".edit-image-crop-y", context).val());
    w =  parseInt($(".edit-image-crop-width", context).val());
    h =  parseInt($(".edit-image-crop-height", context).val());
    return [x, y, x+w, y+h];
  };

  function setDimensions(x, y, w, h) {
    $(".edit-image-crop-x", context).val(x);
    $(".edit-image-crop-y", context).val(y);
    if (w) $(".edit-image-crop-width", context).val(w);
    if (h) $(".edit-image-crop-height", context).val(h);
    $(".edit-image-crop-changed", context).val(1);
  };
};


