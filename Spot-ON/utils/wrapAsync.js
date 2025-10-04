// They do error handling for Async functions
// when we put it around routes it acts like a simple try and catch block

module.exports = function wrapAsync(fn){
    return function(req,res,next){
        fn(req,res,next).catch((err)=> next(err)); 
    };
};
