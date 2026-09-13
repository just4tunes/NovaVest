import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

export type InvestmentRiskLevel =
  | "Low"
  | "Moderate"
  | "High";

export interface IInvestmentPlan
  extends Document {
  key: string;
  name: string;
  category: string;
  description: string;
  minimumAmount: number;
  targetRate: number;
  durationDays: number;
  riskLevel: InvestmentRiskLevel;
  features: string[];
  enabled: boolean;
  sortOrder: number;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const investmentPlanSchema =
  new Schema<IInvestmentPlan>(
    {
      key: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 80,
      },

      category: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
      },

      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
      },

      minimumAmount: {
        type: Number,
        required: true,
        min: 1,
      },

      targetRate: {
        type: Number,
        required: true,
        min: 0,
      },

      durationDays: {
        type: Number,
        required: true,
        min: 1,
      },

      riskLevel: {
        type: String,
        enum: [
          "Low",
          "Moderate",
          "High",
        ],
        required: true,
      },

      features: {
        type: [String],
        default: [],
      },

      enabled: {
        type: Boolean,
        default: true,
        index: true,
      },

      sortOrder: {
        type: Number,
        default: 0,
      },

      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

investmentPlanSchema.index({
  enabled: 1,
  sortOrder: 1,
  createdAt: -1,
});

const InvestmentPlan: Model<IInvestmentPlan> =
  mongoose.models.InvestmentPlan ||
  mongoose.model<IInvestmentPlan>(
    "InvestmentPlan",
    investmentPlanSchema
  );

export default InvestmentPlan;