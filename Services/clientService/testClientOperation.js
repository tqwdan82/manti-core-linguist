const serverManager = require('../../Utils/serverManager')

const operation = {
    loadOperation: function(serviceManager, inputs, callback, mcHeader){

        console.log(inputs)
        // let rData; 
        let unaryCallback =function(err, allData){
            if(err){
                console.log(err)
                let returnData = {
                    status : "Failed",
                    details: "Service call completed with error: "+err,
                    data: {}
                }
                callback(returnData);
            }else{
                // rData = allData;
                let returnData = {
                    status : "OK",
                    details: "Service call completed",
                    data: allData
                }
                callback(returnData);
            }
        };

        let rData = [];
        let dataCallback = function(allData){
            rData.push(allData); 
        };
        let endCallback = function(){
            console.log("Stream end");
            let returnData = {
                status : "OK",
                details: "Service call completed",
                data: rData
            }
            callback(returnData);
        };
        let errorCallback = function(err){
                
            let returnData = {
                status : "Failed",
                details: "Service call completed with error: "+err,
                data: rData
            }
            callback(returnData);
        };
        let statusCallback = function(status){
            console.log(status)
        }

        if( inputs.functionType === 'UNARY'){
            // console.log(JSON.parse(inputs.inputData))
            serverManager.call(inputs.serviceName, inputs.functionName, 
                {
                    inputs: JSON.parse(inputs.inputData),//{userId:1}, 
                    unaryCallback : unaryCallback
                }
            );

        }else if( inputs.functionType === 'CLIENT_STREAM'){

            let svcCall = serverManager.call(inputs.serviceName, inputs.functionName, 
                {
                    dataCallback :dataCallback,
                    endCallback :endCallback,
                    errorCallback :errorCallback,
                    statusCallback :statusCallback
                }
            );
            svcCall.write(JSON.parse(inputs.inputData));
            svcCall.end();

        }else if( inputs.functionType === 'SERVER_STREAM'){

            serverManager.call(inputs.serviceName, inputs.functionName, 
                {
                    inputs: JSON.parse(inputs.inputData),//{userId:1}, 
                    dataCallback :dataCallback,
                    endCallback :endCallback,
                    errorCallback :errorCallback,
                    statusCallback :statusCallback
                }
            );

        }else if( inputs.functionType === 'BI_STREAM'){

            let svcCall = serverManager.call(inputs.serviceName, inputs.functionName, 
                {
                    dataCallback :dataCallback,
                    endCallback :endCallback,
                    errorCallback :errorCallback,
                    statusCallback :statusCallback
                }
            );
            svcCall.write(JSON.parse(inputs.inputData));
            svcCall.end();

        }



        // let returnData = {
        //     status : "OK",
        //     details: "Definitions uploaded",
        //     data: rData
        // }
        // callback(returnData);
        
    }
}
module.exports = operation;