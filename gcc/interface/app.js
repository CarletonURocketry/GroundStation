// Import required modules.
const satellite = require('../satellite')
const fs = require('fs')

// Define a map zoom.
const map_zoom = 18
// Create a new Pixi application.
const app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight })
// Append the app to the HTML document.
document.body.appendChild(app.view)

// Define the top left tile.
const topLeft = satellite.project(33.041191, -107.065507, map_zoom)
// Define the bottom right tile.
const bottomRight = satellite.project(32.944293, -106.882001, map_zoom)
// Compute the central tile position.
const startX = (topLeft.x + bottomRight.x) / 2
const startY = (topLeft.y + bottomRight.y) / 2

// Iterate through all the tiles.
for (let x = topLeft.x; x <= bottomRight.x; x++) {
    for (let y = topLeft.y; y <= bottomRight.y; y++) {
        // Define the tile name.
        const tile_name = `${x}_${y}_${map_zoom}`
        // Define the file name.
        const file_name = `../satellite/tiles/sp2_${map_zoom}/${tile_name}.jpg`
        // Add the tile to the loader.
        PIXI.loader.add(tile_name, file_name)
    }
}

// Define a tile border.
const border_name = `./Grid_final.png`
// Load the border.
PIXI.loader.add('border', border_name)

// Create a new Pixi container.
const container = new PIXI.Container()
// Load all the resources.
PIXI.loader.load((loader, resources) => {
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
            // Create a border
            const border = new PIXI.Sprite(resources['border'].texture)
            border.x = tile.x;
            border.y = tile.y;
            border.alpha = 0.5;
            container.addChild(border)
        }
    }
    // Add the container to the stage.
    app.stage.addChild(container)
})

// Compute the bounds of the map area.
const max_x = (startX - topLeft.x) * 256
const max_y = (startY - topLeft.y) * 256
// Define pan limits.
const translate_extent = [[-max_x, -max_y], [max_x, max_y]]
// Define zoom limits.
const zoom_extent = [0.15, 2]
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