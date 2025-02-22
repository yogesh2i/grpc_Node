const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
var reflection = require("@grpc/reflection")
const PROTO_PATH = __dirname+"../../../../basic.proto";
const server = new grpc.Server();
const packageDefinition = protoloader.loadSync(PROTO_PATH,{
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
   });
const basic_proto =  grpc.loadPackageDefinition(packageDefinition);
reflection = new reflection.ReflectionService(packageDefinition);
reflection.addToServer(server);



function unaryMethod(call,callback){
   const {clientText} = call.request; 
   console.log(clientText);

   //reading the metadata sent by client
   const incomingTimestamps = call.metadata.get('timestamp');
   console.log("metadata from client: "+incomingTimestamps);

   //setiing outgoing headers to be sent to the client by server beforehand
   const outgoingHeaders = new grpc.Metadata();
  outgoingHeaders.set('timestamp', new Date().toISOString());
  call.sendMetadata(outgoingHeaders);

  //setting outgoing trailers to be sent by server after response
  const outgoingTrailers = new grpc.Metadata();
  outgoingTrailers.set('timestamp', "trailer timestamp");

   callback(null,{serverText: "Response from server. You sent: "+clientText},outgoingTrailers); 

}

server.addService(basic_proto.sampleService.service,{
  //rpc set in proto : function defined on server side
    unaryMethod : unaryMethod 
})


server.bindAsync(`0.0.0.0:50050`,grpc.ServerCredentials.createInsecure(),(err,port)=>{
    if(err){
     console.log("Failed to create server!"+err.message);
    }else{
     console.log("Service running at :"+port);
    }
 });