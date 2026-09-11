import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

export interface IProfitRecord extends Document {
  userId: Types.ObjectId;
  amount: number;
  note: string;
  awardedBy: Types.ObjectId;
  transactionId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const profitRecordSchema = new Schema<IProfitRecord>(
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
      min: 0.01,
    },

    note: {
      type: String,
      trim: true,
      default: "Demo investment profit",
    },

    awardedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ProfitRecord: Model<IProfitRecord> =
  mongoose.models.ProfitRecord ||
  mongoose.model<IProfitRecord>(
    "ProfitRecord",
    profitRecordSchema
  );

export default ProfitRecord;
 