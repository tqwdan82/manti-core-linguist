/** 
 * 
 **/
const fs = require('fs');
//server libraries
// const utils = require('../../../../../server/util/utils.js');
// const logger = utils.logger() // logger object

//operation object
const operation = {
    details : {
        description: "Get all item issue records grouped by Employees"
    },
    /** 
     * 
     * Header configuration requirement
     * modify this based on the requirements
     * 
     * 
    */
    headerConfig : {},
    /** 
     * 
     * Input data validation
     * modify this based on the requirements
     * 
     * 
    */
    inputValidation : function(data)
    {
        var check = true;
        return check;
    },
    //operation object
    loadWebOperation: function(serviceManager, httpObj)
    {
        //operation implementation
        
        /** 
         * 
         * OPERATION IMPLEMENTATION STARTS HERE
         * 
         * 
        */

       console.log(httpObj.request.file)
       const file = httpObj.request.file

        var handler = function(response){

            fs.unlinkSync(file.path);
            httpObj.responseData = {"data":response}; //set the response data
            httpObj.completeHttpResponse(httpObj); // respond to the http call   
        }

        serviceManager.callOperation("linguist", 'clientService', "uploadClientDefinitionOperation", 
            {dataFile: file}, handler, httpObj.request.mcHeader);
        
        /** 
         * 
         * OPERATION IMPLEMENTATION ENDS HERE
         * 
         * 
        */
    }
    
}

module.exports = {
    operation:operation
};
