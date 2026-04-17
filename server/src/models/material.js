const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const materialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    purchaseSource: {
        type: String,
        default: "",
        trim: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
});

materialSchema.plugin(paginate);

module.exports = mongoose.model("Material", materialSchema);
