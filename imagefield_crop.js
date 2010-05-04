/* $Id$ */

var cropIds = new Array();

function imagefieldCropSetDimensions(cropId, x, y, w, h) {
  var context = $('#imagefield-edit-image-row-' + cropId);
  $(".edit-image-crop-x", context).val(x);
  $(".edit-image-crop-y", context).val(y);
  if (w) $(".edit-image-crop-width", context).val(w);
  if (h) $(".edit-image-crop-height", context).val(h);
}

function imagefieldCropInit(cropId) {
  var containerpos;
  var resizeT;
  var dragT;
  var changed = false;
  var context = $('#imagefield-edit-image-row-' + cropId);

  if ($("#image-crop-container-" + cropId).size()) {
    containerpos = findPos($("#image-crop-container-" + cropId).get(0));
  }
  else {
    containerpos = {x:0, y:0};
  }

  function findPos(obj, cropId) {
    var curleft = obj.offsetLeft || 0;
    var curtop = obj.offsetTop || 0;
    while (obj = obj.parent) {
      curleft += obj.offsetLeft
      curtop += obj.offsetTop
    }
    return {x:curleft,y:curtop};
  }

  $('#resizeMe-' + cropId).ready(function() {
    // this is needed to set the box initially according to the form values 
    var obj = $('#resizeMe-' + cropId).get(0);
    var newpos = {
      left: parseInt($(".edit-image-crop-x", context).val()), 
      top:  parseInt($(".edit-image-crop-y", context).val())
    }
    var newsize = {
      width:  parseInt($(".edit-image-crop-width", context).val()), 
      height: parseInt($(".edit-image-crop-height", context).val())
    }
    if ($('#resizeMe-' + cropId).size()) {
      obj.style.backgroundPosition = (-1)*newpos.left + 'px ' + (-1)*newpos.top + 'px';
      obj.style.left = (newpos.left + containerpos.x) + 'px';
      obj.style.top  = (newpos.top  + containerpos.y) + 'px';
      obj.style.width = newsize.width + 'px';
      obj.style.height  = newsize.height + 'px';
    }
  });
  $('#resizeMe-' + cropId).Resizable(
    {
      minWidth: 20,
      minHeight: 20,
      maxWidth: 1 + $('#resizeMe-' + cropId).parents('.imagefield-crop-wrapper').width(),
      maxHeight: 1 + $('#resizeMe-' + cropId).parents('.imagefield-crop-wrapper').height(),
      minTop: 1,
      minLeft: 1,
      maxRight: $('#resizeMe-' + cropId).parents('.imagefield-crop-wrapper').width(),
      maxBottom: $('#resizeMe-' + cropId).parents('.imagefield-crop-wrapper').height(),
      dragHandle: true,
      ratio: eval ('Drupal.' + 'imagefield_crop_' + cropId.substring(0,cropId.indexOf('-')) + '.ratio'),
      onDrag: function(x, y)
      {
        clearTimeout(dragT);
        if (!changed) {
          changed = true;
          $(".edit-image-crop-changed", context).val(1);
        }
        this.style.backgroundPosition = ((-1)*(x - containerpos.x)) + 'px ' + ((-1)*(y - containerpos.y)) + 'px';
        xx = x-containerpos.x;
        yy = y-containerpos.y;
        dragT = setTimeout('imagefieldCropSetDimensions ("' + cropId + '",' + xx + ',' + yy + ')', 200);
      },
      handlers: {
        se: '#resizeSE-' + cropId,
        e: '#resizeE-' + cropId,
        ne: '#resizeNE-' + cropId,
        n: '#resizeN-' + cropId,
        nw: '#resizeNW-' + cropId,
        w: '#resizeW-' + cropId,
        sw: '#resizeSW-' + cropId,
        s: '#resizeS-' + cropId
      },

      onResize : function(size, position) {
        clearTimeout(resizeT);
        if (!changed) {
          changed = true;
          $(".edit-image-crop-changed", context).val(1);
        }
        this.style.backgroundPosition = ((-1)*(position.left - containerpos.x)) + 'px ' + ((-1)*(position.top - containerpos.y)) + 'px';
        x = position.left-containerpos.x;
        y = position.top-containerpos.y;
        w = size.width;
        h = size.height;
        resizeT = setTimeout('imagefieldCropSetDimensions ("' + cropId + '", ' + x + ',' + y + ',' + w + ',' + h + ')', 200);
      }

    }
  );
}

var imageFieldCropInterval;
function imageFieldCropGo(cropId) {
  if ($("#image-crop-container-" + cropId).is(':visible')) {
    clearInterval(imageFieldCropInterval);
    imagefieldCropInit(cropId);
  }
}

function imageFieldCropBind(cropId) {
  $('fieldset.collapsible > legend a').click(function(event) {
    var $target = $(event.target);
    if ($target.parents('fieldset').find('#image-crop-container-' + cropId).length > 0) {
      imageFieldCropInterval = setInterval('imageFieldCropGo("' + cropId + '")', 300);
    }
  });
}

$(document).ready(function(){
  divs = document.getElementsByTagName("div");
  if (divs) {
    for (var i = 0; i < divs.length; i++) {
      if (divs[i].id.indexOf("image-crop-container") > -1) {
        cropId = divs[i].id.substr(21);
        cropIds[cropIds.length] = cropId;
        imageFieldCropGo(cropId);
        // We have to bind using a timeout, since the object is created after page load
        // Do we need setInterval here instead?
        setTimeout('imageFieldCropBind("' + cropId + '")', 200);
      }
    }
  }
});
