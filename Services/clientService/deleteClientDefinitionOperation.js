const serverManager = require('../../Utils/serverManager')

const operation = {
    loadOperation: function(serviceManager, inputs, callback, mcHeader){

        serverManager.deleteClientService(inputs);
        let returnData = {
            status : "OK",
            details: "Definitions deleted",
            data: inputs
        }
        callback(returnData);
        
    }
}
module.exports = operation;