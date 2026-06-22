import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowUp {
  date?: Date;
  note?: string;
  nextFollowUpDate?: Date;
  createdAt?: Date;
}

export interface ILead extends Document {
  fullName: string;
  email?: string;
  phone: string;
  source: 'Website' | 'Referral' | 'Social Media' | 'Facebook' | 'Instagram' | 'WhatsApp' | 'Email Campaign' | 'Walk-in' | 'Phone' | 'Other';
  serviceInterest: ('IELTS Premium' | 'IELTS Crash' | 'IELTS Intense' | 'IELTS Elementary' | 'IELTS Mock Test' | 'Basic English' | 'GRE Premium' | 'TOEFL Premium' | 'PTE Premium' | 'Study Abroad' | 'Visa Processing')[];
  assignedTo?: mongoose.Types.ObjectId;
  notes?: string;
  followUps: IFollowUp[];
  lifecycleStage: 'Intake' | 'Processing' | 'Hot' | 'Converted' | 'Dead';
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    date: { type: Date },
    note: { type: String },
    nextFollowUpDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const LeadSchema = new Schema<ILead>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    source: {
      type: String,
      enum: ['Website', 'Referral', 'Social Media', 'Facebook', 'Instagram', 'WhatsApp', 'Email Campaign', 'Walk-in', 'Phone', 'Other'],
      default: 'Website'
    },
    serviceInterest: [{
      type: String,
      enum: [
        'IELTS Premium', 'IELTS Crash', 'IELTS Intense', 'IELTS Elementary', 'IELTS Mock Test',
        'Basic English', 'GRE Premium', 'TOEFL Premium', 'PTE Premium',
        'Study Abroad', 'Visa Processing',
        // legacy broad values
        'IELTS', 'PTE', 'GRE', 'TOEFL',
      ]
    }],
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      trim: true
    },
    followUps: {
      type: [FollowUpSchema],
      default: []
    },
    lifecycleStage: {
      type: String,
      enum: ['Intake', 'Processing', 'Hot', 'Converted', 'Dead'],
      default: 'Intake'
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient querying
LeadSchema.index({ email: 1 });
LeadSchema.index({ lifecycleStage: 1 });
LeadSchema.index({ assignedTo: 1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ lifecycleStage: 1, createdAt: -1 });
LeadSchema.index({ lifecycleStage: 1, updatedAt: -1 });
LeadSchema.index({ source: 1, createdAt: -1 });
LeadSchema.index({ serviceInterest: 1, createdAt: -1 });

export default mongoose.model<ILead>('Lead', LeadSchema);
