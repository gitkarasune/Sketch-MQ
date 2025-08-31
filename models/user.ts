import { Schema, model, models, Document, Model } from "mongoose";

export interface IUser extends Document {
  username?: string;
  email: string;
  password: string;
  name?: string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: String,
}, { timestamps: true }); 

export const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);
export default User;

