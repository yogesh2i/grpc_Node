const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
var reflection = require("@grpc/reflection")
const PROTO_PATH = __dirname + "../../../../basic.proto";
const packageDefinition = protoloader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const basic_proto = grpc.loadPackageDefinition(packageDefinition);
reflection = new reflection.ReflectionService(packageDefinition);

// Function to validate authorization metadata
function validateAuthorizationMetadata(metadata) {
    const authorization = metadata.get('authorization');
    // Check if authorization header exists
    if (authorization.length < 1) {
      return false;
    }
    // Check if the first authorization value matches 'value'
    return authorization[0] === 'value';
  }
  
  // Actual authentication interceptor function
  function authInterceptor(methodDescriptor, call) {
  // Create a new ServerListenerBuilder instance
  // The builder pattern allows us to flexibly and fluently build a listener with various interceptors.
  const listener = (new grpc.ServerListenerBuilder())
    // Intercept and validate incoming metadata
    .withOnReceiveMetadata((metadata, next) => {
        if (validateAuthorizationMetadata(metadata)) { 
        // If validation passes, proceed to the next handler
        next(metadata);
      } else { 
        // If validation fails, send an unauthenticated status to the client
        call.sendStatus({
          code: grpc.status.UNAUTHENTICATED,
          details: 'Auth metadata not correct'
        });
    }
    }).build();
    // Create a new ResponderBuilder instance
    // Using a builder helps to easily define how the server responds to requests.
    const responder = (new grpc.ResponderBuilder())
    // Start the interceptor chain with the listener
    .withStart(next => {
        next(listener);
        }).build();
        // Return a new ServerInterceptingCall instance with the call and responder
        return new grpc.ServerInterceptingCall(call, responder);
  }
  
  // Logger function to mock a sophisticated logging system
  function logger(format, ...args) {
      console.log(`LOG (server):\t${format}\n`, ...args);
  }
  
  // Logging interceptor function
  function loggingInterceptor(methodDescriptor, call) {
      // Create a new ServerListenerBuilder instance
      // The builder pattern provides a convenient way to configure multiple interceptors.
      const listener = new grpc.ServerListenerBuilder()
      // Intercept and log received messages
      .withOnReceiveMessage((message, next) => {
          logger(`Receive a message ${JSON.stringify(message)} at ${(new Date()).toISOString()}`);
          // Proceed to the next handler
          next(message);
        }).build();
        // Create a new ResponderBuilder instance
        // The builder pattern is useful for clearly defining response behavior.
        const responder = new grpc.ResponderBuilder()
      // Start the interceptor chain with the listener
      .withStart(next => {
        next(listener);
    })
    // Intercept and log sent messages
    .withSendMessage((message, next) => {
        logger(`Send a message ${JSON.stringify(message)} at ${(new Date()).toISOString()}`);
        // Proceed to the next handler
        next(message);
      }).build();
    // Return a new ServerInterceptingCall instance with the call and responder
    return new grpc.ServerInterceptingCall(call, responder);
}

function unaryMethod(call, callback) {
    const { clientText } = call.request;
   
    callback(null, { serverText: "Response from server. You sent: " + clientText });
    
}

const server = new grpc.Server({interceptors: [authInterceptor, loggingInterceptor]});
reflection.addToServer(server);
server.addService(basic_proto.sampleService.service, {
    unaryMethod: unaryMethod
})


server.bindAsync(`0.0.0.0:50050`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.log("Failed to create server!" + err.message);
    } else {
        console.log("Service running at :" + port);
    }
});