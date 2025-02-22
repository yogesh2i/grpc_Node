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


function clientStreamMethod(call, callback) {
    //reading metadata sent by client
    const incomingTimestamps = call.metadata.get('timestamp');
    console.log("Metadata from client= "+incomingTimestamps);

    call.on("data", (res) => {
        console.log(res);
    })

    //set outgoing header to be sent by server
    const outgoingHeaders = new grpc.Metadata();
    outgoingHeaders.set('timestamp', new Date().toISOString());
    call.sendMetadata(outgoingHeaders);

    call.on("end", () => {
        //set outgoing trailers to be sent by server
        const outgoingTrailers = new grpc.Metadata();
        outgoingTrailers.set('timestamp', new Date().toISOString());

        console.log("client finished the stream");
        callback(null, { serverText: "Thanks we have recieved the data" },outgoingTrailers);//sending trailers
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
