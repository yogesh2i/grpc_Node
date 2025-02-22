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
 Note:-  In streaming methods we dont require callback as we will be sending response to user through call itself

call.write(message): Sends a single message to the client. Used in streaming responses to write multiple responses back to the client.

call.emit(event, data): Emits a custom event with specific data. This can be useful for handling custom events in your application.

call.end(): Ends the call. Typically used after all messages have been written to signify that the server has finished sending data.


*/
function serverStreamMethod(call) {
  const { clientText } = call.request; //format should be same as defined in proto

  if (clientText == "") {
    call.emit("error", {
      code: grpc.status.INVALID_ARGUMENT,
      details: "request missing required field: clientText",
    }); //sending error as client sent bad request or incomplete data
  }
  
  let interval;
  interval = setInterval(() => {
    if (call.cancelled) {
      //checks if user aborted the call in between
      call.end();
      console.log("Client not listening the stream");
    }
    call.write({ serverText: new Date() });
  }, 1000);

  //success stream
  if (interval) {
    setTimeout(() => {
      clearInterval(interval);
      call.end();
    }, 5000);
  }

  //failed stream
  // if(interval){
  //     setTimeout(()=>{
  //         clearInterval(interval);
  //         call.emit('error',{code: grpc.status.UNKNOWN, details:"failed due to unkown errors"});
  //     },5000);
  // }
}

server.addService(basic_proto.sampleService.service, {
  //rpc set in proto : function defined on server side
  serverStreamMethod: serverStreamMethod,
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
