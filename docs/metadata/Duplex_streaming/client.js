const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "../../../../basic.proto";

const packageDefinition = protoloader.loadSync(PROTO_PATH);
const basic_proto = grpc.loadPackageDefinition(packageDefinition).sampleService;
const client = new basic_proto(`0.0.0.0:50050`, grpc.credentials.createInsecure());

//set metadata to be sent by client
const requestMetadata = new grpc.Metadata();
requestMetadata.set('timestamp', new Date().toISOString());

const call = client.duplexStreamMethod(requestMetadata);

call.write({ clientText: new Date() });

call.on("data", (res) => {
    console.log(res);
    call.write({ clientText: "This is reply from client" });
})

//reading metadata sent by server
call.on('metadata', metadata => {
    const timestamps = metadata.get('timestamp');
    console.log("Metadata from  server= " + timestamps);

});

//reading trailers sent by server
call.on('status', status => {
    const timestamps = status.metadata.get('timestamp');
    console.log("Trailers from server= " + timestamps);
});

call.on("end", () => {
    console.log("server stream ended. Client also ending..");
    call.end(); //ending client stream also
})







