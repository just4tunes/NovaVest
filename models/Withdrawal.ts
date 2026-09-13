import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

export type WithdrawalStatus =
  | "processing"
  | "on_the_way"
  | "blocked";

export interface IWithdrawal
  extends Document {
  userId: Types.ObjectId;
  amount: number;
  cryptoAsset: string;
  network: string;
  walletAddress: string;
  status: WithdrawalStatus;
  adminMessage: string;
  profitDeducted: number;
  depositDeducted: number;
  confirmedBy?: Types.ObjectId;
  confirmedAt?: Date;
  blockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalSchema =
  new Schema<IWithdrawal>(
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

      status: {
        type: String,
        enum: [
          "processing",
          "on_the_way",
          "blocked",
        ],
        default: "processing",
        index: true,
      },

      adminMessage: {
        type: String,
        trim: true,
        default: "",
        maxlength: 300,
      },

      profitDeducted: {
        type: Number,
        default: 0,
        min: 0,
      },

      depositDeducted: {
        type: Number,
        default: 0,
        min: 0,
      },

      confirmedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      confirmedAt: {
        type: Date,
        default: null,
      },

      blockedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

withdrawalSchema.index({
  userId: 1,
  createdAt: -1,
});

const Withdrawal: Model<IWithdrawal> =
  mongoose.models.Withdrawal ||
  mongoose.model<IWithdrawal>(
    "Withdrawal",
    withdrawalSchema
  );

export default Withdrawal;