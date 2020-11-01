const serverManager = require('../../Utils/serverManager')

const operation = {
    loadOperation: function(serviceManager, inputs, callback, mcHeader){
        // console.log(inputs)
        serverManager.saveClientDefinition(inputs);
        let returnData = {
            status : "OK",
            details: "Defintions retrieved",
            data: inputs
        }
        callback(returnData);
        
    }
}
module.exports = operation;