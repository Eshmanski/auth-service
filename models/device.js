const DeviceDetector = require('device-detector-js');

class Device {
    device_type = "Unknown";
    browser_name = "Unknown";
    browser_version = "Unknown";
    os_name = "Unknown";
    os_version = "Unknown";
    ip_address = "Unknown";

    constructor(obj) {
        this.device_type = obj?.device_type ?? "Unknown";
        this.browser_name = obj?.browser_name ?? "Unknown";
        this.browser_version = obj?.browser_version ?? "Unknown";
        this.os_name = obj?.os_name ?? "Unknown";
        this.os_version = obj?.os_version ?? "Unknown";
        this.ip_address = obj?.ip_address ?? "Unknown";
    }

    static createNewDevice(req) {
        const deviceObj = {};
        deviceObj.ip_address = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;

        try {
            const deviceDetector = new DeviceDetector();
            const userAgent = req.headers['user-agent'];
            const deviceInfo = deviceDetector.parse(userAgent);

            deviceObj.device_type = req.useragent.isMobile ? 'mobile' : req.useragent.isTablet ? 'tablet' : 'desktop';
            deviceObj.browser_name = deviceInfo.client?.name || 'Unknown';
            deviceObj.browser_version = deviceInfo.client?.version || 'Unknown';
            deviceObj.os_name = deviceInfo.os?.name || 'Unknown';
            deviceObj.os_version = deviceInfo.os?.version || 'Unknown';
        } catch (error) {
            console.error('Error in deviceInfo middleware:', error);
        }

        return new Device(deviceObj);
    }

    static convertFromDB(dbToken) {
        return new Device(dbToken);
    }
}


module.exports = Device;

