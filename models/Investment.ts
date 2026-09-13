import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

export type InvestmentStatus =
  | "active"
  | "completed"
  | "cancelled";

export interface IInvestment
  extends Document {
  userId: Types.ObjectId;
  planKey: string;
  planName: string;
  category: string;
  amount: number;
  targetRate: number;
  projectedReturn: number;
  actualProfit: number;
  durationDays: number;
  riskLevel: string;
  status: InvestmentStatus;
  adminMessage: string;
  startedAt: Date;
  maturesAt: Date;
  projectedReturnUpdatedAt?: Date;
  projectedReturnUpdatedBy?: Types.ObjectId;
  completedAt?: Date;
  completedBy?: Types.ObjectId;
  cancelledAt?: Date;
  cancelledBy?: Types.ObjectId;
  capitalReturned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const investmentSchema =
  new Schema<IInvestment>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      planKey: {
        type: String,
        required: true,
        trim: true,
      },

      planName: {
        type: String,
        required: true,
        trim: true,
      },

      category: {
        type: String,
        required: true,
        trim: true,
      },

      amount: {
        type: Number,
        required: true,
        min: 1,
      },

      targetRate: {
        type: Number,
        required: true,
        min: 0,
      },

      projectedReturn: {
        type: Number,
        default: 0,
        min: 0,
      },

      actualProfit: {
        type: Number,
        default: 0,
        min: 0,
      },

      durationDays: {
        type: Number,
        required: true,
        min: 1,
      },

      riskLevel: {
        type: String,
        required: true,
        trim: true,
      },

      status: {
        type: String,
        enum: [
          "active",
          "completed",
          "cancelled",
        ],
        default: "active",
        index: true,
      },

      adminMessage: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },

      startedAt: {
        type: Date,
        required: true,
      },

      maturesAt: {
        type: Date,
        required: true,
      },

      projectedReturnUpdatedAt: {
        type: Date,
        default: null,
      },

      projectedReturnUpdatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      completedAt: {
        type: Date,
        default: null,
      },

      completedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      cancelledAt: {
        type: Date,
        default: null,
      },

      cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      capitalReturned: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

investmentSchema.index({
  userId: 1,
  createdAt: -1,
});

investmentSchema.index({
  status: 1,
  maturesAt: 1,
});

const Investment: Model<IInvestment> =
  mongoose.models.Investment ||
  mongoose.model<IInvestment>(
    "Investment",
    investmentSchema
  );

export default Investment;