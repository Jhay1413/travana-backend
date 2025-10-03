// Assuming developers mark known operational errors with error.isOperational=true

process.on('uncaughtException', (error: Error) => {
  errorManagement.handler.handleError(error);
  if(!errorManagement.handler.isTrustedError(error))
    process.exit(1)
});
  
export class AppError extends Error {
  public readonly isOperational: boolean;
  public readonly statusCode: number; // Add a statusCode field to AppError

  constructor(description: string, isOperational: boolean, statusCode: number) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);
    this.isOperational = isOperational;
    this.statusCode = statusCode; // Initialize statusCode
    Error.captureStackTrace(this);
  }
}
  
class ErrorHandler {
  public async handleError(err: Error): Promise<void> {

      console.log(err)
  //   await logger.logError(err);
  //   await sendMailToAdminIfCritical();
  //   await saveInOpsQueueIfCritical();
  //   await determineIfOperationalError();
  };

  public isTrustedError(error: Error) {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }
}
  
export const handler = new ErrorHandler();
const errorManagement = {
  handler: handler
};

