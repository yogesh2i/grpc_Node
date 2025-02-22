const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "../../../../basic.proto";

const packageDefinition = protoloader.loadSync(PROTO_PATH);
const basic_proto = grpc.loadPackageDefinition(packageDefinition).sampleService;
const client = new basic_proto(`0.0.0.0:50050`, grpc.credentials.createInsecure());


const call = client.clientStreamMethod((err, res) => { //server will send final response
    if (err) {
        console.log(err.code);
        console.log(err.details)
    } else {
        console.log(res) //response after getiing success status ok
    }
})

//sending msg to server after 1 sec
let interval = setInterval(() => {
    call.write({ clientText: new Date() });
}, 1000)

//ending streaming after 5 secs
setTimeout(() => {
    clearInterval(interval)
    call.end();
}, 2000)






