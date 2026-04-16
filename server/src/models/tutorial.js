const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const tutorialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    instructions: {
        type: String,
        required: true,
    },
    AverageTimeSpentMinutes: {
        type: Number,
        required: true,
        min: 0
    },
    difficulty: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    categories: [{
        type: mongoose.Schema.ObjectId,
        ref: "Category",
    }],
    material: [
        {
            material: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Material",
                required: true
            },
            quantity: {
                type: Number,
                min: 0.01
            },
            unit: {
                type: String,
            },
            note: {
                type: String
            }
        }
    ]
});

tutorialSchema.plugin(paginate);

module.exports = mongoose.model("Tutorial", tutorialSchema);
