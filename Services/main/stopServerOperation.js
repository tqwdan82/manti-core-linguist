const serverManager = require('../../Utils/serverManager')

const operation = {
    loadOperation: function(serviceManager, inputs, callback, mcHeader){

        serverManager.stopServer();
        let returnData = {
            status : "OK",
            details: "Server status retrieved",
            data: {}
        }
        callback(returnData);
        
    }
}
module.exports = operation;