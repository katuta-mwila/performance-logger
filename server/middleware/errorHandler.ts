import { NextFunction, Request, Response } from "express";
import ProblemDetails from "../ProblemDetails";

export default async function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction){
  if (res.headersSent) {
    return next(err)
  }

  if (process.env.NODE_ENV !== 'production')
    console.log(err)
  
  if (err instanceof ProblemDetails){
    res.status(err.statusCode)
    res.json(err)
    return
  }
  const pd = ProblemDetails.UnknownError()
  res.status(pd.statusCode)
  res.json(err)
}