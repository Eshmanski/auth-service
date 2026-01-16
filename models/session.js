const crypto = require("crypto");

class Session {
    jti;
    person_id;
    token_hash;
    device_type;
    agent_name;
    agent_version;
    os_name;
    os_version;
    ip_address;
    createdAt;
    
    neeed_update = "0";

    constructor(obj) {
        this.jti = obj.jti;
        this.token_hash = obj.token_hash,
        this.person_id = obj.person_id;
        this.device_type = obj.device_type;
        this.agent_name = obj.agent_name;
        this.agent_version = obj.agent_version;
        this.os_name = obj.os_name;
        this.os_version = obj.os_version;
        this.ip_address = obj.ip_address;
        this.createdAt = obj.createdAt;
    }

    static async createSession(jti, token, person, device) {
        const obj = {};

        const hash = crypto.createHash("sha256").update(token).digest("hex");

        obj.jti = jti;
        obj.token_hash = hash;
        obj.person_id = person.id;
        obj.device_type = device.device_type;
        obj.agent_name = device.agent_name;
        obj.agent_version = device.agent_version;
        obj.os_name = device.os_name;
        obj.os_version = device.os_version;
        obj.ip_address = device.ip_address;
        obj.createdAt = new Date().getTime();

        return new Session(obj)
    }
}

module.exports = Session;