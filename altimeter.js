const gaussian = require('gaussian');
 
class Altimeter {

    constructor(rocket) {
        this.rocket = rocket;
        this.distribution = gaussian(0, 0.1);
    }

    sample () {
        const state = this.rocket.getState();
        const altitude = state.position.z;
        const noise = this.distribution.ppf(Math.random());
        return altitude;
    }
}

module.exports = Altimeter;