import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    venue: { type: String },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
