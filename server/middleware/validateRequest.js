import { Schema } from 'mongoose'
import {userActivityValidationSchema } from './validators/userActivity.validator.js'

export const validateRequest =(schema) =>{
  return (req,res,next)=>{

    const {error}= schema.validate(req.body);
    if(error){
      return res.status(400) 
        .json({message: "bad request ", error})
    }
  next();
  };
};