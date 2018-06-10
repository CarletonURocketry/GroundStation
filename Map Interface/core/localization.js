// Import required modules.
const vision = require('./vision')
const satellite = require('./satellite')

// Create a function for using a homography to transform a point.
const transformPoint = (input, homography) => {
    const output = { x: 0, y: 0 }
    w = (homography[2][0] * input.x) + (homography[2][1] * input.y) + (homography[2][2] * 1)
    output.x = ((homography[0][0] * input.x) + (homography[0][1] * input.y) + (homography[0][2] * 1)) / w
    output.y = ((homography[1][0] * input.x) + (homography[1][1] * input.y) + (homography[1][2] * 1)) / w
    return output
}

// Create a function to pre-compute a homography.
module.exports.computeHomography = (aerial_image) => {
    // Return a promise to find a homography.
    return new Promise((resolve, reject) => {
        // Get a satellite image of the location in the aerial image.
        satellite.getReferenceImage(aerial_image.latitude, aerial_image.longitude, 18, 'southport_18').then(satellite_image => {
            // Create a base64 string of the aerial image.
            const aerial = aerial_image.data.toString('base64')
            // Create a base64 string of the satellite image.
            const ortho = satellite_image.data.toString('base64')
            // Find a homography between the two images.
            vision.getHomography(aerial, ortho).then(homography => {
                // Store the homography for future use.
                aerial_image.homography = homography
                // Store the satellite image for future use.
                aerial_image.reference = satellite_image
                // Resolve the promise.
                resolve()
            })
        })
    })
}

// Create a function for locating a target in an aerial image.
module.exports.locateTarget = (target, aerial_image) => {
    // Check if a homography has already been computed.
    if (aerial_image.homography) {
        // Use the homography to locate the target in the satelillite image.
        const point = transformPoint({ x: target.x, y: target.y }, aerial_image.homography)
        // Find  the GPS position of the point.
        const position = satellite.getPointCoordinates(point, aerial_image.reference)
        // Resolve the promise.
        return(position)
    }
}