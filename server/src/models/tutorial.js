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
    categories: [{
        type: mongoose.Schema.ObjectId,
        ref: "Category",
    }],
    material: [
        {
            ingredient: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Ingredient",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 0.01
            },
            unit: {
                type: String,
                required: true,
            },
            note: {
                type: String
            }
        }
    ]
});

tutorialSchema.plugin(paginate);

module.exports = mongoose.model("Tutorial", tutorialSchema);