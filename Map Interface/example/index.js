// Import required modules.
const fs = require('fs')
const localization = require('../core/localization')

// Define a target in the aerial image.
const target = { x: 613, y: 349 }

// Read an input file from the file system.
fs.readFile('./example/aerial.png', (err, data) => {
    // Include the GPS meta-data.
    const aerial_image = { latitude: 49.905368, longitude: -98.271399, data: data.toString('base64'), width: 883, height: 662 }
    // Compute a homography for the image.
    localization.computeHomography(aerial_image).then(() => {
        // Find a target in the image.
        const location = localization.locateTarget(target, aerial_image)
        // Print the output.
        console.log('Example target found at:', location)
        // Print a URL to the map.
        console.log(`http://www.latlong.net/c/?lat=${location.latitude}&long=${location.longitude}`)
    })
})