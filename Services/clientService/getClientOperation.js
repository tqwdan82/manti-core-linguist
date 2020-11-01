const serverManager = require('../../Utils/serverManager')

const operation = {
    loadOperation: function(serviceManager, inputs, callback, mcHeader){

        let serviceName = inputs.serviceName;
        let clientServices = serverManager.getClientService(serviceName);
        let returnData = {
            status : "OK",
            details: "Defintions retrieved",
            data: clientServices
        }
        callback(returnData);
        
    }
}
module.exports = operation;