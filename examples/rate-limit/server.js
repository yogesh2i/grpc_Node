const { LRUCache }  = require('lru-cache');
const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
var reflection = require("@grpc/reflection")
const PROTO_PATH = __dirname + "../../../basic.proto";
const packageDefinition = protoloader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const basic_proto = grpc.loadPackageDefinition(packageDefinition);
reflection = new reflection.ReflectionService(packageDefinition);




const rateLimitCache = new LRUCache({
    max: 500, // Max number of clients/methods tracked
    ttl: 1000*60, // Token refresh interval (1 minute) user will be allowed again after a minute
});

const RATE_LIMIT = 5; // Max requests per minute


const authInterceptor = function (methodDescriptor, call) {
    const responder = {
        start: function (next) {
            const listener = {
                onReceiveMetadata: function (metadata, next) {
                    const clientId = call.getPeer();
                    const key = `${clientId}-${methodDescriptor.path}`; //set the unique key for client based on ip and resource path
                    let tokens = rateLimitCache.get(key) || RATE_LIMIT; //checking how many attempt left for user
                    
                    if (tokens > 1) { //if client has still quota left allow
                        rateLimitCache.set(key, tokens - 1);
                        next();
                    } else { //return client with limit error
                        call.sendStatus({
                            code: grpc.status.RESOURCE_EXHAUSTED,
                            details: 'Limit Exceeded!'
                        })
                    }
                    
                },
            
            };
            next(listener);
        },
    };
    return new grpc.ServerInterceptingCall(call, responder);
}


function unaryMethod(call, callback) {
    const { clientText } = call.request;
    callback(null, { serverText: "Response from server. You sent: " + clientText });

}

const server = new grpc.Server({ interceptors: [authInterceptor] });
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