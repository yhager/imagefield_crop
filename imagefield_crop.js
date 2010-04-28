/* $Id$ */

var cropIds = new Array();

function imagefieldCropSetDimensions(cropId, x, y, w, h) {
  $('#resizeMe_' + cropId).parents('#imagefield-edit-image-row').find(".edit-image-crop-x").val(x);
  $('#resizeMe_' + cropId).parents('#imagefield-edit-image-row').find(".edit-image-crop-y").val(y);
  if (w) $('#resizeMe_' + cropId).parents('#imagefield-edit-image-row').find(".edit-image-crop-width").val(w);
  if (h) $('#resizeMe_' + cropId).parents('#imagefield-edit-image-row').find(".edit-image-crop-height").val(h);
}

function imagefieldCropInit(cropId) {
  var containerpos;
  var resizeT;
  var dragT;
  var changed = false;
  if ($("#image-crop-container_" + cropId).size()) {
    containerpos = findPos($("#image-crop-container_" + cropId).get(0));
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

  $('#resizeMe_' + cropId).ready(function() {
    // this is needed to set the box initially according to the form values 
    var obj = $('#resizeMe_' + cropId).get(0);
    var newpos = {
      left: parseInt($('#resizeMe_' + cropId).parents('#imagefield-edit-image-row').find(".edit-image-crop-x").val()), 
      top:  parseInt($('#resizeMe_' + cropId).parents('#imagefield-edit-image-row').find(".edit-image-crop-y").val())
    }
    var newsize = {
      width:  parseInt($('#resizeMe_' + cropId).parents('#imagefield-edit-image-row').find(".edit-image-crop-width").val()), 
      height: parseInt($('#resizeMe_' + cropId).parents('#imagefield-edit-image-row').find(".edit-image-crop-height").val())
    }
    if ($('#resizeMe_' + cropId).size()) {
      obj.style.backgroundPosition = (-1)*newpos.left + 'px ' + (-1)*newpos.top + 'px';
      obj.style.left = (newpos.left + containerpos.x) + 'px';
      obj.style.top  = (newpos.top  + containerpos.y) + 'px';
      obj.style.width = newsize.width + 'px';
      obj.style.height  = newsize.height + 'px';
    }
  });
  $('#resizeMe_' + cropId).Resizable(
    {
      minWidth: 20,
      minHeight: 20,
      maxWidth: 1 + $('#resizeMe_' + cropId).parents('.imagefield-crop-wrapper').width(),
      maxHeight: 1 + $('#resizeMe_' + cropId).parents('.imagefield-crop-wrapper').height(),
      minTop: 1,
      minLeft: 1,
      maxRight: $('#resizeMe_' + cropId).parents('.imagefield-crop-wrapper').width(),
      maxBottom: $('#resizeMe_' + cropId).parents('.imagefield-crop-wrapper').height(),
      dragHandle: true,
      ratio: Drupal.imagefield_crop.ratio,
      onDrag: function(x, y)
      {
        clearTimeout(dragT);
        if (!changed) {
          changed = true;
          $('#resizeMe_' + cropId).parents('#imagefield-edit-image-row').find(".edit-image-crop-changed").val(1);
        }
        this.style.backgroundPosition = ((-1)*(x - containerpos.x)) + 'px ' + ((-1)*(y - containerpos.y)) + 'px';
        xx = x-containerpos.x;
        yy = y-containerpos.y;
        dragT = setTimeout('imagefieldCropSetDimensions ("' + cropId + '",' + xx + ',' + yy + ')', 200);
      },
      handlers: {
        se: '#resizeSE_' + cropId,
        e: '#resizeE_' + cropId,
        ne: '#resizeNE_' + cropId,
        n: '#resizeN_' + cropId,
        nw: '#resizeNW_' + cropId,
        w: '#resizeW_' + cropId,
        sw: '#resizeSW_' + cropId,
        s: '#resizeS_' + cropId
      },

      onResize : function(size, position) {
        clearTimeout(resizeT);
        if (!changed) {
          changed = true;
          $('#resizeMe_' + cropId).parents('#imagefield-edit-image-row').find(".edit-image-crop-changed").val(1);
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
  if ($("#image-crop-container_" + cropId).is(':visible')) {
    clearInterval(imageFieldCropInterval);
    imagefieldCropInit(cropId);
  }
}

function imageFieldCropBind(cropId) {
  $('fieldset.collapsible > legend a').click(function(event) {
    var $target = $(event.target);
    if ($target.parents('fieldset').find('#image-crop-container_' + cropId).length > 0) {
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
