const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname+"../../../../basic.proto";

const packageDefinition = protoloader.loadSync(PROTO_PATH);
const basic_proto =  grpc.loadPackageDefinition(packageDefinition).sampleService;
const client = new basic_proto(`0.0.0.0:50050`,grpc.credentials.createInsecure());

//client can talk with server one time only using request as args
const serverCall = client.serverStreamMethod({clientText: "ok"})
//print data after recieving
serverCall.on("data",(res)=>{
console.log(res)
})

//runs when server ends streaming with status ok
serverCall.on("end",()=>{
    console.log("server stream ended");
})

//runs when any error occurs if added as "error" listener over server
serverCall.on("error",(err)=>{
  console.log(err.code);
  console.log(err.details)
})


       



