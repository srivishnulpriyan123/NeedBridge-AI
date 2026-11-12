import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import db, { query } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runSeed = async () => {
  console.log('====================================================');
  console.log(' Starting NeedBridge AI Database Seeding Pipeline');
  console.log('====================================================');

  try {
    // 1. Run Migrations SQL Schema
    const migration1Path = path.join(__dirname, '..', 'migrations', '001_create_tables.sql');
    console.log(`[1/5] Applying SQL Schema 001 from: ${migration1Path}`);
    const sqlSchema1 = fs.readFileSync(migration1Path, 'utf-8');
    await query(sqlSchema1);
    console.log('✓ Successfully created core tables (users, aid_requests, donations) & indexes.');

    const migration2Path = path.join(__dirname, '..', 'migrations', '002_create_ai_and_catalogue_tables.sql');
    console.log(`[2/6] Applying SQL Schema 002 from: ${migration2Path}`);
    const sqlSchema2 = fs.readFileSync(migration2Path, 'utf-8');
    await query(sqlSchema2);
    console.log('✓ Successfully created AI & Catalogue tables (supplies_catalogue, ai_analyses) & indexes.');

    const migration3Path = path.join(__dirname, '..', 'migrations', '003_add_paypal_fields_to_donations.sql');
    console.log(`[3/6] Applying SQL Schema 003 from: ${migration3Path}`);
    const sqlSchema3 = fs.readFileSync(migration3Path, 'utf-8');
    await query(sqlSchema3);
    console.log('✓ Successfully applied PayPal fields & constraints to donations table.');

    // 2. Seed Supplies Catalogue
    console.log('[4/6] Seeding verified supplies catalogue...');
    const sampleCatalogue = [
      {
        product_name: 'Family Food Relief Kit',
        category: 'Food & Nutrition',
        description: 'Dry rations, grains, pulses, cooking oil and high-energy biscuits for family of 4-5.',
        unit_price: 500.00,
        unit: 'kit',
        available_quantity: 150,
        availability_status: 'available'
      },
      {
        product_name: 'Infant Nutritional Formula & Cereal',
        category: 'Food & Nutrition',
        description: 'Fortified infant milk powder and baby cereal mix.',
        unit_price: 250.00,
        unit: 'can',
        available_quantity: 80,
        availability_status: 'available'
      },
      {
        product_name: 'Packaged Drinking Water (20L Canister)',
        category: 'Hygiene & Clean Water',
        description: 'Purified mineral drinking water in sealed 20L food-grade container.',
        unit_price: 80.00,
        unit: 'canister',
        available_quantity: 250,
        availability_status: 'available'
      },
      {
        product_name: 'Water Purification Tablets (Pack of 50)',
        category: 'Hygiene & Clean Water',
        description: 'Chlorine-based Aquatabs rapid water purification tablets.',
        unit_price: 150.00,
        unit: 'pack',
        available_quantity: 180,
        availability_status: 'available'
      },
      {
        product_name: 'Thermal Fleece Blanket (Heavyweight)',
        category: 'Shelter & Bedding',
        description: 'Double-layered high thermal retention emergency wool/fleece blanket.',
        unit_price: 300.00,
        unit: 'blanket',
        available_quantity: 120,
        availability_status: 'available'
      },
      {
        product_name: 'Emergency Waterproof Tarp (12x15 ft)',
        category: 'Shelter & Bedding',
        description: 'Heavy duty UV-resistant waterproof polyethylene ground sheet and rain tarp.',
        unit_price: 450.00,
        unit: 'tarp',
        available_quantity: 65,
        availability_status: 'available'
      },
      {
        product_name: 'First Aid Emergency Trauma Kit',
        category: 'Medical & Healthcare',
        description: 'Sterile bandages, antiseptic solution, burns dressing, shears and clinical tape.',
        unit_price: 650.00,
        unit: 'kit',
        available_quantity: 90,
        availability_status: 'available'
      },
      {
        product_name: 'Pediatric Rehydration & Antipyretic Set',
        category: 'Medical & Healthcare',
        description: 'Oral rehydration salts (ORS), pediatric fever drops and digital thermometer.',
        unit_price: 200.00,
        unit: 'set',
        available_quantity: 130,
        availability_status: 'available'
      },
      {
        product_name: 'Student STEM & School Learning Kit',
        category: 'Education & Learning',
        description: 'School backpack, notebooks, geometry set, pens, pencils and study aids.',
        unit_price: 350.00,
        unit: 'kit',
        available_quantity: 100,
        availability_status: 'available'
      },
      {
        product_name: 'Family Hygiene & Sanitation Kit',
        category: 'Hygiene & Clean Water',
        description: 'Antibacterial soaps, sanitary pads, toothbrushes, toothpaste and detergent.',
        unit_price: 220.00,
        unit: 'kit',
        available_quantity: 160,
        availability_status: 'available'
      },
      {
        product_name: 'Insulated Winter Jacket & Warm Clothing Kit',
        category: 'Warm Clothing',
        description: 'Waterproof insulated winter parka, thermal innerwear and woolen gloves.',
        unit_price: 750.00,
        unit: 'kit',
        available_quantity: 50,
        availability_status: 'available'
      },
      {
        product_name: 'Heavy-Duty Winter Boots (Pairs)',
        category: 'Warm Clothing',
        description: 'Tough rubber grip snow and water resistant work/winter boots.',
        unit_price: 600.00,
        unit: 'pair',
        available_quantity: 0,
        availability_status: 'out_of_stock'
      }
    ];

    for (const item of sampleCatalogue) {
      await query(
        `INSERT INTO supplies_catalogue
          (product_name, category, description, unit_price, unit, available_quantity, availability_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [item.product_name, item.category, item.description, item.unit_price, item.unit, item.available_quantity, item.availability_status]
      );
    }
    console.log(`✓ Inserted ${sampleCatalogue.length} verified catalogue supply products.`);

    // 3. Hash Seed Passwords
    console.log('[4/5] Hashing user credentials with bcrypt...');
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('AdminPass123!', salt);
    const ben1Hash = await bcrypt.hash('BeneficiaryPass123!', salt);
    const ben2Hash = await bcrypt.hash('BeneficiaryPass123!', salt);
    const donor1Hash = await bcrypt.hash('DonorPass123!', salt);
    const donor2Hash = await bcrypt.hash('DonorPass123!', salt);

    // 4. Insert Users
    console.log('[5/5] Inserting demo users (1 Admin, 2 Beneficiaries, 2 Donors)...');
    
    // Admin
    const adminRes = await query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      ['Sarah Al-Mansoor (Lead Auditor)', 'admin@needbridge.ai', adminHash, 'admin']
    );
    const adminUser = adminRes.rows[0];

    // Beneficiary 1
    const ben1Res = await query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      ['Elena Rostova (Senior Haven Rep)', 'elena@communityaid.org', ben1Hash, 'beneficiary']
    );
    const ben1 = ben1Res.rows[0];

    // Beneficiary 2
    const ben2Res = await query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      ['Marcus Vance (Riverside Community)', 'marcus@riverside.org', ben2Hash, 'beneficiary']
    );
    const ben2 = ben2Res.rows[0];

    // Donor 1
    const donor1Res = await query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      ['Dr. Jane Chen (HealthTrust)', 'dr.jane@healthtrust.org', donor1Hash, 'donor']
    );
    const donor1 = donor1Res.rows[0];

    // Donor 2
    const donor2Res = await query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      ['Sarah Jenkins (Greenleaf Trust)', 'sarah.j@greenleaf.org', donor2Hash, 'donor']
    );
    const donor2 = donor2Res.rows[0];

    console.log(`✓ Inserted 5 demo users with distinct roles.`);

    // 4. Insert Aid Requests
    console.log('[4/4] Inserting 6 sample community aid requests across categories...');

    const sampleRequests = [
      {
        beneficiary_id: ben1.id,
        title: 'Emergency Winter Heating & Thermal Bedding for Sheltered Seniors',
        description: 'Sudden cold snap damaged the auxiliary heating unit in the community hospice annex. 38 elderly residents require immediate thermal blankets, electric heating pads, and heavy draft insulation strips.',
        category: 'Shelter & Bedding',
        quantity: '40 thermal blankets, 20 heating pads',
        beneficiaries_count: 38,
        location: 'Northside Senior Haven, Sector 4',
        urgency: 'critical',
        status: 'approved',
        estimated_budget: 1450.00,
        funds_raised: 1200.00,
        admin_notes: 'Verified against severe winter weather advisory. Direct wholesale supplier assigned.'
      },
      {
        beneficiary_id: ben2.id,
        title: 'Essential Nutritional Food Hampers for Displaced Families',
        description: 'Following seasonal river overflow, 18 family units (65 individuals including 24 young children) are staying in the temporary civic shelter. Seeking staple grains, milk powder, shelf-stable protein cans, and hygiene supplies.',
        category: 'Food & Nutrition',
        quantity: '65 food hampers',
        beneficiaries_count: 65,
        location: 'East Riverside Community Center',
        urgency: 'critical',
        status: 'approved',
        estimated_budget: 2200.00,
        funds_raised: 1650.00,
        admin_notes: 'Intake logs cross-verified with Red Cross shelter registration.'
      },
      {
        beneficiary_id: ben1.id,
        title: 'Pediatric First Aid Kits & Chronic Medication Support',
        description: 'Providing primary health triage and basic pediatric antibiotic ointments, oral rehydration salts, fever reducers, and sterile dressings for underprivileged families without health insurance.',
        category: 'Medical & Healthcare',
        quantity: '60 first-aid kits, 120 rehydration sets',
        beneficiaries_count: 120,
        location: 'Hope Mobile Health Unit, Ward 7',
        urgency: 'high',
        status: 'approved',
        estimated_budget: 1800.00,
        funds_raised: 900.00,
        admin_notes: 'Volunteer clinic accreditation and physician license verified.'
      },
      {
        beneficiary_id: ben2.id,
        title: 'Back-to-School Learning Packs & Textbooks for Primary Students',
        description: 'Supplying low-income Grade 1-5 students with durable backpacks, math geometry sets, notebooks, reading primers, and colored pencils for the new semester.',
        category: 'Education & Learning',
        quantity: '52 student learning packs',
        beneficiaries_count: 52,
        location: 'Oakwood Community Elementary',
        urgency: 'medium',
        status: 'approved',
        estimated_budget: 950.00,
        funds_raised: 420.00,
        admin_notes: 'School enrollment manifest validated.'
      },
      {
        beneficiary_id: ben1.id,
        title: 'Clean Drinking Water Filtration Kits & Chlorine Tablets',
        description: 'Municipal water pipeline burst caused temporary contamination in localized wells. Need gravity-fed ceramic water filters and water purifying tablets while municipal repairs continue.',
        category: 'Hygiene & Clean Water',
        quantity: '16 filter units, 12 tablet packs',
        beneficiaries_count: 80,
        location: 'West Ridge Settlement, Block C',
        urgency: 'critical',
        status: 'approved',
        estimated_budget: 1300.00,
        funds_raised: 250.00,
        admin_notes: 'Municipal boil-water bulletin confirmed.'
      },
      {
        beneficiary_id: ben2.id,
        title: 'Thermal Winter Jackets and Boots for Unhoused Youths',
        description: 'Winter temperatures dropping below freezing overnight. 30 youth clients need waterproof insulated winter parkas, thermal socks, and weather-resistant boots to prevent frostbite.',
        category: 'Warm Clothing',
        quantity: '30 winter parkas, 30 boot pairs',
        beneficiaries_count: 30,
        location: 'Downtown Youth Drop-in Shelter',
        urgency: 'high',
        status: 'pending',
        estimated_budget: 1100.00,
        funds_raised: 0.00,
        admin_notes: 'Pending intake partnership agreement sign-off.'
      }
    ];

    const insertedRequests = [];
    for (const req of sampleRequests) {
      const res = await query(
        `INSERT INTO aid_requests 
          (beneficiary_id, title, description, category, quantity, beneficiaries_count, location, urgency, status, estimated_budget, funds_raised, admin_notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          req.beneficiary_id,
          req.title,
          req.description,
          req.category,
          req.quantity,
          req.beneficiaries_count,
          req.location,
          req.urgency,
          req.status,
          req.estimated_budget,
          req.funds_raised,
          req.admin_notes
        ]
      );
      insertedRequests.push(res.rows[0]);
    }
    console.log(`✓ Inserted ${insertedRequests.length} community aid requests.`);

    // 5. Insert Sample Donations
    console.log('Inserting sample transparent donation records linked to donors and requests...');
    const sampleDonations = [
      {
        donor_id: donor1.id,
        request_id: insertedRequests[0].id,
        amount: 700.00,
        payment_status: 'completed',
        payment_provider: 'paypal_sandbox_mock',
        paypal_order_id: 'PAYID-MOCK-920194819A'
      },
      {
        donor_id: donor2.id,
        request_id: insertedRequests[0].id,
        amount: 500.00,
        payment_status: 'completed',
        payment_provider: 'paypal_sandbox_mock',
        paypal_order_id: 'PAYID-MOCK-394810294B'
      },
      {
        donor_id: donor2.id,
        request_id: insertedRequests[1].id,
        amount: 1000.00,
        payment_status: 'completed',
        payment_provider: 'paypal_sandbox_mock',
        paypal_order_id: 'PAYID-MOCK-710294821C'
      },
      {
        donor_id: donor1.id,
        request_id: insertedRequests[1].id,
        amount: 650.00,
        payment_status: 'completed',
        payment_provider: 'paypal_sandbox_mock',
        paypal_order_id: 'PAYID-MOCK-819203948D'
      },
      {
        donor_id: donor1.id,
        request_id: insertedRequests[2].id,
        amount: 900.00,
        payment_status: 'completed',
        payment_provider: 'paypal_sandbox_mock',
        paypal_order_id: 'PAYID-MOCK-602918392E'
      },
      {
        donor_id: donor2.id,
        request_id: insertedRequests[3].id,
        amount: 420.00,
        payment_status: 'completed',
        payment_provider: 'paypal_sandbox_mock',
        paypal_order_id: 'PAYID-MOCK-882019482F'
      },
      {
        donor_id: donor1.id,
        request_id: insertedRequests[4].id,
        amount: 250.00,
        payment_status: 'completed',
        payment_provider: 'paypal_sandbox_mock',
        paypal_order_id: 'PAYID-MOCK-192837465G'
      }
    ];

    for (const d of sampleDonations) {
      await query(
        `INSERT INTO donations 
          (donor_id, request_id, amount, payment_status, payment_provider, paypal_order_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [d.donor_id, d.request_id, d.amount, d.payment_status, d.payment_provider, d.paypal_order_id]
      );
    }
    console.log(`✓ Inserted ${sampleDonations.length} sample mock donation records.`);

    console.log('\n====================================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('Demo Accounts for Testing:');
    console.log('  [Admin]        admin@needbridge.ai       / AdminPass123!');
    console.log('  [Beneficiary]  elena@communityaid.org    / BeneficiaryPass123!');
    console.log('  [Beneficiary]  marcus@riverside.org      / BeneficiaryPass123!');
    console.log('  [Donor]        dr.jane@healthtrust.org   / DonorPass123!');
    console.log('  [Donor]        sarah.j@greenleaf.org     / DonorPass123!');
    console.log('====================================================\n');

    return true;
  } catch (error) {
    console.error('✗ Seeding failed with error:', error);
    throw error;
  }
};

// Execute if run directly via node seed/seed.js
const isDirectExecution = process.argv[1] && process.argv[1].includes('seed.js');
if (isDirectExecution) {
  runSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

