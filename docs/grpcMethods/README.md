# gRPC RPC Lifecycle

This document provides an overview of the gRPC Remote Procedure Call (RPC) lifecycle, detailing the steps involved when a gRPC client invokes a server method. For language-specific implementation details, please refer to the relevant documentation.

## Unary RPC

The simplest form of RPC, involving a single request and a single response:

1.  **Client Invocation:** The client calls a stub method, triggering the RPC.
2.  **Server Notification:** The server receives notification of the RPC, including client metadata, method name, and any specified deadline.
3.  **Server Metadata (Optional):** The server may immediately send initial metadata to the client (before any response).
4.  **Request Processing:** The server receives the client's request message and performs the necessary processing.
5.  **Response Generation:** The server creates and populates the response message.
6.  **Response Transmission:** The server sends the response, status details (code and message), and optional trailing metadata to the client.
7.  **Client Completion:** If the status is `OK`, the client receives the response, completing the call.

## Server Streaming RPC

Similar to unary RPC, but the server returns a stream of messages:

1.  **Client Invocation:** The client sends a single request.
2.  **Server Processing:** The server processes the request.
3.  **Response Streaming:** The server sends a stream of response messages to the client.
4.  **Server Completion:** The server sends status details and optional trailing metadata, completing its side of the call.
5.  **Client Completion:** The client completes after receiving all server messages.

## Client Streaming RPC

The client sends a stream of messages to the server:

1.  **Client Streaming:** The client sends a stream of request messages.
2.  **Server Processing:** The server processes the stream of requests.
3.  **Response Generation:** The server generates a single response message.
4.  **Response Transmission:** The server sends the response, status details, and optional trailing metadata to the client.

## Bidirectional Streaming RPC

Both client and server send streams of messages:

1.  **Client Invocation:** The client initiates the call, and the server receives metadata, method name, and deadline.
2.  **Server Metadata (Optional):** The server may send initial metadata or wait for client messages.
3.  **Stream Processing:** Client and server independently read and write messages in any order.
4.  **Flexible Interaction:** Client and server can interact in various patterns (e.g., waiting for all messages, "ping-pong").


## RPC Termination

* Client and server independently determine RPC success.
* Outcomes may differ (e.g., server success, client timeout).
* Server can complete before client sends all requests.

## Cancelling an RPC

* Client or server can cancel an RPC at any time.
* Cancellation terminates the RPC immediately.
* Changes made before cancellation are not rolled back.