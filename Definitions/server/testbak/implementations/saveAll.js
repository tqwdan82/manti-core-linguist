const data = require('../users');

const operation = function (serviceManager ,inputs, channel) {
    const allAccessObj = { appresources: [ '*' ], dbresources: ['*'] };
    
    //recieve hook handler
    let asyncInputHandler = function(inData){
        let serviceHandler = function(response){

            //handler to send back a response thru the server streaming channel
            let rHandler = function(r){
                channel.send(r.data)
            }
            
            serviceManager.callOperation("app", 'Test', "Test2Operation", 
                {userId:response.data.user.id}, rHandler, allAccessObj);

        }
        serviceManager.callOperation("app", 'Test', "Test3Operation", 
            inData, serviceHandler, allAccessObj);
    };
    channel.regRecieveHook(asyncInputHandler);

    //on client side end hook
    let asyncInputEndHandler = function(inData){
        let serviceHandler = function(response){
            // console.log(response)
            channel.end();
        }
        serviceManager.callOperation("app", 'Test', "Test4Operation", 
            inData, serviceHandler, allAccessObj);
        
    };
    channel.regRecieveEndHook(asyncInputEndHandler);

    //test to send another additional stream data to client
    channel.send({
        user:{
            id: 6,
            firstName: 'Bill',
            lastName: 'Gates',
            birthday: new Date(1978, 4, 21).getTime(),
        }
    })
}

module.exports = operation