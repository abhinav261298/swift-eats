// MongoDB initialization script for Food Delivery Platform
db = db.getSiblingDB('food_delivery');

// Create collections
db.createCollection('analytics_events');
db.createCollection('driver_locations');
db.createCollection('order_analytics');
db.createCollection('user_sessions');

// Create indexes for better performance
db.analytics_events.createIndex({ "timestamp": -1 });
db.analytics_events.createIndex({ "eventType": 1 });
db.analytics_events.createIndex({ "userId": 1 });

db.driver_locations.createIndex({ "driverId": 1 });
db.driver_locations.createIndex({ "timestamp": -1 });
db.driver_locations.createIndex({ "location": "2dsphere" });

db.order_analytics.createIndex({ "orderId": 1 });
db.order_analytics.createIndex({ "timestamp": -1 });
db.order_analytics.createIndex({ "status": 1 });

db.user_sessions.createIndex({ "userId": 1 });
db.user_sessions.createIndex({ "sessionId": 1 });
db.user_sessions.createIndex({ "expiresAt": 1 });

print('MongoDB initialization completed');
