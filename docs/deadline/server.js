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


function unaryMethod(call, callback) {
    const { clientText } = call.request;
    if(clientText=="delay"){
        setTimeout(()=>{
            callback(null,{serverText: "Hey you won't see this response"});
        },2000)
    }else{
        callback(null,{serverText: "Without delay"})
    }   
}


server.addService(basic_proto.sampleService.service, {
    unaryMethod: unaryMethod,
})


server.bindAsync(`0.0.0.0:50050`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.log("Failed to create server!" + err.message);
    } else {
        console.log("Service running at :" + port);
    }
});