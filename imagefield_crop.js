/* $Id */
function imagefieldCropSetDimensions(x, y, w, h) {
    $(".edit-image-crop-x").val(x);
    $(".edit-image-crop-y").val(y);
    if (w) $(".edit-image-crop-width").val(w);
    if (h) $(".edit-image-crop-height").val(h);
}

$(document).ready(function(){
    var containerpos;
    var resizeT;
    var dragT;
    if ($("#image-crop-container").size()) {
        containerpos = findPos($("#image-crop-container").get(0));
    }
    else {
        containerpos = {x:0, y:0};
    }

	function findPos(obj) {
		var curleft = obj.offsetLeft || 0;
		var curtop = obj.offsetTop || 0;
		while (obj = obj.parent) {
			curleft += obj.offsetLeft
			curtop += obj.offsetTop
		}
		return {x:curleft,y:curtop};
	}

    $('#resizeMe').ready(function() {
        /* this is needed to set the box initially according to the form values */
        var obj = $('#resizeMe').get(0);
        var newpos = {
            left: parseInt($(".edit-image-crop-x").val()), 
            top:  parseInt($(".edit-image-crop-y").val())
        }
        var newsize = {
            width:  parseInt($(".edit-image-crop-width").val()), 
            height: parseInt($(".edit-image-crop-height").val())
        }
        if ($('#resizeMe').size()) {
		    obj.style.backgroundPosition = (-1)*newpos.left + 'px ' + (-1)*newpos.top + 'px';
            obj.style.left = (newpos.left + containerpos.x) + 'px';
            obj.style.top  = (newpos.top  + containerpos.y) + 'px';
            obj.style.width = newsize.width + 'px';
            obj.style.height  = newsize.height + 'px';
        }
    });

	$('#resizeMe').Resizable(
		{
			minWidth: 20,
			minHeight: 20,
			maxWidth: 1 + $('#resizeMe').parents('.imagefield-crop-wrapper').width(),
			maxHeight: 1 + $('#resizeMe').parents('.imagefield-crop-wrapper').height(),
			minTop: 1,
			minLeft: 1,
            maxRight: $('#resizeMe').parents('.imagefield-crop-wrapper').width(),
			maxBottom: $('#resizeMe').parents('.imagefield-crop-wrapper').height(),
			dragHandle: true,
            ratio: Drupal.imagefield_crop.ratio,
			onDrag: function(x, y)
			{
                clearTimeout(dragT);
				this.style.backgroundPosition = ((-1)*(x - containerpos.x)) + 'px ' + ((-1)*(y - containerpos.y)) + 'px';
                xx = x-containerpos.x;
                yy = y-containerpos.y;
                dragT = setTimeout('imagefieldCropSetDimensions (xx, yy)', 200);
			},
			handlers: {
				se: '#resizeSE',
				e: '#resizeE',
				ne: '#resizeNE',
				n: '#resizeN',
				nw: '#resizeNW',
				w: '#resizeW',
				sw: '#resizeSW',
				s: '#resizeS'
			},
			onResize : function(size, position) {
                clearTimeout(resizeT);
				this.style.backgroundPosition = ((-1)*(position.left - containerpos.x)) + 'px ' + ((-1)*(position.top - containerpos.y)) + 'px';
                x = position.left-containerpos.x;
                y = position.top-containerpos.y;
                w = size.width;
                h = size.height;
                resizeT = setTimeout('imagefieldCropSetDimensions (x, y, w, h)', 200);
			}
		}
	);
});


