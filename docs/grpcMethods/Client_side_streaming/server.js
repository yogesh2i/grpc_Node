const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
var reflection = require("@grpc/reflection");
const PROTO_PATH = __dirname + "../../../../basic.proto";
const server = new grpc.Server();
const packageDefinition = protoloader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const basic_proto = grpc.loadPackageDefinition(packageDefinition);
reflection = new reflection.ReflectionService(packageDefinition);
reflection.addToServer(server);

/*this function expects two args 
1. call 

2. callback - When client has finished streaming then we need callback to talk to the client
   It will reply with two args err,res
*/

function clientStreamMethod(call, callback) {
    call.on("data", (res) => {
        console.log(res);
    })
    call.on("end", () => {
        console.log("client finished the stream")
        callback(null, { serverText: "Thanks we have recieved the data" })
    })
}

server.addService(basic_proto.sampleService.service, {
    //rpc set in proto : function defined on server side
    clientStreamMethod: clientStreamMethod,
});

server.bindAsync(
    `0.0.0.0:50050`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.log("Failed to create server!" + err.message);
        } else {
            console.log("Service running at :" + port);
        }
    }
);
