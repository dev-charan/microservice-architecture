import mongoose, { Document, Model, Schema } from "mongoose"

export interface Todo extends Document{
  user:Schema.Types.ObjectId,
  title:string,
  description:string,
  status:string
}

export const DOCUMENT_NAME ="Todo"
export const COLLETION_NAME ="todos"

export enum Stauts {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  DONE="DONE"
}
const todoModel = new Schema<Todo>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: Stauts.NOT_STARTED,
      enum: Object.values(Stauts),
    },
  },
  {
    timestamps: true,
  }
);

const Todo :Model<Todo> = mongoose.model<Todo>(DOCUMENT_NAME,todoModel, COLLETION_NAME)

export default Todo
