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


/*this function expects two args 
1. call - this works as req in rest apis
2. callback - the function user expects to be responded by server
   expects two args
   1. err - if any error occurs, set and modify according to  respective  error codes
   2. res - response which user expects after successful completion 
*/
function unaryMethod(call,callback){
   const {clientText} = call.request; //format should be same as defined in proto
   if(clientText==''){
    callback({code:grpc.status.INVALID_ARGUMENT,details: "required arguments not found"}) //sending error as client sent bad request or incomplete data
 }
   callback(null,{serverText: "Response from server. You sent: "+clientText}); //final response 

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