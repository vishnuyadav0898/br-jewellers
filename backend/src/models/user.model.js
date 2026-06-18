import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    image: { type: String },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    permissions: [
      {
        module: { type: String, required: true },
        actions: { type: [String], default: [] },
      },
    ],
    googleId: { type: String },
  },
  { timestamps: true }
);

// 🔐 Hash before save
userSchema.pre("save", async function () {
  // skip if password not modified
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔐 Hash before update
userSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();

  if (update?.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
  }
});

export default mongoose.model("User", userSchema);