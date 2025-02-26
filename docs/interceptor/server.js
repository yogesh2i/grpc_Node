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


const authInterceptor = function (methodDescriptor, call) {
    const responder = {
        start: function (next) {
            const listener = {
                onReceiveMetadata: function (metadata, next) {
                    console.log("Recieving metadata from client");
                    if (validateAuthorizationMetadata(metadata)) {
                        next(metadata);
                    } else {
                        call.sendStatus({
                            code: grpc.status.UNAUTHENTICATED,
                            details: "Authorization failed"
                        })
                    }
                },
                onReceiveMessage: function (message, next) {
                    console.log("recieving message from client");
                    next(message);
                },
                onReceiveHalfClose: function (next) {
                    console.log("Done half processing with client recieved all messages. Closing now..")
                    next();
                },
                onCancel: function () {
                }
            };
            next(listener);
        },
        sendMetadata: function (metadata, next) {
            console.log("sending metadata");
            next(metadata);
        },
        sendMessage: function (message, next) {
            console.log("sending message");
            next(message);
        },
        sendStatus: function (status, next) {
            console.log("sending status");
            next(status);
        }
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