const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
var reflection = require("@grpc/reflection")
const PROTO_PATH = __dirname + "../../../basic.proto";
const server = new grpc.Server();
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

//server will fail requests till client requests hit count 4 then succeeds 
let clientHit = 0;
function unaryMethod(call, callback) {
    const { clientText } = call.request;
    console.log("client request: " + clientHit);
    if (clientHit < 3) {
        clientHit++;
        callback({ code: grpc.status.UNAVAILABLE, details: "Please retry again" })
    } else {
        callback(null, { serverText: "Response from server. You sent: " + clientText });
    }

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