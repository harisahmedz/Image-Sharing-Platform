class HttpError extends Error{
    constructor(message, errorCode){
        super(message); //Adda message property
        this.code = errorCode;
    }



}

module.exports = HttpError;