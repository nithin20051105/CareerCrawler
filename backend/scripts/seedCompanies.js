import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Company from '../models/Company.js';
import { companies } from '../data/companies.js';

dotenv.config();

async function seedCompanies() {
  await connectDB();

  let inserted = 0;
  let updated = 0;
  let deactivated = 0;
  const seedNames = companies.map((company) => company.company_name);

  for (const company of companies) {
    const existing = await Company.findOne({ company_name: company.company_name });

    if (existing) {
      await Company.updateOne(
        { _id: existing._id },
        {
          $set: {
            career_url: company.career_url,
            scraper_type: company.scraper_type,
            lever_slug: company.lever_slug || null,
            workday_api_url: company.workday_api_url || null,
            is_active: true,
          },
        }
      );
      updated += 1;
      continue;
    }

    await Company.create({
      ...company,
      lever_slug: company.lever_slug || null,
      workday_api_url: company.workday_api_url || null,
      is_active: true,
      last_scrape_status: 'never',
    });
    inserted += 1;
  }

  const deactivateResult = await Company.updateMany(
    { company_name: { $nin: seedNames }, is_active: true },
    { $set: { is_active: false, last_scrape_status: 'deactivated' } }
  );

  deactivated = deactivateResult.modifiedCount || 0;

  console.log(`Seed complete. Inserted: ${inserted}, Updated: ${updated}, Deactivated: ${deactivated}`);
  process.exit(0);
}

seedCompanies().catch((error) => {
  console.error('Failed to seed companies:', error);
  process.exit(1);
});
