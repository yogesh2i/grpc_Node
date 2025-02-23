const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
var reflection = require("@grpc/reflection")
const PROTO_PATH = __dirname + "../../../basic.proto";

const keepaliveOptions = {
    // If a client is idle for 15 seconds, send a GOAWAY
    'grpc.max_connection_idle_ms': 15_000,
    // If any connection is alive for more than 30 seconds, send a GOAWAY
    'grpc.max_connection_age_ms': 30_000,
    // Allow 5 seconds for pending RPCs to complete before forcibly closing connections
    'grpc.max_connection_age_grace_ms': 5_000,
    // Ping the client every 5 seconds to ensure the connection is still active
    'grpc.keepalive_time_ms': 5_000,
    // Wait 1 second for the ping ack before assuming the connection is dead
    'grpc.keepalive_timeout_ms': 1_000
  }
  
const server = new grpc.Server(keepaliveOptions);

const packageDefinition = protoloader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const basic_proto = grpc.loadPackageDefinition(packageDefinition);
reflection = new reflection.ReflectionService(packageDefinition);
reflection.addToServer(server);


function unaryMethod(call, callback) {
    const { clientText } = call.request;
    setTimeout(()=>{

        callback(null, { serverText: "Response from server. You sent: " + clientText });
    },10000)
}

server.addService(basic_proto.sampleService.service, {
    unaryMethod: unaryMethod
})


server.bindAsync(`0.0.0.0:50050`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.log("Failed to create server!" + err.message);
    } else {
        console.log("Service running at :" + port);
    }
});