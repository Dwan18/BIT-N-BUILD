import mongoose from "mongoose";

const AgendaItemSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["talk", "workshop", "break", "panel", "cultural", "other"],
      default: "talk",
    },
    speakerId: { type: mongoose.Schema.Types.ObjectId, ref: "Speaker" },
    order: { type: Number, required: true }, // position in the day's running order

    // What was planned vs what actually happened - this gap is what
    // powers delay detection and dynamic agenda updates.
    scheduledStart: { type: Date, required: true },
    scheduledEnd: { type: Date, required: true },
    actualStart: { type: Date },
    actualEnd: { type: Date },

    status: {
      type: String,
      enum: ["upcoming", "live", "completed", "delayed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

export default mongoose.models.AgendaItem || mongoose.model("AgendaItem", AgendaItemSchema);
