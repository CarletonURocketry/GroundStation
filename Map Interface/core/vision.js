// Import required modules.
const pythonBridge = require('python-bridge')

// Create a python bridge.
const python = pythonBridge()
// Define the vision function in the python interpreter.
python.ex`
import numpy as np
import cv2
import base64

def data_uri_to_cv2_img(uri):
    encoded_data = uri
    nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def getHomography(aerial, satellite):

    # img1 = cv2.imread('input.png',0) # queryImage
    # img2 = cv2.imread('ortho.png',0) # trainImage
    img1 = data_uri_to_cv2_img(aerial)
    img2 = data_uri_to_cv2_img(satellite)
    
    # Initiate SIFT detector
    orb = cv2.ORB_create()

    # find the keypoints and descriptors with SIFT
    kp1, des1 = orb.detectAndCompute(img1,None)
    kp2, des2 = orb.detectAndCompute(img2,None)

    # create BFMatcher object
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

    # Match descriptors.
    matches = bf.match(des1,des2)

    # Sort them in the order of their distance.
    matches = sorted(matches, key = lambda x:x.distance)

    # Compute the matrix.
    good = matches[0:200]
    src_pts = np.float32([ kp1[m.queryIdx].pt for m in good ]).reshape(-1,1,2)
    dst_pts = np.float32([ kp2[m.trainIdx].pt for m in good ]).reshape(-1,1,2)
    M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 2)

    # Return the output.
    return M.tolist()
`;

// Create a function for finding a homography between two images.
module.exports.getHomography = (source, target) => {
    // Return a promise to find a homography.
    return new Promise((resolve, reject) => {
        // Run the vision algorithm and use the result to resolve the promise.
        python`getHomography(${source}, ${target})`.then(homography => resolve(homography))
    })
}