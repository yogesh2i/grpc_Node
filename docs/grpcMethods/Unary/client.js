const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "../../../../basic.proto";

const packageDefinition = protoloader.loadSync(PROTO_PATH);
const basic_proto = grpc.loadPackageDefinition(packageDefinition).sampleService;
const client = new basic_proto(`0.0.0.0:50050`, grpc.credentials.createInsecure());

/*In unary method client and server can talk only using request and callback
 1. first arg will the request which sends data to the server  (expects in same format as declared in proto)
 2. this function will be used by server to return data to the client
*/

client.unaryMethod({ clientText: "ok" }, callback)

function callback(err, res) {
    if (err) {
        console.log(err.code);
        console.log(err.details);
    } else {
        console.log(res);
    }
}




