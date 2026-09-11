import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export type UserRole = "user" | "admin";
export type AccountStatus = "active" | "suspended";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;

  depositBalance: number;
  profitBalance: number;

  phone?: string;
  country?: string;
  accountStatus: AccountStatus;
  passwordChangedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
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
      enum: ["user", "admin"],
      default: "user",
    },

    depositBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    profitBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    country: {
      type: String,
      trim: true,
      default: "",
    },

    accountStatus: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);

export default User;