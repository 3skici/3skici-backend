const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const parsePhoneNumber = require('libphonenumber-js');

const MAX_REPORT_COUNT = 50; // Define the maximum report count
const allowedCurrencies = ['TL', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];


const productSchema = new mongoose.Schema({
  customId: {
    type: String,
    unique: true,
    required: true,
    default: function () {
      return `PROD-${uuidv4()}`;
    }
  },
  name: { type: String, required: true, minlength: 3, maxlength: 100 },
  description: { type: String, required: true, minlength: 10, maxlength: 500 },
  price: {
    type: {
      amount: {
        type: Number,
        required: true,
        min: [0, 'Price amount must be a positive number'],
      },
      currency: {
        type: String,
        enum: allowedCurrencies,
        default: 'TL', // Set default currency to 'TL'
        required: true,
      },
    },
    required: true,
  },
  condition: { type: String, enum: ['new', 'like-new', 'damaged', 'used'], required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: {
    type: [String],
    validate: [(val) => val.length <= 7, 'Maximum 7 images allowed'],
    default: [],
  },
  location: {
    country: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String },
    zipCode: { type: String },
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      validate: {
        validator: validator.isEmail,
        message: props => `${props.value} is not a valid email address!`,
      },
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          try {
            const phoneNumber = parsePhoneNumber(v);
            return phoneNumber.isValid();
          } catch (error) {
            return false;
          }
        },
        message: props => `${props.value} is not a valid phone number!`,
      },
    },
  },
  status: { type: String, enum: ['available', 'not_available', 'sold'], default: 'available' },
  soldDate: { type: Date },
  reportedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
  isArchive: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Pre-save hook
productSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'sold' && !this.soldDate) {
    this.soldDate = new Date();
  }
  if (this.reportedCount >= MAX_REPORT_COUNT && !this.isHidden) {
    this.isHidden = true;
  }
  next();
});

// Middleware for findOneAndUpdate
productSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (update.$inc && update.$inc.reportedCount) {
    const doc = await this.model.findOne(this.getQuery());
    const newCount = doc.reportedCount + update.$inc.reportedCount;
    if (newCount >= MAX_REPORT_COUNT && !doc.isHidden) {
      update.isHidden = true;
    }
  }
  if (update.status === 'sold' && !update.soldDate) {
    update.soldDate = new Date();
  }
  next();
});

// Indexes
productSchema.index({ reportedCount: 1 });
productSchema.index({ status: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema, 'products');
module.exports = Product;
