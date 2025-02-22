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

/*this function expects one args 
1. call 
   in this method both server and client talks with each other using call

Note:- I recommend you to test this using postman 
       Else it will create an infinite loop as when client send data server listens and sends data back as things are hardcoded here.
*/
function duplexStreamMethod(call) {
   //triggered when data is sent by client and sends reply using cal.write
    call.on("data", (res) => {
        console.log(res);
        call.write({ serverText: "This msg is from server" })
    })

    //at this point client stopped streaming but seervers till working
    call.on("end", () => {
        console.log("client ended the stream. Server also ending..");
        call.end(); //server also ending its streaming
    })


}

server.addService(basic_proto.sampleService.service, {
    //rpc set in proto : function defined on server side
    duplexStreamMethod: duplexStreamMethod,
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
