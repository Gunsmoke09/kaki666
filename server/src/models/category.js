const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
});

categorySchema.plugin(paginate);

module.exports = mongoose.model("Category", categorySchema);
