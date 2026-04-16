const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
});

categorySchema.plugin(paginate);

module.exports = mongoose.model("Category", categorySchema);