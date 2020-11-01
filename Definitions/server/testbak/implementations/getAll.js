const data = require('../users');
const operation = function (serviceManager ,inputs, channel) {
    const allAccessObj = { appresources: [ '*' ], dbresources: ['*'] };
    let serviceHandler = function(response){

        response.data.forEach(function (data) {
            channel.send(data);
        });
        channel.end();
    }
    serviceManager.callOperation("app", 'Test', "Test1Operation", 
        inputs, serviceHandler, allAccessObj);

}

module.exports = operation