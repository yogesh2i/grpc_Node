const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "../../../../basic.proto";

const packageDefinition = protoloader.loadSync(PROTO_PATH);
const basic_proto = grpc.loadPackageDefinition(packageDefinition).sampleService;
const client = new basic_proto(`0.0.0.0:50050`, grpc.credentials.createInsecure());

//extracting call method as both server and client will be talking over stream 
//no need of request here
const call = client.duplexStreamMethod();

//first msg sent by client 
call.write({ clientText: new Date() });

//runs when it gets a reply from server and again sends back a msg using call.write 
call.on("data", (res) => {
    console.log(res);
    call.write({ clienttext: "This msg is from client" });
})

//at this point server ended streaming but client still working
call.on("end", () => {
    console.log("server stream ended. Client also ending..");
    call.end(); //ending client stream also
})







