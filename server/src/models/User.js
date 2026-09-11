import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["ADMIN", "ANALYST", "VIEWER"],
      default: "ADMIN",
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    delete returnedObject.password;

    return returnedObject;
  },
});

const User = mongoose.model("User", userSchema);

export default User;