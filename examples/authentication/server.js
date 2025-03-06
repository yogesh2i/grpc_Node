const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
const jwt = require('jsonwebtoken');
var reflection = require("@grpc/reflection")
const PROTO_PATH = __dirname+"../../../basic.proto";
const JWT_SECERT = 'qwe123'; //dummy jwt secret
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

//main logic to verify user token
function authenticate(metadata){
    const userMeta = metadata.get('authorization');
    let verified = false;
    const token = userMeta[0].split(' ')[1]; //extracting token from (Bearer #####)
    jwt.verify(token,JWT_SECERT,(err,decoded)=>{
      if(decoded){
        verified = true;
      }
    })
   return verified;
}

//service function extract metadata and proceed to verification
function authenticator(call,callback){
   if(authenticate(call.metadata)){
      return callback(null,{serverText: "Yes! Welcome."}); 
   }
  return callback({
    code: grpc.status.UNAUTHENTICATED,
    details: 'Invalid token'
  })

}

server.addService(basic_proto.sampleService.service,{
    authenticator : authenticator
})


server.bindAsync(`0.0.0.0:50050`,grpc.ServerCredentials.createInsecure(),(err,port)=>{
    if(err){
     console.log("Failed to create server!"+err.message);
    }else{
     console.log("Service running at :"+port);
    }
 });