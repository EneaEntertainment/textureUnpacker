/**
 *  textureUnpacker 1.0
 *
 *  Created by Enea Entertainment
 *
 */

var renderer, stage;

var reader = new FileReader();
var png, json;

var step  = -1;

var stepByStepMessages =
[
	'unpack texture atlases created with TexturePacker (PixiJS, Phaser) and save them as individual images.<br>Supports trimmed and rotated textures, too.<br><br><b>Start with choosing PNG file</b>',
	'OK, now <b>choose corresponding JSON file</b>',
	'Unpacking done. Left click on the images to save them on your computer.'
];

var unpackerMessages =
[
	'Loading ',
	'. Please wait...',
	' loaded'
];

window.onload = function()
{
	message('tutorial', stepByStepMessages[0]);

	show('stepByStep');
	show('filesForm');
};

function readURL(input)
{
	if (input.files && input.files[0])
	{
		show('messages');
		
		message('msg', unpackerMessages[0]  + input.files[0] + unpackerMessages[1]);
		
		step ++;
		
		reader.onload = function(e)
		{
			message('tutorial', stepByStepMessages[step + 1]);
			message('msg', input.files[0].name + unpackerMessages[2]);
			
			switch (step)
			{
				case 0: 
					png = e.target.result;
					document.getElementById('form').reset();
					
					break;
					
				case 1:
					json = JSON.parse(e.target.result);
					
					hide('filesForm');
					hide('messages');
					show('restartButton');
					
					start();
					
					break;
			}
		}
		
		switch (step)
		{
			case 0: 
				reader.readAsDataURL(input.files[0]);
				break;
				
			case 1:
				reader.readAsText(input.files[0]);
				break;					
		}				
	}
}
	
function start()
{
	renderer = new PIXI.CanvasRenderer(100, 100, { transparent : true });
	document.getElementById('sourceContent').appendChild(renderer.view);
	renderer.view.style.display = 'none';

	stage = new PIXI.Container();	

	PIXI.loader.add('atlas_image', png).load(onAssetsLoaded);	
};

function createAtlas()
{
	// thanks Pixi!
	
	PIXI.loader.resources.atlas = {};
	PIXI.loader.resources.atlas.textures = {};
	
	var frames = json.frames;
	
	for (var i in frames)
	{
		var rect = frames[i].frame;

		if (rect)
		{
			var size = null;
			var trim = null;

			if (frames[i].rotated)
			{
				size = new PIXI.Rectangle(rect.x, rect.y, rect.h, rect.w);
			}
			else
			{
				size = new PIXI.Rectangle(rect.x, rect.y, rect.w, rect.h);
			}

			if (frames[i].trimmed)
			{
				trim = new PIXI.Rectangle(
					frames[i].spriteSourceSize.x,
					frames[i].spriteSourceSize.y,
					frames[i].sourceSize.w,
					frames[i].sourceSize.h
				);
			}

			if (frames[i].rotated)
			{
				var temp = size.width;
				size.width = size.height;
				size.height = temp;
			}

			PIXI.loader.resources.atlas.textures[i] = new PIXI.Texture(PIXI.loader.resources.atlas_image.texture.baseTexture, size, size.clone(), trim, frames[i].rotated ? 2 : 0);
			PIXI.utils.TextureCache[i] = PIXI.loader.resources.atlas.textures[i];
		}
	}	
};

function onAssetsLoaded(loader, resources)
{
	createAtlas();
	
	var p =
	{
		width   : 0,
		height  : 0,
		border  : '1px solid',
		margin  : '10px 10px',
		display : 'inline'
	};
	
	for (var i in resources.atlas.textures)
	{
		var tmp = new PIXI.Sprite(resources.atlas.textures[i]);
		stage.addChild(tmp);
		
		p.id     = i;
		p.width  = tmp.width;
		p.height = tmp.height;		
		
		var anchor     = createAnchor(p);
		var destCanvas = createCanvas(anchor, p);
		
		renderer.resize(tmp.width, tmp.height);
		renderer.render(stage);
		
		destCanvas.drawImage(renderer.view, 0, 0);
		
		anchor.href = document.getElementById(p.id).toDataURL();
		
		stage.removeChild(tmp);
	}

	message('msg', unpackerMessages[3]);
	show('unpackResult');
};

function createAnchor(p)
{
	var anchor = document.createElement('a');

	var name = p.id.lastIndexOf('.') === -1 ? p.id : p.id.substr(0, p.id.lastIndexOf('.'));
	p.id = name + '.png';

	anchor.id       = p.id + '_anchor';
	anchor.download = p.id;
	
	document.getElementById('destContent').appendChild(anchor);
	
	return anchor;
};

function createCanvas(anchor, p)
{
	var canvas           = document.createElement('canvas');
	
	canvas.id            = p.id;
	canvas.width         = p.width;
	canvas.height        = p.height;
	canvas.style.border  = p.border;
	canvas.style.display = p.display;
	
	canvas.style.margin  = '5px 5px';

	document.getElementById(p.id + '_anchor').appendChild(canvas);
	
	var context = canvas.getContext("2d");
	
	if (context === null)
	{
		console.log('textureUnpacker : something fishy happened, context is null');
	}
	
	return context;
};

function show(id)
{
	document.getElementById(id).style.display = '';
};

function hide(id)
{
	document.getElementById(id).style.display = 'none';
};

function message(id, txt)
{
	document.getElementById(id).innerHTML = txt;
};