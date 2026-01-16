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

  async setSession(session, ttl) {
    try {
      const key = `session:${session.person_id}:${session.jti}`;

      await this.redis.hSet(key, session);
      await this.redis.expire(key, ttl);
    } catch(error) {
      throw error;
    }
  }
}

module.exports = new RedisClient();