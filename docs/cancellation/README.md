# Cancellation in gRPC

## Overview

When a gRPC client no longer requires the result of an RPC call, it can **cancel** the request. This signals to the server that the client is no longer interested in the response. Cancellation can also occur due to **deadline expiration** or **I/O errors**. Upon receiving a cancellation signal, the server should halt any ongoing computation and terminate its side of the stream. In scenarios where servers act as clients to upstream servers, cancellation should ideally propagate throughout the entire system, ensuring that all related computations initiated by the original client RPC are stopped.

Clients may cancel an RPC for various reasons, such as:

* The requested data has become irrelevant.
* The client aims to conserve server resources.

## Client-Server Interaction

Client ---- Cancel ---> Server 1 ---- Cancel ---> Server 2

## Cancelling an RPC Call on the Client Side

Clients initiate cancellation by invoking a method on the call object or, in some languages, on the associated context object. While gRPC clients do not provide specific reasons for cancellation to the server, the cancel API allows a string describing the reason. This string is used to generate a client-side exception and/or log, aiding in debugging.

## Server-Side Cancellation Handling

When a server is notified of an RPC cancellation, the application's server handler might still be processing the request. The gRPC library generally lacks a mechanism to interrupt this application-provided handler. Therefore, the server handler must actively coordinate with the gRPC library to ensure that local processing ceases.

For long-lived RPCs, the server handler should:

1.  **Periodically check** if the RPC has been cancelled.
2.  **Cease processing** if cancellation is detected.
3.  **Cancel upstream RPCs** if the server is also a client to other servers.
4.  **Exit the RPC handler**.

* Server 1:

  * perform some work
  * cancelled? (false -> continue work, true -> proceed to cancellation)
  * cancel upstream RPCs
  * exit RPC handle

Some languages provide automatic cancellation of outgoing RPCs, while others require the server handler to manage this responsibility.

## Key Considerations

* Cancellation is a signal of discontinuation, not necessarily an error.
* Proper cancellation handling is crucial for efficient resource utilization.
* Servers must implement mechanisms to detect and respond to cancellation signals.
* Propagation of cancellation through a chain of grpc calls is important.