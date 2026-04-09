import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    career_url: {
      type: String,
      required: true,
      trim: true,
    },
    lever_slug: {
      type: String,
      default: null,
      trim: true,
    },
    workday_api_url: {
      type: String,
      default: null,
      trim: true,
    },
    scraper_type: {
      type: String,
      required: true,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    last_scraped_at: {
      type: Date,
      default: null,
    },
    last_scrape_status: {
      type: String,
      default: 'never',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Company', companySchema);
