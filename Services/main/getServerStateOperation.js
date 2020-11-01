const serverManager = require('../../Utils/serverManager')

const operation = {
    loadOperation: function(serviceManager, inputs, callback, mcHeader){

        let returnData = {
            status : "OK",
            details: "Server status retrieved",
            data: serverManager.getServerStatus()
        }
        callback(returnData);
        
    }
}
module.exports = operation;