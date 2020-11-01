const serverManager = require('../../Utils/serverManager')

const operation = {
    loadOperation: function(serviceManager, inputs, callback, mcHeader){
        console.log(inputs)
        serverManager.saveClientProto(inputs);
        let returnData = {
            status : "OK",
            details: "Proto saved",
            data: inputs
        }
        callback(returnData);
        
    }
}
module.exports = operation;