-- =====================================================
-- PashuDoc (পশুডক) - Supabase Database Setup Script
-- এই পুরো script টি Supabase SQL Editor-এ paste করে Run করো
-- =====================================================

-- ১. Enum Types তৈরি করো
-- =====================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('farmer', 'doctor', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE doctor_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ২. Tables তৈরি করো
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'farmer',
  district TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  specialties TEXT[] NOT NULL DEFAULT '{}',
  district TEXT NOT NULL,
  upazila TEXT,
  clinic_name TEXT,
  chamber_address TEXT,
  bio TEXT,
  years_experience INTEGER DEFAULT 0,
  consultation_fee INTEGER DEFAULT 0,
  status doctor_status NOT NULL DEFAULT 'pending',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES users(id),
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  animal_type TEXT NOT NULL,
  animal_description TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES users(id),
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  appointment_id INTEGER REFERENCES appointments(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =====================================================
-- ৩. আগের ডেটা মুছে নতুন ডেটা ঢোকাও
-- =====================================================

TRUNCATE TABLE reviews, appointments, doctors, users, site_content RESTART IDENTITY CASCADE;

-- Users (Admin, Doctors, Farmers)
-- পাসওয়ার্ড hash (bcrypt, cost=10):
--   admin123  -> $2b$10$HWMSVOHLiBP54T2hp40DQef5pao95mXyw5XALUFNdWjyxkup1Q932
--   doctor123 -> $2b$10$uf4T1yB2K.Tsu2Z7llJydOWAOEfvtLLmf46vSEvHtq8FTjvjp6Fy6
--   farmer123 -> $2b$10$oNqeQx27LjYyDBhx7iekuuCC0ScwOmCb5jFUEL5z65CfzEVyyxwsO

INSERT INTO users (name, phone, password_hash, role, district) VALUES
  -- Admin
  ('অ্যাডমিন', '01700000000', '$2b$10$HWMSVOHLiBP54T2hp40DQef5pao95mXyw5XALUFNdWjyxkup1Q932', 'admin', 'ঢাকা'),
  -- Doctors
  ('ডা. মোহাম্মদ রহমান', '01711111111', '$2b$10$uf4T1yB2K.Tsu2Z7llJydOWAOEfvtLLmf46vSEvHtq8FTjvjp6Fy6', 'doctor', 'ঢাকা'),
  ('ডা. ফাতেমা বেগম',    '01722222222', '$2b$10$uf4T1yB2K.Tsu2Z7llJydOWAOEfvtLLmf46vSEvHtq8FTjvjp6Fy6', 'doctor', 'চট্টগ্রাম'),
  ('ডা. করিম উদ্দিন',   '01733333333', '$2b$10$uf4T1yB2K.Tsu2Z7llJydOWAOEfvtLLmf46vSEvHtq8FTjvjp6Fy6', 'doctor', 'রাজশাহী'),
  ('ডা. নাসরিন আক্তার', '01744444444', '$2b$10$uf4T1yB2K.Tsu2Z7llJydOWAOEfvtLLmf46vSEvHtq8FTjvjp6Fy6', 'doctor', 'সিলেট'),
  ('ডা. হাবিবুর রহমান', '01788888888', '$2b$10$uf4T1yB2K.Tsu2Z7llJydOWAOEfvtLLmf46vSEvHtq8FTjvjp6Fy6', 'doctor', 'খুলনা'),
  -- Farmers
  ('রহিম মিয়া',     '01755555555', '$2b$10$oNqeQx27LjYyDBhx7iekuuCC0ScwOmCb5jFUEL5z65CfzEVyyxwsO', 'farmer', 'ঢাকা'),
  ('করিম শেখ',      '01766666666', '$2b$10$oNqeQx27LjYyDBhx7iekuuCC0ScwOmCb5jFUEL5z65CfzEVyyxwsO', 'farmer', 'চট্টগ্রাম'),
  ('আনোয়ার হোসেন', '01777777777', '$2b$10$oNqeQx27LjYyDBhx7iekuuCC0ScwOmCb5jFUEL5z65CfzEVyyxwsO', 'farmer', 'রাজশাহী');

-- Doctor Profiles
INSERT INTO doctors (user_id, specialties, district, upazila, clinic_name, chamber_address, bio, years_experience, consultation_fee, status, is_featured)
SELECT id, ARRAY['গরু','ছাগল'], 'ঢাকা', 'ধামরাই', 'রহমান পশু চিকিৎসা কেন্দ্র', 'ধামরাই বাজার, ঢাকা',
  '১৫ বছরের অভিজ্ঞতাসম্পন্ন পশু চিকিৎসক। গরু ও ছাগলের রোগ নির্ণয় এবং চিকিৎসায় বিশেষজ্ঞ।', 15, 500, 'approved', TRUE
FROM users WHERE phone = '01711111111';

INSERT INTO doctors (user_id, specialties, district, upazila, clinic_name, chamber_address, bio, years_experience, consultation_fee, status, is_featured)
SELECT id, ARRAY['মুরগি','হাঁস'], 'চট্টগ্রাম', 'হাটহাজারী', 'ফাতেমা পোলট্রি ক্লিনিক', 'হাটহাজারী রোড, চট্টগ্রাম',
  'মুরগি ও হাঁসের রোগ এবং পোলট্রি ব্যবস্থাপনায় দক্ষ বিশেষজ্ঞ।', 10, 400, 'approved', TRUE
FROM users WHERE phone = '01722222222';

INSERT INTO doctors (user_id, specialties, district, upazila, clinic_name, chamber_address, bio, years_experience, consultation_fee, status, is_featured)
SELECT id, ARRAY['গরু','মুরগি'], 'রাজশাহী', 'পুঠিয়া', 'করিম ভেটেরিনারি সেবা', 'পুঠিয়া বাজার, রাজশাহী',
  'গ্রামীণ পশু চিকিৎসায় ১২ বছরের বাস্তব অভিজ্ঞতা।', 12, 350, 'approved', FALSE
FROM users WHERE phone = '01733333333';

INSERT INTO doctors (user_id, specialties, district, upazila, clinic_name, chamber_address, bio, years_experience, consultation_fee, status, is_featured)
SELECT id, ARRAY['ছাগল','গরু'], 'সিলেট', 'গোলাপগঞ্জ', 'নাসরিন পশু স্বাস্থ্য কেন্দ্র', 'গোলাপগঞ্জ, সিলেট',
  'পশু প্রজনন ও স্বাস্থ্য ব্যবস্থাপনায় বিশেষজ্ঞ।', 8, 450, 'approved', FALSE
FROM users WHERE phone = '01744444444';

INSERT INTO doctors (user_id, specialties, district, upazila, clinic_name, chamber_address, bio, years_experience, consultation_fee, status, is_featured)
SELECT id, ARRAY['কুকুর','বিড়াল','গরু'], 'খুলনা', 'ডুমুরিয়া', 'হাবিব অ্যানিমেল কেয়ার', 'ডুমুরিয়া, খুলনা',
  'পোষা প্রাণী ও গৃহপালিত পশুর সমন্বিত চিকিৎসায় অভিজ্ঞ।', 6, 600, 'pending', FALSE
FROM users WHERE phone = '01788888888';

-- Appointments
INSERT INTO appointments (farmer_id, doctor_id, animal_type, animal_description, appointment_date, appointment_time, status, notes)
SELECT
  (SELECT id FROM users WHERE phone = '01755555555'),
  (SELECT d.id FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.phone = '01711111111'),
  'গরু', 'বয়স ৩ বছর। জ্বর, খাচ্ছে না, দুধ কমে গেছে।',
  '2025-12-15', 'সকাল ১০:০০', 'completed',
  'ভিটামিন ইনজেকশন দেওয়া হয়েছে, ৭ দিনের ওষুধ দেওয়া হয়েছে';

INSERT INTO appointments (farmer_id, doctor_id, animal_type, animal_description, appointment_date, appointment_time, status, notes)
SELECT
  (SELECT id FROM users WHERE phone = '01755555555'),
  (SELECT d.id FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.phone = '01711111111'),
  'ছাগল', 'বয়স ১ বছর। পেট ফোলা, ডায়রিয়া।',
  '2026-01-10', 'দুপুর ২:০০', 'completed',
  'অ্যান্টিবায়োটিক দেওয়া হয়েছে';

INSERT INTO appointments (farmer_id, doctor_id, animal_type, animal_description, appointment_date, appointment_time, status, notes)
SELECT
  (SELECT id FROM users WHERE phone = '01766666666'),
  (SELECT d.id FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.phone = '01722222222'),
  'মুরগি', 'বয়স ৬ মাস। রানীক্ষেত রোগের লক্ষণ।',
  '2026-02-05', 'সকাল ৯:০০', 'completed',
  'ভ্যাকসিন দেওয়া হয়েছে, পুরো ঝাঁকে দেওয়ার পরামর্শ দেওয়া হয়েছে';

INSERT INTO appointments (farmer_id, doctor_id, animal_type, animal_description, appointment_date, appointment_time, status)
SELECT
  (SELECT id FROM users WHERE phone = '01777777777'),
  (SELECT d.id FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.phone = '01733333333'),
  'গরু', 'বয়স ৫ বছর। পা ফুলে গেছে, হাঁটতে পারছে না।',
  '2026-03-20', 'বিকাল ৩:০০', 'confirmed';

INSERT INTO appointments (farmer_id, doctor_id, animal_type, animal_description, appointment_date, appointment_time, status)
SELECT
  (SELECT id FROM users WHERE phone = '01755555555'),
  (SELECT d.id FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.phone = '01711111111'),
  'গরু', 'বয়স ২ বছর। টিকা দেওয়ার জন্য।',
  '2026-04-15', 'সকাল ১১:০০', 'pending';

-- Reviews
INSERT INTO reviews (farmer_id, doctor_id, rating, comment)
SELECT
  (SELECT id FROM users WHERE phone = '01755555555'),
  (SELECT d.id FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.phone = '01711111111'),
  5, 'অত্যন্ত দক্ষ এবং সৎ ডাক্তার। গরু এখন সম্পূর্ণ সুস্থ।';

INSERT INTO reviews (farmer_id, doctor_id, rating, comment)
SELECT
  (SELECT id FROM users WHERE phone = '01755555555'),
  (SELECT d.id FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.phone = '01711111111'),
  4, 'ভালো চিকিৎসা করেছেন। দাম একটু বেশি মনে হয়েছে।';

INSERT INTO reviews (farmer_id, doctor_id, rating, comment)
SELECT
  (SELECT id FROM users WHERE phone = '01766666666'),
  (SELECT d.id FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.phone = '01722222222'),
  5, 'পোলট্রি বিষয়ে খুবই অভিজ্ঞ। আমার পুরো ফার্মের মুরগি বেঁচে গেছে।';

INSERT INTO reviews (farmer_id, doctor_id, rating, comment)
SELECT
  (SELECT id FROM users WHERE phone = '01777777777'),
  (SELECT d.id FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.phone = '01733333333'),
  4, 'সময়মতো এসেছেন এবং ভালো পরামর্শ দিয়েছেন।';

-- Site Content
INSERT INTO site_content (key, value) VALUES
  ('navbar_title',         'পশুডক'),
  ('navbar_tagline',       'বিশ্বস্ত পশু চিকিৎসা সেবা'),
  ('footer_tagline',       'বাংলাদেশের কৃষকদের জন্য বিশ্বস্ত পশু চিকিৎসা সেবা প্ল্যাটফর্ম'),
  ('footer_address',       'ঢাকা, বাংলাদেশ'),
  ('footer_phone',         '01700000000'),
  ('footer_email',         'info@pashudoc.com'),
  ('footer_copyright',     '© ২০২৬ পশুডক। সর্বস্বত্ব সংরক্ষিত।'),
  ('landing_hero_title',   'আপনার পশুর সেরা চিকিৎসক খুঁজুন'),
  ('landing_hero_subtitle','বাংলাদেশের যেকোনো জেলায় অভিজ্ঞ পশু চিকিৎসক খুঁজুন এবং সহজেই অ্যাপয়েন্টমেন্ট নিন'),
  ('about_content',        '<h2>আমাদের সম্পর্কে</h2><p>পশুডক বাংলাদেশের কৃষকদের জন্য একটি বিশ্বস্ত পশু চিকিৎসা সেবা প্ল্যাটফর্ম।</p>'),
  ('contact_phone',        '01700000000'),
  ('contact_email',        'info@pashudoc.com'),
  ('contact_address',      'ঢাকা, বাংলাদেশ')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- =====================================================
-- সফলভাবে সম্পন্ন হলে নিচের result দেখাবে:
-- =====================================================
SELECT
  'সেটআপ সম্পন্ন!' AS status,
  (SELECT COUNT(*) FROM users)        AS মোট_ব্যবহারকারী,
  (SELECT COUNT(*) FROM doctors)      AS মোট_ডাক্তার,
  (SELECT COUNT(*) FROM appointments) AS মোট_অ্যাপয়েন্টমেন্ট,
  (SELECT COUNT(*) FROM reviews)      AS মোট_রিভিউ,
  (SELECT COUNT(*) FROM site_content) AS সাইট_কন্টেন্ট;
