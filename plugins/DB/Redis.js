const { createClient } = require("redis");

class RedisClient {
  isConnected = false;
  redis;
  url;

  constructor() {
    this.url = `redis://${process.env.DB_REDIS_HOST}:${process.env.DB_REDIS_PORT}`;
    this.redis = createClient({ url: this.url });
  }

  async connect() {
    try {
      await this.redis.connect();
      this.isConnected = true;
    } catch (error) {
      throw error;
    }
  }

  _constructSessionKey(id, jti) {
    return `session:${id}:${jti}`;
  }

  async setSession(session, ttl) {
    try {
      const key = this._constructSessionKey(session.person_id, session.jti);

      await this.redis.hSet(key, session);
      await this.redis.expire(key, ttl);
    } catch(error) {
      throw error;
    }
  }

  async removeSession(id, jti) {
    const key = this._constructSessionKey(id, jti);

    await this.redis.del(key);
  }

  async getSession(id, jti) {
    const key = this._constructSessionKey(id, jti);

    const session = await this.redis.hGetAll(key);
    return session;
  }
}

module.exports = new RedisClient();