class Rocket {

    constructor() {
        this.position = { x: 0, y: 0, z: 0 };
        this.attitude = { yaw: 0, pitch: 0, roll: 0 };
        this.v = { x: 0, y: 0, z: 0 };
        this.accel = { x: 0, y: 0, z: 0 };
        this.mass = 20;
        this.gravity = 9.81;
        this.thrust_0 = 1000;
        this.t = 0;
    }

    simulate(t, step) {
        if (this.position.z < 0) return;

        let thrust = this.thrust_0 * Math.exp(-t / 1);
        this.t = thrust / this.thrust_0;
        if (thrust < 0.1) thrust = 0;
        const dir = { x: 1, y: 1, z: 10 };
        const magniude = thrust / Math.sqrt(1 + 1 + 100);
        dir.x *= magniude;
        dir.y *= magniude;
        dir.z *= magniude;

        this.setThrust(dir);
        // this.updateAttitude();

        // const v0 = { x: 0, y: 0, z: 0 };

        this.v.x += (this.accel.x * step);
        this.v.y += (this.accel.y * step);
        this.v.z += (this.accel.z * step);

        this.position.x += (this.v.x * step);
        this.position.y += (this.v.y * step);
        this.position.z += (this.v.z * step);

    }

    updateAttitude() {
        this.attitude.roll = 180 * Math.atan2(this.v.z, this.v.y) / Math.PI;
        this.attitude.pitch = 180 * Math.atan2(this.v.z, this.v.y) / Math.PI;
    }

    setThrust(thrust) {
        this.accel.x = thrust.x / this.mass;
        this.accel.y = thrust.y / this.mass;
        this.accel.z = (thrust.z / this.mass) - this.gravity;
    }

    getState() {
        return { position: this.position, attitude: this.attitude, thrust: this.t };
    }
}

module.exports = Rocket;