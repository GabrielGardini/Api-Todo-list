import mongoose from "mongoose";

const Todo = mongoose.model('Todo', new mongoose.Schema({
    text:{type: String, required: true},
    done: {type: mongoose.SchemaTypes.Boolean, required: true},
    user:{type: mongoose.SchemaTypes.ObjectId},
}));

export default Todo;