const Device = require('../models/device');

const deviceInfoMiddleware = (req, res, next) => {
    const device = Device.createNewDevice(req);
    req.device = device;
    next();
};

module.exports = deviceInfoMiddleware;