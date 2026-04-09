import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    location: {
      type: String,
      default: 'Unknown',
      trim: true,
      index: true,
    },
    experience: {
      type: String,
      default: 'Not specified',
      trim: true,
      index: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    job_link: {
      type: String,
      required: true,
      trim: true,
    },
    source_job_id: {
      type: String,
      default: null,
      trim: true,
    },
    scraper_type: {
      type: String,
      default: 'unknown',
      trim: true,
    },
    scraped_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index(
  { company: 1, title: 1, location: 1, job_link: 1 },
  { unique: true, partialFilterExpression: { is_active: true } }
);

export default mongoose.model('Job', jobSchema);
