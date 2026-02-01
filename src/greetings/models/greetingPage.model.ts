import mongoose, { Model, Schema } from "mongoose";

export interface IGreetingPage {
  _id: mongoose.Types.ObjectId;
  accessCode: string;
  createdAt: Date;
  ownerId: mongoose.Types.ObjectId;
  status: "active" | "archived";
  title: string;
  updatedAt: Date;
}

const GreetingPageSchema = new Schema<IGreetingPage>(
  {
    accessCode: {
      index: true,
      required: true,
      type: String,
      unique: true,
    },
    ownerId: {
      index: true,
      ref: "User",
      required: true,
      type: Schema.Types.ObjectId,
    },
    status: {
      default: "active",
      enum: ["active", "archived"],
      type: String,
    },
    title: {
      required: true,
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const GreetingPage: Model<IGreetingPage> = mongoose.model<IGreetingPage>("GreetingPage", GreetingPageSchema);

export default GreetingPage;
