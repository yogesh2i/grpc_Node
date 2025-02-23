const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "../../../basic.proto";

const packageDefinition = protoloader.loadSync(PROTO_PATH);
const basic_proto = grpc.loadPackageDefinition(packageDefinition).sampleService;

const keepaliveOptions = {
    // Ping the server every 10 seconds to ensure the connection is still active
    'grpc.keepalive_time_ms': 10_000,
    // Wait 1 second for the ping ack before assuming the connection is dead
    'grpc.keepalive_timeout_ms': 1_000,
    // send pings even without active streams
    'grpc.keepalive_permit_without_calls': 1
  }
const client = new basic_proto(`0.0.0.0:50050`, grpc.credentials.createInsecure(),keepaliveOptions);



client.unaryMethod({ clientText: "ok" }, callback);
 client.getChannel().watchConnectivityState(grpc.connectivityState.IDLE, Infinity, ()=>{
    console.log("Connection state changed:", grpc.connectivityState );
});
function callback(err, res) {

    if (err) {
        console.log(err.code);
        console.log(err.details);
    } else {
        console.log(res);
    }
}




