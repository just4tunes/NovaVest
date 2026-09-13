import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export interface ICryptoWallet
  extends Document {
  key: string;
  name: string;
  symbol: string;
  network: string;
  address: string;
  enabled: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const cryptoWalletSchema =
  new Schema<ICryptoWallet>(
    {
      key: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      symbol: {
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

      address: {
        type: String,
        required: true,
        trim: true,
      },

      enabled: {
        type: Boolean,
        default: true,
      },

      sortOrder: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );

const CryptoWallet: Model<ICryptoWallet> =
  mongoose.models.CryptoWallet ||
  mongoose.model<ICryptoWallet>(
    "CryptoWallet",
    cryptoWalletSchema
  );

export default CryptoWallet;