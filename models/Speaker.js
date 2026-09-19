import mongoose from "mongoose";

const SpeakerSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    name: { type: String, required: true },
    title: { type: String }, // e.g. "Senior Engineer at Acme"
    bio: { type: String },
    topic: { type: String },
    photoUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Speaker || mongoose.model("Speaker", SpeakerSchema);
