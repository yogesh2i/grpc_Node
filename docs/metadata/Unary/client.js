const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "../../../../basic.proto";

const packageDefinition = protoloader.loadSync(PROTO_PATH);
const basic_proto = grpc.loadPackageDefinition(packageDefinition).sampleService;
const client = new basic_proto(`0.0.0.0:50050`, grpc.credentials.createInsecure());

//setting metadata to be sent to the server
const requestMetadata = new grpc.Metadata();
requestMetadata.set('timestamp', new Date().toISOString());

const call = client.unaryMethod({ clientText: "ok" },requestMetadata, callback);

//triggered on recieving metadata from server
call.on('metadata', metadata => {
    const timestamps = metadata.get('timestamp');
   console.log("incoming metadata from server"+timestamps)
  });

  //grpc sends status containing the success code and metadata
  call.on('status', status => {
    const timestamps = status.metadata.get('timestamp');
    console.log("incoming trailers from server: "+timestamps);
});

function callback(err, res) {
    if (err) {
        console.log(err.code);
        console.log(err.details);
    } else {
        console.log(res);
    }
}




