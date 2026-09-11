import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

export type DepositStatus =
  | "processing"
  | "approved"
  | "rejected";

export interface IDeposit extends Document {
  userId: Types.ObjectId;
  amount: number;
  cryptoAsset: string;
  network: string;
  walletAddress: string;
  transactionHash: string;
  receiptUrl: string;
  status: DepositStatus;
  adminNote: string;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const depositSchema = new Schema<IDeposit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    cryptoAsset: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    network: {
      type: String,
      required: true,
      trim: true,
    },

    walletAddress: {
      type: String,
      required: true,
      trim: true,
    },

    transactionHash: {
      type: String,
      required: true,
      trim: true,
    },

    receiptUrl: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["processing", "approved", "rejected"],
      default: "processing",
      index: true,
    },

    adminNote: {
      type: String,
      default: "",
      trim: true,
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

depositSchema.index({
  userId: 1,
  createdAt: -1,
});

const Deposit: Model<IDeposit> =
  mongoose.models.Deposit ||
  mongoose.model<IDeposit>(
    "Deposit",
    depositSchema
  );

export default Deposit;