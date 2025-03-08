# gRPC Rate Limiting Implementation

This project implements rate limiting for gRPC services in Node.js.

## What is Rate Limiting?

Rate limiting is a technique used to control the number of requests a client can make to a server within a given time frame. This helps to protect the server from being overwhelmed by excessive traffic, ensuring fair resource allocation and preventing abuse.

## Technologies Used

* **`@grpc/grpc-js`:** The official gRPC library for Node.js.
* **`lru-cache`:** An LRU (Least Recently Used) cache for efficient storage and retrieval of rate limiters.

## Implementation Details

This implementation uses a middleware approach to apply rate limiting to gRPC service methods.

* **IP-Based Rate Limiting:** The middleware uses the client's IP address as the key for rate limiting.
* **Configurable Rate Limits:** Rate limits (points and duration) can be configured per service method.
* **LRU Cache:** An LRU cache is used to store `RateLimiterMemory` instances. This improves performance by reusing rate limiters and avoiding unnecessary creation of new instances.
* **Middleware Pattern:** The rate-limiting logic is encapsulated in a middleware, which wraps the actual service method using interceptors.
* **gRPC Error Handling:** When a client exceeds the rate limit, the middleware returns a `RESOURCE_EXHAUSTED` error with a descriptive message.

## How it Works

1.  When a gRPC call is received, the middleware function extracts the client's IP address.
2.  A unique key is generated based on the IP address and the configured rate limits.
3.  The middleware checks if a `RateLimiterMemory` instance exists in the LRU cache for that key.
4.  If a rate limiter exists, it is reused. Otherwise, a new rate limiter is created and stored in the cache.
5.  The rate limiter is used to check if the client has exceeded the limit.
6.  If the client is within the limit, the original service method is called.
7.  If the client has exceeded the limit, a `RESOURCE_EXHAUSTED` error is returned.

This implementation provides a robust and efficient way to add rate limiting to gRPC services in Node.js.