import { Schema, model, models, Document, Model } from "mongoose";

export interface ISession extends Document {
  name: string;
  description?: string;
  thumbnail?: string;
  ownerId: string;
  isPublic: boolean;
  tags: string[];
  folderId?: string;
  collaborators: string[];
  canvasData?: any;
  layers?: any[];
  settings: any;
}

const SessionSchema = new Schema<ISession>({
  name: { type: String, required: true },
  description: String,
  thumbnail: String,
  ownerId: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  tags: [String],
  folderId: String,
  collaborators: [String],
  canvasData: Schema.Types.Mixed,
  layers: [Schema.Types.Mixed],
  settings: Schema.Types.Mixed,
}, { timestamps: true });

export const Session: Model<ISession> = models.Session || model<ISession>("Session", SessionSchema);
export default Session;