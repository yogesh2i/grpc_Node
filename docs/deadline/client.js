const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "../../../basic.proto";

const packageDefinition = protoloader.loadSync(PROTO_PATH);
const basic_proto = grpc.loadPackageDefinition(packageDefinition).sampleService;


const client = new basic_proto(`0.0.0.0:50050`, grpc.credentials.createInsecure());


let deadline = new Date();
deadline.setSeconds(deadline.getSeconds()+1);
client.unaryMethod({ clientText: "delay" },callback);

function callback(err, res) {
    if (err) {
        console.log(err.code);
        console.log(err.details);
    } else {
        console.log(res);
    }
}





