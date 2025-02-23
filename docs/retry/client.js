const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "../../../basic.proto";

const packageDefinition = protoloader.loadSync(PROTO_PATH);
const basic_proto = grpc.loadPackageDefinition(packageDefinition).sampleService;

//defining service config
const serviceConfig = {
    loadBalancingConfig: [],
    methodConfig: [
        {
            name: [
                {
                    service: 'sampleService'
                },
            ],
            retryPolicy: {
                maxAttempts: 4,
                initialBackoff: '1s',
                maxBackoff: '1s',
                backoffMultiplier: 1.0,
                retryableStatusCodes: ['UNAVAILABLE'], //we can add the status on which we should retry , like we would not want to retry if got INVALID_ARGUMENT error
            },
        },
    ],
};
const client = new basic_proto(`0.0.0.0:50050`, grpc.credentials.createInsecure(), { 'grpc.service_config': JSON.stringify(serviceConfig) });



client.unaryMethod({ clientText: "ok" }, callback);

function callback(err, res) {

    if (err) {
        console.log(err.code);
        console.log(err.details);
    } else {
        console.log(res);
    }
}




