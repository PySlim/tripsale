export default class ExpressReviewsError extends Error{
    statusCode: number;
    type: string;
    details:string;
    timesTamp: string;
    techInfo: string;
    constructor(message: string, statusCode:number, type: string, details?: string, error?: any ){
        super(message);
        this.statusCode = statusCode || 500;
        this.type = type || "GeneralError";
        this.details = details || '';
        this.timesTamp = new Date().toISOString();
        this.techInfo=error instanceof Error ? error.message : "Details not available";
    }
};
