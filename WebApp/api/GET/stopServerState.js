//operation object
const operation = {
    details : {
        description: "Standard create operation for craftsmanForm"
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

        var handler = function(response){
            httpObj.responseData = {"data":response.data}; //set the response data
            httpObj.completeHttpResponse(httpObj); // respond to the http call   
        }

       serviceManager.callOperation("linguist", "main", "stopServerOperation", 
                                       {}, handler, httpObj.request.mcHeader);
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
