import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type TransactionType =
  | "deposit"
  | "profit"
  | "withdrawal"
  | "investment"
  | "adjustment";

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  description: string;
  reference: string;
  balanceAfter: number;
  createdBy?: Types.ObjectId;
  relatedDeposit?: Types.ObjectId;
  relatedWithdrawal?: Types.ObjectId;
  relatedInvestment?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["deposit", "profit", "withdrawal", "investment", "adjustment"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    relatedDeposit: {
      type: Schema.Types.ObjectId,
      ref: "Deposit",
      unique: true,
      sparse: true,
      default: undefined,
    },

    relatedWithdrawal: {
      type: Schema.Types.ObjectId,
      ref: "Withdrawal",
      unique: true,
      sparse: true,
      default: undefined,
    },

    relatedInvestment: {
      type: Schema.Types.ObjectId,
      ref: "Investment",
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.index({
  userId: 1,
  createdAt: -1,
});

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", transactionSchema);

export default Transaction;
