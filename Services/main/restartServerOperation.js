const serverManager = require('../../Utils/serverManager')

const operation = {
    loadOperation: function(serviceManager, inputs, callback, mcHeader){

        serverManager.restart();
        let returnData = {
            status : "OK",
            details: "Server status restarted",
            data: {}
        }
        callback(returnData);
        
    }
}
module.exports = operation;