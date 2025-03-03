const grpc = require("@grpc/grpc-js");
const protoloader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "../../../basic.proto";

const packageDefinition = protoloader.loadSync(PROTO_PATH);
const basic_proto = grpc.loadPackageDefinition(packageDefinition).sampleService;
const client = new basic_proto(`0.0.0.0:50050`, grpc.credentials.createInsecure());

//extracting call method as both server and client will be talking over stream 
//no need of request here
const call = client.duplexStreamMethod();

//first msg sent by client 
call.write({ clientText: new Date() });
call.write({ clientText: new Date() });
call.write({ clientText: new Date() });

//when total msg exceeds 3 then cal will be cancelled
let totalMsg = 0;
call.on("data", (res) => {
    console.log(res);
    totalMsg++;
    if(totalMsg>2){
        //remember cancel exits with status 1 [CANCELLED] and call.end() terminates with status 0 [OK]
        call.cancel(); //cancel the call
    }
})
//check stream status here
call.on('status', statusObject => {
    console.log(`received call status with code ${grpc.status[statusObject.code]}`);
  });
//cancel throws an error
  call.on('error',(err)=>{
   console.log(err.details);
  })
//at this point server ended streaming but client still working
call.on("end", () => {
    console.log("server stream ended. Client also ending..");
    call.end(); //ending client stream also
})







