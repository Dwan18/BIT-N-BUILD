import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ["low", "normal", "urgent"], default: "normal" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Announcement || mongoose.model("Announcement", AnnouncementSchema);
