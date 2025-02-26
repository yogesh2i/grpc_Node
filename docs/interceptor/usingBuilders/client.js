const grpc = require("@grpc/grpc-js");
const { getInterceptingCall } = require("@grpc/grpc-js/build/src/client-interceptors");
const protoloader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "../../../../basic.proto";

const packageDefinition = protoloader.loadSync(PROTO_PATH);
const basic_proto = grpc.loadPackageDefinition(packageDefinition).sampleService;

// Authentication interceptor function for gRPC client
function authInterceptor(options, nextCall) {
    // Create a new RequesterBuilder instance
    // The builder pattern allows us to flexibly and fluently build a requester with various interceptors.
    const requester = (new grpc.RequesterBuilder())
      // Intercept and modify outgoing metadata
      .withStart((metadata, listener, next) => {
        // Set the 'authorization' header with a secret token
        metadata.set('authorization', 'value');
        // Proceed to the next handler in the chain
        next(metadata, listener);
      }).build();
    // Return a new InterceptingCall instance with the next call and requester
    return new grpc.InterceptingCall(nextCall(options), requester);
  }

  
  // Logger function to mock a sophisticated logging system
  // This function simply prints out the content to the console
  function logger(format, ...args) {
    console.log(`LOG (client):\t${format}\n`, ...args);
  }
  
  // Logging interceptor function for gRPC client
  function loggingInterceptor(options, nextCall) {
    // Create a new ListenerBuilder instance
    // The builder pattern provides a convenient way to configure multiple interceptors.
    const listener = (new grpc.ListenerBuilder())
      // Intercept and log received messages
      .withOnReceiveMessage((message, next) => {
        logger(`Receive a message ${JSON.stringify(message)} at ${(new Date()).toISOString()}`);
        // Proceed to the next handler in the chain
        next(message);
      }).build();
    // Create a new RequesterBuilder instance
    // Using a builder helps to easily define how the client sends requests.
    const requester = (new grpc.RequesterBuilder())
      // Intercept and log sent messages
      .withSendMessage((message, next) => {
        logger(`Send a message ${JSON.stringify(message)} at ${(new Date()).toISOString()}`);
        // Proceed to the next handler in the chain
        next(message);
      }).build();
    // Return a new InterceptingCall instance with the next call and requester
    return new grpc.InterceptingCall(nextCall(options), requester);
  }
  

const client = new basic_proto(`0.0.0.0:50050`, grpc.credentials.createInsecure(),{interceptors: [authInterceptor, loggingInterceptor]});



client.unaryMethod({ clientText: "ok" }, callback);

function callback(err, res) {

    if (err) {
        console.log(err.code);
        console.log(err.details);
    } else {
        console.log(res);
    }
}




