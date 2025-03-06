const jwt = require('jsonwebtoken');
const JWT_SECERT = 'qwe123';
const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "../../../basic.proto";

const packageDefinition = protoloader.loadSync(PROTO_PATH);
const basic_proto = grpc.loadPackageDefinition(packageDefinition).sampleService;
const client = new basic_proto(`0.0.0.0:50050`, grpc.credentials.createInsecure());

let userId = 1234;
let generatedToken = jwt.sign({userId},JWT_SECERT,{expiresIn: '1h'}); //generating dummy token

const requestMetadata = new grpc.Metadata();
requestMetadata.set('authorization', `Bearer ${generatedToken}`); //set metadata as authorization

client.authenticator({ clientText: "Please authorize me!" },requestMetadata, callback);


function callback(err, res) {
    if (err) {
        console.log(err.code);
        console.log(err.details);
    } else {
        console.log(res);
    }
}




