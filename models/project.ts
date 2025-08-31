import { Schema, model, models, Document, Model } from "mongoose";

export interface IProject extends Document {
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

const ProjectSchema = new Schema<IProject>({
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

export const Project: Model<IProject> = models.Project || model<IProject>("Project", ProjectSchema);
export default Project;