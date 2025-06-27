import { UserActivity } from "../models/UserActivity";

export const logActivity = async(req,res)=>{
  try{
    const activity = new UserActivity(req.body);
    await activity.save();// it saves the data in yoyr mongoose dn
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};