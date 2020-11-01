const fs = require('fs')
const path = require('path')
const grpc = require('../lib/node_modules/grpc');
const protoLoader = require('../lib/node_modules/@grpc/proto-loader');
const unzipper = require('../lib/node_modules/unzipper');

let serviceManager = null;
let server = null;
let serverIsUpdated = true;
let serverStarted = true;
let clientServices = {};
let PORT = 9000;

const connMgr = {
    init: function(svcManager){
        serviceManager = svcManager;
    },
    getServerStatus: function(){
        
        return {
            serverIsUpdated:serverIsUpdated,
            serverStarted:serverStarted
        };
    },
    deleteClientService: function(clientObj){
        // console.log(clientObj)
        if(typeof clientObj === 'undefined') return;

        if( !(typeof clientObj.serviceName === 'undefined'
            || clientObj.serviceName === null) ){

            let defPath =  path.join(__dirname, '..', 'Definitions', 'client', clientObj.serviceName);
            try{
                fs.rmdirSync(defPath, { recursive: true })
                console.log( "Definitions deleted! ")
                //notification of server restart required
                serverIsUpdated = false;
            } catch (err) {
                if(err) {
                    console.log("Couldn't delete defintions: " + err);
                }
            };
        }
    },
    saveClientProto: function(clientObj){

        if(typeof clientObj === 'undefined') return;
        
        if( !(typeof clientObj.serviceName === 'undefined'
            || clientObj.serviceName === null) ){

            let protoPath =  path.join(__dirname, '..', 'Definitions', 'client', clientObj.serviceName, 'definition.proto');
            try{
                fs.writeFileSync(protoPath, clientObj.protoContent)
                console.log( "Proto saved! ")
                //notification of server restart required
                serverIsUpdated = false;
            } catch (err) {
                if(err) {
                    console.log("Couldn't save proto: " + err);
                }
            };
        }
    },
    saveClientDefinition: function(clientObj){
        
        if(typeof clientObj === 'undefined') return;

        if( !(typeof clientObj.serviceName === 'undefined'
            || clientObj.serviceName === null) ){

            let defJSONPath =  path.join(__dirname, '..', 'Definitions', 'client', clientObj.serviceName, 'definition.json');
            let defJSONString = fs.readFileSync(defJSONPath);
            let defJSONObj = JSON.parse(defJSONString);

            defJSONObj.serverURL = clientObj.serverURL;

            const data = JSON.stringify(defJSONObj);
            try{
                fs.writeFileSync(defJSONPath, data)
                console.log( "Definition saved! ")
                    //notification of server restart required
                    serverIsUpdated = false;
            } catch (err) {
                if(err) {
                    console.log("Couldn't save defintion: " + err);
                }
            };
        }
        
    },
    getClientService: function(serviceName){

        console.log(clientServices);

        if( typeof serviceName === 'undefined'
            || serviceName === null){ // retrieve all

            let returnData = {};
            let defsPath =  path.join(__dirname, '..', 'Definitions', 'client');
            if (fs.existsSync(defsPath)) //if the definition directory exists
            {
                let definitionsDirs = fs.readdirSync(defsPath);
                definitionsDirs.forEach(function(definitionsDir) {

                    let definitionDirPath = path.join(defsPath, definitionsDir);
                    let protoPath = path.join(definitionDirPath, 'definition.proto');
                    let protoContent = fs.readFileSync(protoPath, 'utf8');

                    let defJSONPath = path.join(definitionDirPath, 'definition.json');
                    let defJSONString = fs.readFileSync(defJSONPath);
                    let defJSONObj = JSON.parse(defJSONString);

                    let functions = [];
                    let serviceName = "";
                    Object.keys(clientServices).forEach(key=>{
                        let clientService = clientServices[key];
                        if(clientService.directory === definitionsDir){
                            functions = clientService.serviceFunctions;
                            serviceName = key;
                        }
                    });

                    returnData[definitionsDir] = {
                        serverURL: defJSONObj.serverURL,
                        protoContent: protoContent,
                        serviceFunctions:functions, 
                        serviceName:serviceName
                    }

                    
                });
            }
            return returnData;

        } else { // find based on serviceName
            let returnData = {};
            let defsPath =  path.join(__dirname, '..', 'Definitions', 'client');
            if (fs.existsSync(defsPath)) //if the definition directory exists
            {
                let definitionsDirs = fs.readdirSync(defsPath);
                definitionsDirs.forEach(function(definitionsDir) {

                    if(definitionsDir === serviceName){

                        let definitionDirPath = path.join(defsPath, definitionsDir);
                        let protoPath = path.join(definitionDirPath, 'definition.proto');
                        let protoContent = fs.readFileSync(protoPath);
                        let defJSONPath = path.join(definitionDirPath, 'definition.json');
                        let defJSONString = fs.readFileSync(defJSONPath);
                        let defJSONObj = JSON.parse(defJSONString);

                        returnData[definitionsDir] = {
                            serverURL: defJSONObj.serverURL,
                            protoContent: protoContent
                        }

                    }

                });
            }
            return returnData;
        }
    },
    register: function(name, type, file){
        if(type === 'client'){
            
            let defsPath =  path.join(__dirname, '..', 'Definitions', 'client', name);
            fs.createReadStream(file.path).pipe(unzipper.Extract({ path: defsPath }));
            serverIsUpdated = false;
        }
        else if(type === 'sever'){
            let defsPath =  path.join(__dirname, '..', 'Definitions', 'sever', name);
            fs.createReadStream(file).pipe(unzipper.Extract({ path: defsPath }));
            serverIsUpdated = false;
        }
    },
    call: function(serviceName, functionName, handlers){
        let returnHandlers = {};
        let service = clientServices[serviceName];
        if(typeof service !== 'undefined'){
            let func = service.serviceFunctions[functionName];
            let stub = service.serviceStub;
            if(typeof func !== 'undefined'){
                if(func.type === 'UNARY'){
                    stub[functionName](handlers.inputs, //input
                        handlers.unaryCallback//(err, data) //callback
                    );
                }else if(func.type === 'CLIENT_STREAM'){
                    //from client's perspective
                    stub[functionName](handlers.inputs);
                    returnHandlers = call;
                    
                }else if(func.type === 'SERVER_STREAM'){
                    //from client's perspective
                    let call = stub[functionName](handlers.inputs); //call

                    if(typeof handlers.dataCallback !== 'undefined'){
                        call.on('data', handlers.dataCallback);
                    }
                    if(typeof handlers.endCallback !== 'undefined'){
                        call.on('end', handlers.endCallback);
                    }
                    if(typeof handlers.errorCallback !== 'undefined'){
                        // An error has occurred and the stream has been closed.
                        call.on('error', handlers.errorCallback); //function(error)
                    }
                    if(typeof handlers.statusCallback !== 'undefined'){
                        // process status
                        call.on('status', handlers.statusCallback); //function(status)
                    }
                    
                }else if(func.type === 'BI_STREAM'){
                    let call = stub[functionName](); //call
                    // console.log("=================================call.write start")
                    // console.log(call.write)
                    // console.log("=================================call.write end")

                    returnHandlers = call;

                    if(typeof handlers.dataCallback !== 'undefined'){
                        call.on('data', handlers.dataCallback);
                    }
                    if(typeof handlers.endCallback !== 'undefined'){
                        call.on('end', handlers.endCallback);
                    }
                    if(typeof handlers.errorCallback !== 'undefined'){
                        // An error has occurred and the stream has been closed.
                        call.on('error', handlers.errorCallback); //function(error)
                    }
                    if(typeof handlers.statusCallback !== 'undefined'){
                        // process status
                        call.on('status', handlers.statusCallback); //function(status)
                    }
                }
            }
        }

        return returnHandlers;
    },
    restart: function(){

        if(server != null){
            console.log(`Server is shutting down...`);
            let shutDownPromise = new Promise( (resolve, reject) => {
                server.tryShutdown(function () {
                    resolve(true);
                });
            });

            shutDownPromise
            .then( (success) => {
                console.log("Server is shutdown.")
                this.startServer();
            });
        }else{
            console.log(`Server is not started, starting...`);
            this.startServer();
        }
    },
    startServer: function(){
        if(server == null){
            server = new grpc.Server();

            registerServerFunctions(server);

            server.bind(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure());
            server.start();
            console.log(`Starting server on port ${PORT}`);

            registerClientFunctions(clientServices);
            serverIsUpdated = true;
            serverStarted = true;
            
        }else{
            console.log(`Server already started on port ${PORT}`);
        }

    },
    stopServer: function(){
        server.tryShutdown(function () {
            console.log('Server stopped.')
            deleteServer();
            serverStarted = false;
        });
    }
};

const registerClientFunctions = function(clientServices){
    let defsPath =  path.join(__dirname, '..', 'Definitions', 'client');
    if (fs.existsSync(defsPath)) //if the definition directory exists
    {
        let definitionsDirs = fs.readdirSync(defsPath);
        definitionsDirs.forEach(function(definitionsDir) {
            let definitionDirPath = path.join(defsPath, definitionsDir);
            let protoPath = path.join(definitionDirPath, 'definition.proto');
            let defJSONPath = path.join(definitionDirPath, 'definition.json');
            let defJSONString = fs.readFileSync(defJSONPath);
            let defJSONObj = JSON.parse(defJSONString);

            let packageDefinition = protoLoader.loadSync(
                protoPath,
                {keepCase: true,
                 longs: String,
                 enums: String,
                 defaults: true,
                 oneofs: true
                }
            );

            let serviceDef = grpc.loadPackageDefinition(packageDefinition);
            
            Object.keys(serviceDef).forEach(def => {
                let definition = serviceDef[def];
                if (typeof definition === 'function'){
                    funcNames = Object.keys(definition.service);
                    let functions = {};
                    funcNames.forEach(funcName => {

                        let functinDef = definition.service[funcName];
                        let functionType = "";
                        if(!functinDef.requestStream && !functinDef.responseStream) functionType = 'UNARY'
                        else if(functinDef.requestStream && !functinDef.responseStream) functionType = 'CLIENT_STREAM'
                        else if(!functinDef.requestStream && functinDef.responseStream) functionType = 'SERVER_STREAM'
                        else if(functinDef.requestStream && functinDef.responseStream) functionType = 'BI_STREAM'

                        let func = {
                            // functionName:funcName,
                            type: functionType
                        };
                        functions[funcName] = func
                    });
                    // console.log("=================================serviceDef start")
                    let stub = new serviceDef[def](defJSONObj.serverURL, grpc.credentials.createInsecure());
                    // let stub = new serviceDef.UserService(defJSONObj.serverURL, grpc.credentials.createInsecure());
                    
                    let clientService = {
                        // serviceName: def,
                        directory:definitionsDir,
                        serviceStub: stub,
                        serviceFunctions: functions
                    };
                    // clientServices.push(clientService);
                    clientServices[def] = clientService
                    // console.log(stub)
                    // console.log("=================================serviceDef start")
                }
            });
        });
    }
};



const registerServerFunctions = function(server){
    //look at all the definitions and then initialize them
    let defsPath =  path.join(__dirname, '..', 'Definitions', 'server');
    // console.log(defsPath);
    if (fs.existsSync(defsPath)) //if the definition directory exists
    {
        let definitionsDirs = fs.readdirSync(defsPath);
        definitionsDirs.forEach(function(definitionsDir) {
            let definitionDirPath = path.join(defsPath, definitionsDir)
            
            //read the proto file
            let protoPath = path.join(definitionDirPath, 'definition.proto')
            let packageDefinition = protoLoader.loadSync(
                protoPath,
                {
                    keepCase: true,
                    longs: String,
                    enums: String,
                    defaults: true,
                    oneofs: true
                });
            let serviceDef = grpc.loadPackageDefinition(packageDefinition);

            // console.log("=================================serviceDef start")
            let serviceName = "";
            let functions = [];
            Object.keys(serviceDef).forEach(def => {

                let definition = serviceDef[def];
                if (typeof definition === 'function'){
                    serviceName = def;
                    let funcNames = Object.keys(definition.service);

                    // console.log(funcNames)
                    funcNames.forEach(funcName => {
                        // console.log(definition.service[funcName])
                        // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")

                        let functinDef = definition.service[funcName];
                        let functionType = "";
                        if(!functinDef.requestStream && !functinDef.responseStream) functionType = 'UNARY'
                        else if(functinDef.requestStream && !functinDef.responseStream) functionType = 'CLIENT_STREAM'
                        else if(!functinDef.requestStream && functinDef.responseStream) functionType = 'SERVER_STREAM'
                        else if(functinDef.requestStream && functinDef.responseStream) functionType = 'BI_STREAM'

                        let func = {
                            functionName:funcName,
                            type: functionType
                        };
                        functions.push(func)
                    });
                }
            });
            // console.log(functions)
            // console.log("=================================serviceDef end")

            //read the implementation
            let implementationDirPath = path.join(definitionDirPath, 'implementations')
            let implSvcObject = {};
            
            // Object.keys(implementation.services).forEach( serviceKey => {
            functions.forEach( (func) => {

                let implementationPath = path.join(implementationDirPath, func.functionName+'.js')
                if (fs.existsSync(implementationPath)) {
                
                    let implementation = require(implementationPath);


                    if(func.type == "UNARY"){
                        implSvcObject[func.functionName] = createUnaryCallHandler(implementation)
                    }
                    else if(func.type == "SERVER_STREAM"){
                        implSvcObject[func.functionName] = createServerStreamCallHandler(implementation)
                    }
                    else if(func.type == "BI_STREAM"){
                        implSvcObject[func.functionName] = createBiStreamCallHandler(implementation)
                    }
                    else if(func.type == "CLIENT_STREAM"){
                        implSvcObject[func.functionName] = createClientStreamCallHandler(implementation)
                    }
                }
            });
            // console.log("=================================implSvcObject start")
            // console.log(implSvcObject)
            // console.log("=================================implSvcObject end")
            server.addService(serviceDef[serviceName].service, implSvcObject);
        });
    }
};

const createUnaryCallHandler = function(serviceCallback){
    return (call, callback) => {
        let handler = {
            send: function(data){
                callback(null, data);
            }
        }
        serviceCallback(serviceManager, call.request, handler);
    }
};

const createServerStreamCallHandler = function(serviceCallback){
    return (call) => {
        let handler = {
            send: function(data){
                call.write(data);
            },
            end: function(){
                call.end()
            }
        }
        serviceCallback(serviceManager, call.request, handler);
    }
};

const createClientStreamCallHandler = function(serviceCallback){
    return (call, callback) => {
        let handler = {
            regRecieveHook: function(processor){
                call.on('data', function(req){
                    processor(req);
                });
            },
            regRecieveEndHook: function(processor){
                call.on('end', function(req){
                    processor(req);
                });
            },
            send: function(data){
                callback(null, data);
            },
        };
        serviceCallback(serviceManager, {}, handler);
    }
};

const createBiStreamCallHandler = function(serviceCallback){
    return (call) => {
        let handler = {
            regRecieveHook: function(processor){
                call.on('data', function(req){
                    // console.log("=================================data req start")
                    // console.log(req)
                    // console.log("=================================data req start")
                    processor(req);
                });
            },
            regRecieveEndHook: function(processor){
                call.on('end', function(req){
                    // console.log("=================================end req start")
                    // console.log(req)
                    // console.log("=================================end req start")
                    processor(req);
                });
            },
            send: function(data){
                console.log("calling write " + data)
                call.write(data);
            },
            end: function(){
                console.log("calling end ")
                call.end();
            }
        }
        serviceCallback(serviceManager, {}, handler);
    }
};

const deleteServer = function() {
    delete server;
    server = null;
};

module.exports = connMgr;