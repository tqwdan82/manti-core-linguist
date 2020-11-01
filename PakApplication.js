const fs = require('fs')
const path = require('path')
const serverManager = require('./Utils/serverManager')
require('dotenv').config();

const pakDetails = {
    "AI_Enabled": false,
    "VI_Enabled": false,
    "WI_Enabled": false,
    "DBI_Enabled": false,
    "pakCode":"MCP_LINGUIST_0_0_1",
    "Name":"Manti-core Lingust Package",
    "Description": "This is module using GRPC and Proto-buffer for API access",
    "WebContext": "linguist",
    "AppName": "linguist"
}

const init = function(dbMgr, svcMgr, webMgr){
    PakManager.dbMgr = dbMgr;
    PakManager.svcMgr = svcMgr;
    PakManager.webMgr = webMgr;
    let allAccessObj = { appresources: [ '*' ], dbresources: ['*'] };

    // //look at all the package models and create them
    // let modelsPath =  path.join(__dirname, 'Models');
    // let allPromises = [];
    // if (fs.existsSync(modelsPath)) //if the models directory exists
    // {
    //     //get all models file name
    //     let modFileNames = fs.readdirSync(modelsPath);
    //     //iterate all models file name
    //     modFileNames.forEach(function(modFileName) {
    //         let modelFilePath = path.join(modelsPath, modFileName)
    //         allPromises.push(dbMgr.addModel(modelFilePath, modFileName));
    //     });
    // }
    // Promise.all(allPromises).then(function() {
    //     // all loaded
    //   }, function() {
    //     // one or more failed
    //     console.log("Cannot get the email servers configuration data.");
    // });

    //look at all the services and operations
    let svcsPath =  path.join(__dirname, 'Services');
    if (fs.existsSync(svcsPath)) //if the services directory exists
    {
        //get all contexts
        let services = fs.readdirSync(svcsPath);
        //iterate all services
        services.forEach(function(service) {

            let svcDirPath = path.join(svcsPath, service)
            //read and iterate the service for all the operations
            let operations = fs.readdirSync(svcDirPath);
            //iterate all operations to slice the extention
            let returnOperations = [];
            operations.forEach(function(operation) {
                // console.log(svcDirPath, operation);
                var opName = operation.substring(0, operation.indexOf(".js"));
                returnOperations.push(opName);
            });

            //register the service and operations
            svcMgr.ServiceManager.registerPackageService(
                svcsPath,
                pakDetails.AppName,
                service,
                returnOperations
            );

        });
    }

    // //look at all web app contexts
    let webAppContextsPath =  path.join(__dirname, 'WebApp', "views");
    // //get all other scripts and css directories
    let scriptDirs = [];
    if (fs.existsSync(webAppContextsPath)) //if the web app directory exists
    {
        //get all contexts
        let contexts = fs.readdirSync(webAppContextsPath);
        //iterate all context to add scripts and css directoryu
        contexts.forEach(function(context) {
            scriptDirs.push(path.join(webAppContextsPath, context,"main","script"));
            // scriptDirs.push(path.join(webAppContextsPath, context,"forms","script"));
            // scriptDirs.push(path.join(webAppContextsPath, context,"pages"));
            // scriptDirs.push(path.join(webAppContextsPath, context,"main","static"));
            //scriptDirs.push(path.join(webAppContextsPath, context,"pages"));
        });
    }

    //register the view with the platform
    PakManager.webMgr.registerView({
        contextPath: pakDetails.WebContext,
        directory: webAppContextsPath,
        miscellaneous: scriptDirs
    });

    serverManager.init(svcMgr.ServiceManager)
    serverManager.startServer();

    //testing start
    // serverManager.call('UserService', 'getByUserId', 
    //     {
    //         inputs: {userId:1}, 
    //         unaryCallback : function(err, allData){
    //             if(err){
    //                 console.log(err)
    //             }else{
    //                 console.log("=================================allData start")
    //                 console.log(allData);
    //                 console.log("=================================allData end")
    //             }
    //         }
    //     }
    // );

    // let callObj = serverManager.call('UserService', 'saveAll', 
    // serverManager.call('UserService', 'getAll', 
    //     {
    //         inputs: {}, 
    //         dataCallback : function(allData){
                
    //             console.log("=================================allData start")
    //             console.log(allData);
    //             console.log("=================================allData end")
                
    //         },
    //         endCallback : function(){
                
    //             console.log("=================================DONE LIAO")
                
    //         },
    //         errorCallback : function(err){
                
    //             console.log("=================================err start")
    //             console.log(err);
    //             console.log("=================================err end")
                
    //         },
    //         statusCallback : function(status){
                
    //             console.log("=================================statusCallback start")
    //             console.log(status);
    //             console.log("=================================statusCallback end")
                
    //         }
    //     }
    // );
    // console.log("=================================callObj start")
    // console.log(callObj)
    // console.log("=================================callObj end")
    // for(let i =10; i < 15; i++){
    //     callObj.write(
    //         {user:{
    //             id: i,
    //             firstName: 'John',
    //             lastName: 'Williams' + i,
    //             birthday: new Date(2010, 9, 22).getTime(),
    //             vehicles: [
    //                 { id: 1, regNumber: 'PSKSL239DJ30D' },
    //                 { id: 2, regNumber: 'KJSHKASHIHXNI' }
    //             ]
    //         }}
    //     )
    // }
    // callObj.end();
    //testing end
}

const undeploy = function(dbMgr, svcMgr, webMgr, appMessenger){
    serverManager.stopServer();
};

const PakManager = {
    init:init,
    undeploy: undeploy,
    pakDetails:pakDetails
};

module.exports = PakManager;