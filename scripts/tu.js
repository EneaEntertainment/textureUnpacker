/**
 *
 * textureUnpacker
 *
 * @version  : 1.1
 * @author   : Enea Entertainment
 * @homepage : http://www.enea.sk
 *
 */

let step = -1;
let filePNG;
let fileJSON;
let fileNameJSON = 'download';
let renderer;
let stage;
let destination;

const reader = new FileReader();
const zip = new JSZip();

const stepByStepMessages =
[
    'unpack texture atlases created with TexturePacker (PixiJS, Phaser) and save them as individual images or download them all at once as zip file.<br>Supports trimmed and rotated textures, too.<br><br><b>Start with choosing PNG file</b>',
    'OK, now <b>choose corresponding JSON file</b>',
    'Unpacking done. Left click on the images to save them on your computer.'
];

const unpackerMessages =
[
    'Loading ',
    '. Please wait...',
    ' loaded'
];

window.onload = () =>
{
    destination = document.getElementById('destContent');

    message('tutorial', stepByStepMessages[0]);

    show('stepByStep');
    show('filesForm');
};

function show(id)
{
    document.getElementById(id).style.display = '';
}

function hide(id)
{
    document.getElementById(id).style.display = 'none';
}

function message(id, txt)
{
    document.getElementById(id).innerHTML = txt;
}

function readURL(input)
{
    if (input.files && input.files[0])
    {
        show('messages');

        message('msg', unpackerMessages[0] + input.files[0] + unpackerMessages[1]);

        step++;

        reader.onload = (e) =>
        {
            message('tutorial', stepByStepMessages[step + 1]);
            message('msg', input.files[0].name + unpackerMessages[2]);

            switch (step)
            {
                case 0:
                    filePNG = e.target.result;
                    document.getElementById('form').reset();

                    break;

                case 1:
                    fileNameJSON = input.files[0].name.replace(/\.[^/.]+$/, '');
                    fileJSON = JSON.parse(e.target.result);

                    hide('filesForm');
                    hide('messages');
                    show('restartButton');

                    start();

                    break;
            }
        };

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
    // create renderer
    renderer = new PIXI.CanvasRenderer(100, 100, { transparent: true });

    renderer.view.style.display = 'none';

    // append renderer to DOM
    document.getElementById('sourceContent').appendChild(renderer.view);

    // create stage
    stage = new PIXI.Container();

    // load image
    PIXI.loader.add('image', filePNG).load(onAssetsLoaded);
}

function onAssetsLoaded(loader, resources)
{
    const spritesheet = new PIXI.Spritesheet(resources.image.texture.baseTexture, fileJSON, fileNameJSON);

    spritesheet.parse((result) =>
    {
        for (const textureName in result)
        {
            // sprite
            const sprite = new PIXI.Sprite(result[textureName]);

            stage.addChild(sprite);

            // grab
            grab(sprite, textureName);

            stage.removeChild(sprite);
        }

        message('msg', unpackerMessages[3]);
        show('unpackResult');
    });
}

function grab(sprite, textureName)
{
    // get file name without path
    const fileName = textureName.replace(/^.*[\\\/]/, '');

    // create anchor
    const anchor = document.createElement('a');

    anchor.download = fileName;
    anchor.title = `${textureName} | ${sprite.width}x${sprite.height}`;

    destination.appendChild(anchor);

    // create canvas
    const canvas = document.createElement('canvas');

    canvas.width = sprite.width;
    canvas.height = sprite.height;
    canvas.style.border = '1px solid';
    canvas.style.display = 'inline';
    canvas.style.margin = '5px 5px';

    // append canvas to anchor
    anchor.appendChild(canvas);

    renderer.resize(sprite.width, sprite.height);
    renderer.render(stage);

    // get canvas context
    const context = canvas.getContext('2d');

    // draw texture to canvas
    context.drawImage(renderer.view, 0, 0);

    // anchor href
    anchor.href = canvas.toDataURL();
}

function downloadAll()
{
    const list = destination.querySelectorAll('a');

    for (let i = 0; i < list.length; i++)
    {
        const title = list[i].getAttribute('title');
        const path = title.split('|')[0].trim();
        const data = list[i].getAttribute('href').split(',')[1];

        zip.file(path, data, { base64: true });
    }

    zip.generateAsync({ type: 'blob' })
        .then((result) =>
        {
            saveAs(result, `${fileNameJSON}.zip`);
        });
}
