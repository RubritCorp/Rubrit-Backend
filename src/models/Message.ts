import { model, models, Schema, Types } from "mongoose";

const messageSchema = new Schema(
  {
    sender: {
      type: Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: Types.ObjectId,
      ref: "Chat",
    },
  },
  {
    timestamps: true,
  }
);

export default models.Chat || model("Message", messageSchema);