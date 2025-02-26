const grpc = require("@grpc/grpc-js");
const { getInterceptingCall } = require("@grpc/grpc-js/build/src/client-interceptors");
const protoloader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "../../../basic.proto";

const packageDefinition = protoloader.loadSync(PROTO_PATH);
const basic_proto = grpc.loadPackageDefinition(packageDefinition).sampleService;


const authInterceptor = function (options, nextCall) {
    const requester = {
        start: function (metadata, listener, next) {
            metadata.set("authorization", "value")
            listener = {
                onReceiveMetadata: function (metadata, next) {
                    console.log("getting metadata from server")
                    next(metadata);
                },
                onReceiveMessage: function (message, next) {
                    console.log("Message incoming from server..");
                    next(message);
                },
                onReceiveStatus: function (status, next) {
                    console.log("Final response status incoming from server..");
                    next(status);
                }
            };
            next(metadata, listener);
        },
        sendMessage: function (message, next) {
            console.log("Sending message now..");
            next(message);
        },
        halfClose: function (next) {
            console.log("Waiting for server to send..");
            next();
        },
        cancel: function (message, next) {
            next();
        }
    };
    return new grpc.InterceptingCall(nextCall(options), requester);
};






const client = new basic_proto(`0.0.0.0:50050`, grpc.credentials.createInsecure(), { interceptors: [authInterceptor] });



client.unaryMethod({ clientText: "ok" }, callback);

function callback(err, res) {

    if (err) {
        console.log(err.code);
        console.log(err.details);
    } else {
        console.log(res);
    }
}




