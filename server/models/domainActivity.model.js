import mongoose from "mongoose";

const domainActivitySchema = new mongoose.Schema({
    domain: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number }, // milliseconds
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
});

domainActivitySchema.pre("save", function (next) {
    if (this.startTime && this.endTime) {
        this.duration = this.endTime - this.startTime;
    }
    next();
});

export default mongoose.model("DomainActivity", domainActivitySchema);
