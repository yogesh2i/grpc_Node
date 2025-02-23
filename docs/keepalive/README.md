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

 
## Keepalive Configuration Specification

<table>
  <thead>
    <tr>
      <th>Options</th>
      <th>Availability</th>
      <th>Description</th>
      <th>Client Default</th>
      <th>Server Default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>KEEPALIVE_TIME</code></td>
      <td>Client and Server</td>
      <td>The interval in milliseconds between PING frames.</td>
      <td><code>INT_MAX</code> (Disabled)</td>
      <td>7200000 (2 hours)</td>
    </tr>
    <tr>
      <td><code>KEEPALIVE_TIMEOUT</code></td>
      <td>Client and Server</td>
      <td>The timeout in milliseconds for a PING frame to be acknowledged. If sender does not receive an acknowledgment within this time, it will close the connection.</td>
      <td>20000 (20 seconds)</td>
      <td>20000 (20 seconds)</td>
    </tr>
    <tr>
      <td><code>KEEPALIVE_WITHOUT_CALLS</code></td>
      <td>Client</td>
      <td>Is it permissible to send keepalive pings from the client without any outstanding streams.</td>
      <td>0 (false)</td>
      <td>N/A</td>
    </tr>
    <tr>
      <td><code>PERMIT_KEEPALIVE_WITHOUT_CALLS</code></td>
      <td>Server</td>
      <td>Is it permissible to send keepalive pings from the client without any outstanding streams.</td>
      <td>N/A</td>
      <td>0 (false)</td>
    </tr>
    <tr>
      <td><code>PERMIT_KEEPALIVE_TIME</code></td>
      <td>Server</td>
      <td>Minimum allowed time between a server receiving successive ping frames without sending any data/header frame.</td>
      <td>N/A</td>
      <td>300000 (5 minutes)</td>
    </tr>
    <tr>
      <td><code>MAX_CONNECTION_IDLE</code></td>
      <td>Server</td>
      <td>Maximum time that a channel may have no outstanding rpcs, after which the server will close the connection.</td>
      <td>N/A</td>
      <td><code>INT_MAX</code> (Infinite)</td>
    </tr>
    <tr>
      <td><code>MAX_CONNECTION_AGE</code></td>
      <td>Server</td>
      <td>Maximum time that a channel may exist.</td>
      <td>N/A</td>
      <td><code>INT_MAX</code> (Infinite)</td>
    </tr>
    <tr>
      <td><code>MAX_CONNECTION_AGE_GRACE</code></td>
      <td>Server</td>
      <td>Grace period after the channel reaches its max age.</td>
      <td>N/A</td>
      <td><code>INT_MAX</code> (Infinite)</td>
    </tr>
  </tbody>
</table> 
