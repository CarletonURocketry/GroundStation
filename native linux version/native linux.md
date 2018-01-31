# Native Linux App

This is going to be a native implementation of a linux app to display the telemetry data in real-time.

**Telemetry Packet Format**:

- Mission (Bytes 0-4)
- ADC Data and Flags (Bytes 4-20)
- Accelerometer data (Bytes 21-26)
- Gyroscope data (Bytes 27-33)
- Altimeter (Bytes 34-38)
- GPS data (Bytes 38-58)

## Requirements

- Display / store GPS coordinates in real-time
- Display rocket state and deployment flags
- Display mission time
- Display Accelerometer / Gyroscope data
- Display location of Rocket and Payload on map(s)

