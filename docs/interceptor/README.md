# gRPC Interceptors

## Overview

Implementing RPC methods forms the core of gRPC services. However, some functionalities are independent of the specific method being executed and should apply to all or most RPCs. Interceptors are ideally suited for this task.

## When to Use Interceptors

Interceptors, also known as "filters" or "middleware," are excellent for implementing logic that is not tied to a single RPC method. They are easily shareable across different clients or servers and are a crucial and frequently used method to extend gRPC. You might find existing interceptors in the gRPC ecosystem that fulfill your needs.

Example use cases for interceptors include:

* **Metadata Handling:** Modifying or inspecting request/response metadata.
* **Logging:** Recording RPC calls and their details.
* **Fault Injection:** Introducing errors for testing purposes.
* **Caching:** Storing and retrieving RPC responses.
* **Metrics:** Collecting performance data.
* **Policy Enforcement:** Implementing access control or rate limiting.
* **Server-Side Authentication:** Verifying client identity on the server.
* **Server-Side Authorization:** Controlling access to resources based on client identity.

**Note:** While client-side authentication *could* be implemented using an interceptor, gRPC provides a specialized "call credentials" API that is better suited for this purpose. Refer to the [Authentication Guide](https://www.google.com/url?sa=E&source=gmail&q=link_to_authentication_guide) for details about client-side authentication.

## How to Use Interceptors

Interceptors can be added when building a gRPC channel or server. Once added, the interceptor is invoked for every RPC on that channel or server. The interceptor APIs differ between client-side and server-side, requiring the creation of either a "client interceptor" or a "server interceptor."

Interceptors operate on a per-call basis and are not suitable for managing TCP connections, configuring TCP ports, or configuring TLS. While they are a powerful tool for customization, they are not universally applicable.

## Interceptor Order

The order of interceptors is critical when using multiple interceptors. Understanding the execution order of your gRPC implementation is essential.

Think of interceptors as being positioned in a line between the application and the network. Some interceptors are "closer to the network," providing greater control over transmitted data, while others are "closer to the application," offering better insight into application behavior.

**Example:**

Consider two client interceptors: a caching interceptor and a logging interceptor. The order of these is important. You might position the logging interceptor closer to the network to effectively monitor application communication and avoid logging cached RPCs.

[Application] -> [Caching Interceptor] -> [Logging Interceptor] -> [Network]

In this example, the logging interceptor will record all network traffic, including requests that are later served from the cache. If the logging interceptor was placed before the caching interceptor, cached requests would not be logged.

By carefully considering the order of your interceptors, you can ensure that they function correctly and provide the desired behavior for your gRPC services.


# gRPC Interceptors in Node.js

## Client

Node gRPC client interceptors are formally specified in gRFC L5. An interceptor is a function that can wrap a call object with an InterceptingCall, with intercepting functions for individual call operations. To illustrate, the following is a trivial interceptor with all interception methods:

```javascript
const interceptor = function(options, nextCall) {
  const requester = {
    start: function(metadata, listener, next) {
      const listener = {
          onReceiveMetadata: function(metadata, next) {
            next(metadata);
          },
          onReceiveMessage: function(message, next) {
            next(message);
          },
          onReceiveStatus: function(status, next) {
            next(status);
          }
      };
      next(metadata, listener);
    },
    sendMessage: function(message, next) {
      next(message);
    },
    halfClose: function(next) {
      next();
    },
    cancel: function(message, next) {
      next();
    }
  };
  return new InterceptingCall(nextCall(options), requester);
};
```

The requester intercepts outgoing operations, and the listener intercepts incoming operations. Each intercepting method can read or modify the data for that operation before passing it along to the next callback. The RequesterBuilder and ListenerBuilder utility classes provide an alternative way to construct requester and listener objects.

## Server

Node gRPC server interceptors are formally specified in gRFC L112. Similar to client interceptors, a server interceptor is a function that can wrap a call object with a ServerInterceptingCall, with intercepting functions for individual call operations. Server intercepting functions broadly mirror the client intercepting functions, with sending and receiving switched. To illustrate, the following is a trivial server interceptor with all interception methods:

```javascript
const interceptor = function(methodDescriptor, call) {
  const responder = {
    start: function(next) {
      const listener = {
        onReceiveMetadata: function(metadata, next) {
          next(metadata);
        },
        onReceiveMessage: function(message, next) {
          next(message);
        },
        onReceiveHalfClose: function(next) {
          next();
        },
        onCancel: function() {
        }
      };
      next(listener);
    },
    sendMetadata: function(metadata, next) {
      next(metadata);
    },
    sendMessage: function(message, next) {
      next(message);
    },
    sendStatus: function(status, next) {
      next(status);
    }
  };
  return new ServerInterceptingCall(call, responder);
};
```
As with client interceptors, the responder intercepts outgoing operations and the listener intercepts incoming operations. Each intercepting method can read or modify the data for that operation before passing it along to the next callback.

**Using Builders**

The ResponderBuilder and ServerListenerBuilder utility classes provide an alternative way to build responder and server listener objects.
