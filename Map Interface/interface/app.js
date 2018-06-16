// Import required modules.
    // *** for SIAS
const satellite = require('../core/satellite')
// const localization = require('../core/localization')
// const example = require('../example')
const fs = require('fs')
    // CUinSpace
let $ = require ('jquery')

// Define a map zoom.
const map_zoom = 16
// Create a new Pixi application.
const app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight })
// Append the app to the HTML document.
document.body.appendChild(app.view)

// Define the top left tile.
const topLeft = satellite.project(33.041191,-107.065507, map_zoom)
// Define the bottom right tile.
const bottomRight = satellite.project(32.944293,-106.882001, map_zoom)
// Compute the central tile position.
// module.exports.createDatabase('spaceport' ,,,18)
const startX = (topLeft.x + bottomRight.x) / 2
const startY = (topLeft.y + bottomRight.y) / 2

// Iterate through all the tiles.
for (let x = topLeft.x; x <= bottomRight.x; x++) {
    for (let y = topLeft.y; y <= bottomRight.y; y++) {
        // Define the tile name.
        const tile_name = `${x}_${y}_${map_zoom}`
        // Define the file name.
        const file_name = `../core/satellite/tiles/spaceport16/${tile_name}.jpg`
        // Add the tile to the loader.
        PIXI.loader.add(tile_name, file_name)
    }
}

// Create a new Pixi container.
const container = new PIXI.Container()

// Load all the resources.
PIXI.loader.load(function (loader, resources) {
    // Iterate through all the tiles.
    for (let x = topLeft.x; x <= bottomRight.x; x++) {
        for (let y = topLeft.y; y <= bottomRight.y; y++) {
            // Create a tile sprite.
            const tile = new PIXI.Sprite(resources[`${x}_${y}_${map_zoom}`].texture)
            // Place the tile at the correct position.
            tile.x = (x - startX) * 256
            tile.y = (y - startY) * 256
            // Add the tile to the container.
            container.addChild(tile)
        }
    }
    // Add the container to the stage.
    app.stage.addChild(container)
    // Read an input file from the file system.
//     fs.readFile('./example/aerial.png', (err, data) => {
//         // Include the GPS meta-data.
//         const image = { src: '../example/aerial.png', latitude: 49.905368, longitude: -98.271399, data: data.toString('base64'), width: 883, height: 662 }
//         // Overlay the image onto the map as an example.
//         overlayImage(image)
//     })
})

// Define a function to overlay an aerial image onto the map.
// const overlayImage = (image) => {
//     // Define the number of samples to take along each edge.
//     const samples = 4
//     // Create a list to store all the vertices.
//     const vertices = new Array(2 * samples * samples)
//     // Compute a homography for the image.
//     localization.computeHomography(image).then(() => {
//         // Sample the image.
//         for (let x = 0; x < samples; x++) {
//             for (let y = 0; y < samples; y++) {
//                 // Define a target.
//                 const target = { x: (x * image.width / (samples - 1)), y: (y * image.height / (samples - 1)) }
//                 // Find a target in the image.
//                 const location = localization.locateTarget(target, image)
//                 // Project the target location into pixel space.
//                 const projection = satellite.projectAccurately(location.latitude, location.longitude, map_zoom)
//                 // Set the vertex coordinates.
//                 vertices[(2 * y * samples) + (2 * x)] = (projection.x - startX) * 256
//                 vertices[(2 * y * samples) + (2 * x) + 1] = (projection.y - startY) * 256
//             }
//         }
//         // Create a new plane.
//         const plane = new PIXI.mesh.Plane(PIXI.Texture.fromImage(image.src), samples, samples)
//         // Hide the plane initially.
//         plane.alpha = 0.001
//         // Add the plane to the container.
//         container.addChild(plane)
//         // Call a function in the future.
//         setTimeout(function () {
//             // Set the plane's vertices.
//             for (let i = 0; i < vertices.length; i++) plane.vertices[i] = vertices[i]
//             // Change the opacity.
//             plane.alpha = 0.75
//             // Refresh the plane.
//             plane.refresh()
//         }, 100)
//     })
// }

// Compute the bounds of the map area.
const max_x = (startX - topLeft.x) * 256
const max_y = (startY - topLeft.y) * 256
// Define pan limits.
const translate_extent = [[-max_x, -max_y], [max_x, max_y]]
// Define zoom limits.
const zoom_extent = [0.25, 2]
// Map d3 interactions to the zoom function.
d3.select(app.view).call(d3.zoom().scaleExtent(zoom_extent).translateExtent(translate_extent).on('zoom', () => {
    // Translate the map.
    container.position.x = d3.event.transform.x
    container.position.y = d3.event.transform.y
    // Scale the map.
    container.scale.x = d3.event.transform.k
    container.scale.y = d3.event.transform.k
}))

// Handle window resizing.
window.addEventListener('resize', () => {
    // Set style options.
    app.renderer.view.style.position = 'absolute'
    app.renderer.view.style.display = 'block'
    // Set the window to auto-resize.
    app.renderer.autoResize = true
    // Resize the window.
    app.renderer.resize(window.innerWidth, window.innerHeight)
})

// Flag the stage as interactive.
app.stage.interactive = true
// Set the cursor.
app.stage.cursor = 'url(cursor.png) 7 7, auto'

const rectangle = new PIXI.Graphics();
rectangle.clear();
rectangle.beginFill(0x4095BF, 0.5);
rectangle.drawRect(0, 0, 125, 28);
rectangle.endFill();
app.stage.addChild(rectangle);

const mouseLabel = new PIXI.Text('', { fontFamily: 'Arial', fontSize: 24, fill: 0xFFFFFF, align: 'center' });
app.stage.addChild(mouseLabel);

setInterval(function () {
    const mousePos = app.renderer.plugins.interaction.mouse.global
    mouseLabel.setText(`(${mousePos.x}, ${mousePos.y})`)
    app.stage.setChildIndex(rectangle, app.stage.children.length - 1)
    app.stage.setChildIndex(mouseLabel, app.stage.children.length - 1)
}, 100);

// **************************** ********************** ********************** 
// *** CUinSpace Additions: ***
// Json data parsing

fs.watch('C:/Users/apeks/Documents/Github/groundstation-backend/frames', { encoding: 'utf8' }, (eventType, filename) => {
    if (filename) {
        // Logs the current file.
        console.log(filename);
        file1 = fs.readFileSync('C:/Users/apeks/Documents/Github/groundstation-backend/frames/' + filename,  { encoding: 'utf8' });
        
        // Checks if the file exists. 
        if (fs.existsSync('C:/Users/apeks/Documents/Github/groundstation-backend/frames/' + filename))
        {
            // Logs the name of the file pasted into the directory.
            console.log(file1); 
            // Stores the contents of the JSON file into obj.
            obj = JSON.parse(file1);
            // Logs the contents on the console. 
            console.log(obj);
        }
    }    
  });

// Using a div element to render the JSON data onto the interface.
var data = {
    "foobar": "foobaz"
  };
  $('#render').jsonViewer(data);
