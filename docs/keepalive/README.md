# gRPC Keepalive Configuration

TCP keepalive is a well-known method of maintaining connections and detecting broken connections. When TCP keepalive was enabled, either side of the connection can send redundant packets. Once ACKed by the other side, the connection will be considered as good. If no ACK is received after repeated attempts, the connection is deemed broken.

Unlike TCP keepalive, gRPC uses HTTP/2 which provides a mandatory **PING frame** which can be used to estimate round-trip time, bandwidth-delay product, or test the connection. The interval and retry in TCP keepalive don’t quite apply to PING because the transport is reliable, so they’re replaced with timeout (equivalent to interval * retry) in gRPC PING-based keepalive implementation.

**Note:**

* It’s not required for service owners to support keepalive. Client authors must coordinate with service owners for whether a particular client-side setting is acceptable. Service owners decide what they are willing to support, including whether they are willing to receive keepalives at all. (If the service does not support keepalive, the first few keepalive pings will be ignored, and the server will eventually send a `GOAWAY` message with debug data equal to the ASCII code for `too_many_pings`).

## How Configuring Keepalive Affects a Call

* Keepalive is less likely to be triggered for unary RPCs with quick replies. Keepalive is primarily triggered when there is a long-lived RPC, which will fail if the keepalive check fails and the connection is closed.
* For streaming RPCs, if the connection is closed, any in-progress RPCs will fail. If a call is streaming data, the stream will also be closed and any data that has not yet been sent will be lost.

**Warning:**

* To avoid DDoSing, it’s important to take caution when setting the keepalive configurations. Thus, it is recommended to avoid enabling keepalive without calls and for clients to avoid configuring their keepalive much below one minute.

## Common Situations Where Keepalives Can Be Useful

gRPC HTTP/2 keepalives can be useful in a variety of situations, including but not limited to:

* When sending data over a long-lived connection which might be considered as idle by proxy or load balancers.
* When the network is less reliable (For example, mobile applications).
* When using a connection after a long period of inactivity.
