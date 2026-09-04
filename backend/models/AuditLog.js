const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
{
    action:{
        type:String,
        required:true
    },

    performedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    targetUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },

    details:{
        type:String,
        default:""
    }

},
{
    timestamps:true
}
);


module.exports = mongoose.model(
    "AuditLog",
    auditLogSchema
);