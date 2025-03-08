const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "../../../basic.proto";

const packageDefinition = protoloader.loadSync(PROTO_PATH);
const basic_proto = grpc.loadPackageDefinition(packageDefinition).sampleService;


const authInterceptor = function (options, nextCall) {
    const requester = {
        start: function (metadata, listener, next) {
            listener = {
                onReceiveStatus: function (status, next) {
                    console.log("Final response status incoming from server..");
                    next(status);
                }
            };
            next(metadata, listener);
        },
      
    };
    return new grpc.InterceptingCall(nextCall(options), requester);
};






const client = new basic_proto(`0.0.0.0:50050`, grpc.credentials.createInsecure(), { interceptors: [authInterceptor] });

client.unaryMethod({ clientText: "Hey! I am here." }, callback);




function callback(err, res) {

    if (err) {
        console.log(err.code);
        console.log(err.details);
    } else {
        console.log(res);
    }
}




