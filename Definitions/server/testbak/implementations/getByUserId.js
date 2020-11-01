const data = require('../users');
const operation = function (serviceManager ,inputs, channel) {
    const allAccessObj = { appresources: [ '*' ], dbresources: ['*'] };
    let serviceHandler = function(response){
        channel.send(response.data)
    }
    serviceManager.callOperation("app", 'Test', "Test2Operation", 
        inputs, serviceHandler, allAccessObj);

}

module.exports = operation