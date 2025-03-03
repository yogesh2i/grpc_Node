const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
var reflection = require("@grpc/reflection");
const PROTO_PATH = __dirname + "../../../basic.proto";
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

function duplexStreamMethod(call) {
   //triggered when data is sent by client and sends reply using cal.write

   call.on("data", (res) => {
       console.log(res);
       call.write({ serverText: "This msg is from server" })
    })

    call.on("end", () => {
        console.log("client ended the stream. Server also ending..");
        call.end(); //server also ending its streaming
    })
    call.on("cancelled",()=>{
        console.log("cancelled by client");
        call.end();
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
