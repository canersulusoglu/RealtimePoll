import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PollSchema = new Schema({
    title: { type: String, required: true},
    options: [
        {
            id: { type: Schema.Types.ObjectId },
            name: { type: String, required: true},
            count: { type: Number, required: true, default: 0}
        }
    ]
}, {
    timestamps: true
})

export default mongoose.model("Poll", PollSchema);