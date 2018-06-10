// Import required modules.
const fs = require('fs')
const request = require('request')
const mergeImages = require('merge-images');

// Create a function to retrieve a satellite image.
const getImage = (x, y, zoom) => {
    // Return a promise to retrieve a satellite image.
    return new Promise((resolve, reject) => {
        // Create a set of options for the request.
        var options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
            },
            encoding: 'binary'
        }
        // Create a request URL.
        //const url = `https://khms1.google.com/kh/v=800?x=${x}&y=${y}&z=${zoom}`
        const url = `http://mt1.google.com/vt/lyrs=s&hl=en&x=${x}&y=${y}&z=${zoom}&s=Ga`
        //const url = `http://mt.google.com/vt/lyrs=s&hl=en&x=${x}&y=${y}&z=${zoom}&s=Ga`
        // Request the image.
        request(url, options, (error, response, body) => {
            // If an error occurs, reject the promise.
            if (error) reject(error)
            // Otherwise, resolve the promise with a new image object.
            else resolve(body)
        })
    })
}

// Create a function to project into tile space without flooring to the tile index.
module.exports.projectAccurately = (latitude, longitude, zoom) => {
    const TILE_SIZE = 256
    let siny = Math.sin(latitude * Math.PI / 180)
    siny = Math.min(Math.max(siny, -0.9999), 0.9999)
    const worldX = TILE_SIZE * (0.5 + longitude / 360)
    const worldY = TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI))
    const scale = 1 << zoom
    const tileX = (worldX * scale / TILE_SIZE)
    const tileY = (worldY * scale / TILE_SIZE)
    return { x: tileX, y: tileY }
}

// Create an inverse function for the function above.
module.exports.unproject = (x, y, zoom) => {
    const TILE_SIZE = 256
    const scale = 1 << zoom
    const worldX = x * TILE_SIZE / scale
    const worldY = y * TILE_SIZE / scale
    const longitude = ((worldX / TILE_SIZE) - 0.5) * 360
    const latitude = (2 * Math.atan(Math.exp((worldY - 128) / -(256 / (2 * Math.PI)))) - Math.PI / 2) / (Math.PI / 180);
    return { latitude: latitude, longitude: longitude }
}

// Create a function to project into tile space.
module.exports.project = (latitude, longitude, zoom) => {
    // Project the point.
    const projection = module.exports.projectAccurately(latitude, longitude, zoom)
    // Floor it to the nearest tile.
    return { x: Math.floor(projection.x), y: Math.floor(projection.y) }
}

// Create a function to get a reference image.
module.exports.getReferenceImage = (latitude, longitude, zoom, label) => {
    // Return a promise to retrieve a satellite image.
    return new Promise((resolve, reject) => {
        // Project the desired point to get the tile coordinates.
        const projection = module.exports.project(latitude, longitude, zoom);
        const x = projection.x
        const y = projection.y
        // Define the tile map.
        const tiles = [];
        const samples = 1;
        // Define the starting tile.
        const startX = x - samples;
        const startY = y - samples;
        // Add the tile locations.
        for (let i = 0; i <= samples * 2; i++) {
            for (let j = 0; j <= samples * 2; j++) {
                // Compute the tile location.
                const tileX = (i * 256)
                const tileY = (j * 256)
                // Add the tile to the list.
                tiles.push({ src: `../tiles/${label}/${startX + i}_${startY + j}_${zoom}.jpg`, x: tileX, y: tileY })
            }
        }
        // Compute the image size.
        const size = 256 * ((samples * 2) + 1)
        // Merge the tiles into a single image.
        mergeImages(tiles, { width: size, height: size }).then(b64 => {
            // Remove the meta-data.
            const base64Data = b64.replace(/^data:image\/png;base64,/, "")
            // Compute the pixel offset of the specified coordinate.
            const projection = module.exports.projectAccurately(latitude, longitude, zoom)
            // Resolve the promise.
            resolve({
                tileX: startX,
                tileY: startY,
                zoom: zoom,
                data: new Buffer(base64Data, 'base64')
            })
        })
    })
}

// Create a function to create a database.
module.exports.createDatabase = (label, top_latitude, left_longitude, bottom_latitude, right_longitude, zoom) => {
    // Create a directory for the database if one does nto already exist.
    if (!fs.existsSync('./tiles/' + label)) fs.mkdirSync('./tiles/' + label)
    // Compute the tile coordinates of the top left and bottom right tiles.
    const topLeft = module.exports.project(top_latitude, left_longitude, zoom)
    const bottomRight = module.exports.project(bottom_latitude, right_longitude, zoom)
    //console.log(topLeft); return;
    // Iterate through all the x and y values.
    for (let x = topLeft.x; x <= bottomRight.x; x++) {
        for (let y = topLeft.y; y <= bottomRight.y; y++) {
            // Check if the image has not already been downloaded.
            if (!fs.existsSync(`./tiles/${label}/${x}_${y}_${zoom}.jpg`)) {
                // Download the image.
                getImage(x, y, zoom).then(image => {
                    // Save the image to the disk.
                    fs.writeFileSync(`./tiles/${label}/${x}_${y}_${zoom}.jpg`, image, 'binary')
                    // fs.writeFileSync(`./tiles/${label}/${x}_${y}_${zoom}.jpg`, image, 'binary', (err) => {
		    // 	if (err) {
		    // 	    debugger
		    // 	    console.log(err)
		    // 	}
		    // 	else {
		    // 	    console.log("written to: " + `./tiles/${label}/${x}_${y}_${zoom}.jpg`)
		    // 	}

		    // })
                })
            }
        }
    }
}

// Create a function to find the GPS coordinates of a point in a satellite image.
module.exports.getPointCoordinates = (point, satellite_image) => {
    // Compute the tile coordinates.
    const x = satellite_image.tileX + (point.x / 256)
    const y = satellite_image.tileY + (point.y / 256)
    // Unproject them back to GPS coordinates.
    const unproject = module.exports.unproject(x, y, satellite_image.zoom)
    // Return the result.
    return { latitude: unproject.latitude, longitude: unproject.longitude }
}

//module.exports.createDatabase('spaceport' ,33.041191,-107.065507,32.944293,-106.882001,18)
