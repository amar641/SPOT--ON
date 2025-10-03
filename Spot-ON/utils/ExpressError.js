// this is our custom error class to display just the collect precise values from an express error
class ExpressError extends Error{
    constructor(statusCode, message, name){
        super();
        this.statusCode = statusCode;
        this.message = message;
        this.name = name;
    }
}

module.exports = ExpressError;