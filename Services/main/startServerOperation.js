const serverManager = require('../../Utils/serverManager')

const operation = {
    loadOperation: function(serviceManager, inputs, callback, mcHeader){

        serverManager.startServer();
        let returnData = {
            status : "OK",
            details: "Server status started",
            data: {}
        }
        callback(returnData);
        
    }
}
module.exports = operation;