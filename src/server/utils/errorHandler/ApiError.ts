export class ApiError extends Error {
    statusCode: number;
    success: boolean;
    constructor(options: {
        message: string;
        success: boolean;
        statusCode: number;
        cause?: Error;
    }){
        super(options.message, { cause: options.cause });
        this.statusCode = options.statusCode;
        this.success = options.success;
    }
}
