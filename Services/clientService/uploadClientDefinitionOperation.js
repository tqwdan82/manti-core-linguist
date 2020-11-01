const serverManager = require('../../Utils/serverManager')

const operation = {
    loadOperation: function(serviceManager, inputs, callback, mcHeader){

        let serviceName = inputs.dataFile.originalname.split(".")[0]
        serverManager.register(serviceName, "client", inputs.dataFile);
        let returnData = {
            status : "OK",
            details: "Definitions uploaded",
            data: inputs
        }
        callback(returnData);
        
    }
}
module.exports = operation;