const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const materialSchema  = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
});

materialSchema.plugin(paginate);

module.exports = mongoose.model("Material", materialSchema);