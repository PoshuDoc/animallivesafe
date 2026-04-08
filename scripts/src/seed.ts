import bcrypt from "bcryptjs";
import { db, usersTable, doctorsTable, appointmentsTable, reviewsTable } from "@workspace/db";

async function seed() {
  console.log("ডেটাবেস সিড শুরু হচ্ছে...");

  const existingAdmin = await db.query.usersTable.findFirst({
    where: (u, { eq }) => eq(u.phone, "01700000000"),
  });

  if (existingAdmin) {
    console.log("ডেটা আগেই বিদ্যমান। সিড বাদ দেওয়া হচ্ছে।");
    process.exit(0);
  }

  const adminHash = await bcrypt.hash("admin123", 10);
  const doctorHash = await bcrypt.hash("doctor123", 10);
  const farmerHash = await bcrypt.hash("farmer123", 10);

  const [admin] = await db.insert(usersTable).values({
    name: "অ্যাডমিন",
    phone: "01700000000",
    passwordHash: adminHash,
    role: "admin",
    district: "ঢাকা",
  }).returning();
  console.log("অ্যাডমিন তৈরি:", admin.id);

  const doctorUsers = await db.insert(usersTable).values([
    {
      name: "ডা. মোহাম্মদ রহমান",
      phone: "01711111111",
      passwordHash: doctorHash,
      role: "doctor",
      district: "ঢাকা",
    },
    {
      name: "ডা. ফাতেমা বেগম",
      phone: "01722222222",
      passwordHash: doctorHash,
      role: "doctor",
      district: "চট্টগ্রাম",
    },
    {
      name: "ডা. করিম উদ্দিন",
      phone: "01733333333",
      passwordHash: doctorHash,
      role: "doctor",
      district: "রাজশাহী",
    },
    {
      name: "ডা. নাসরিন আক্তার",
      phone: "01744444444",
      passwordHash: doctorHash,
      role: "doctor",
      district: "সিলেট",
    },
    {
      name: "ডা. হাবিবুর রহমান",
      phone: "01788888888",
      passwordHash: doctorHash,
      role: "doctor",
      district: "খুলনা",
    },
  ]).returning();
  console.log("ডাক্তার ব্যবহারকারী তৈরি:", doctorUsers.length);

  const doctors = await db.insert(doctorsTable).values([
    {
      userId: doctorUsers[0].id,
      specialties: ["গরু", "ছাগল"],
      district: "ঢাকা",
      upazila: "ধামরাই",
      clinicName: "রহমান পশু চিকিৎসা কেন্দ্র",
      chamberAddress: "ধামরাই বাজার, ঢাকা",
      bio: "১৫ বছরের অভিজ্ঞতাসম্পন্ন পশু চিকিৎসক। গরু ও ছাগলের রোগ নির্ণয় এবং চিকিৎসায় বিশেষজ্ঞ।",
      yearsExperience: 15,
      consultationFee: 500,
      status: "approved",
      isFeatured: true,
    },
    {
      userId: doctorUsers[1].id,
      specialties: ["মুরগি", "হাঁস"],
      district: "চট্টগ্রাম",
      upazila: "হাটহাজারী",
      clinicName: "ফাতেমা পোলট্রি ক্লিনিক",
      chamberAddress: "হাটহাজারী রোড, চট্টগ্রাম",
      bio: "মুরগি ও হাঁসের রোগ এবং পোলট্রি ব্যবস্থাপনায় দক্ষ বিশেষজ্ঞ।",
      yearsExperience: 10,
      consultationFee: 400,
      status: "approved",
      isFeatured: true,
    },
    {
      userId: doctorUsers[2].id,
      specialties: ["গরু", "মুরগি"],
      district: "রাজশাহী",
      upazila: "পুঠিয়া",
      clinicName: "করিম ভেটেরিনারি সেবা",
      chamberAddress: "পুঠিয়া বাজার, রাজশাহী",
      bio: "গ্রামীণ পশু চিকিৎসায় ১২ বছরের বাস্তব অভিজ্ঞতা।",
      yearsExperience: 12,
      consultationFee: 350,
      status: "approved",
      isFeatured: false,
    },
    {
      userId: doctorUsers[3].id,
      specialties: ["ছাগল", "গরু"],
      district: "সিলেট",
      upazila: "গোলাপগঞ্জ",
      clinicName: "নাসরিন পশু স্বাস্থ্য কেন্দ্র",
      chamberAddress: "গোলাপগঞ্জ, সিলেট",
      bio: "পশু প্রজনন ও স্বাস্থ্য ব্যবস্থাপনায় বিশেষজ্ঞ।",
      yearsExperience: 8,
      consultationFee: 450,
      status: "approved",
      isFeatured: false,
    },
    {
      userId: doctorUsers[4].id,
      specialties: ["কুকুর", "বিড়াল", "গরু"],
      district: "খুলনা",
      upazila: "ডুমুরিয়া",
      clinicName: "হাবিব অ্যানিমেল কেয়ার",
      chamberAddress: "ডুমুরিয়া, খুলনা",
      bio: "পোষা প্রাণী ও গৃহপালিত পশুর সমন্বিত চিকিৎসায় অভিজ্ঞ।",
      yearsExperience: 6,
      consultationFee: 600,
      status: "pending",
      isFeatured: false,
    },
  ]).returning();
  console.log("ডাক্তার প্রোফাইল তৈরি:", doctors.length);

  const farmers = await db.insert(usersTable).values([
    {
      name: "রহিম মিয়া",
      phone: "01755555555",
      passwordHash: farmerHash,
      role: "farmer",
      district: "ঢাকা",
    },
    {
      name: "করিম শেখ",
      phone: "01766666666",
      passwordHash: farmerHash,
      role: "farmer",
      district: "চট্টগ্রাম",
    },
    {
      name: "আনোয়ার হোসেন",
      phone: "01777777777",
      passwordHash: farmerHash,
      role: "farmer",
      district: "রাজশাহী",
    },
  ]).returning();
  console.log("কৃষক তৈরি:", farmers.length);

  const appointments = await db.insert(appointmentsTable).values([
    {
      farmerId: farmers[0].id,
      doctorId: doctors[0].id,
      animalType: "গরু",
      animalDescription: "বয়স ৩ বছর। জ্বর, খাচ্ছে না, দুধ কমে গেছে।",
      appointmentDate: "2025-12-15",
      appointmentTime: "সকাল ১০:০০",
      status: "completed",
      notes: "ভিটামিন ইনজেকশন দেওয়া হয়েছে, ৭ দিনের ওষুধ দেওয়া হয়েছে",
    },
    {
      farmerId: farmers[0].id,
      doctorId: doctors[0].id,
      animalType: "ছাগল",
      animalDescription: "বয়স ১ বছর। পেট ফোলা, ডায়রিয়া।",
      appointmentDate: "2026-01-10",
      appointmentTime: "দুপুর ২:০০",
      status: "completed",
      notes: "অ্যান্টিবায়োটিক দেওয়া হয়েছে",
    },
    {
      farmerId: farmers[1].id,
      doctorId: doctors[1].id,
      animalType: "মুরগি",
      animalDescription: "বয়স ৬ মাস। রানীক্ষেত রোগের লক্ষণ।",
      appointmentDate: "2026-02-05",
      appointmentTime: "সকাল ৯:০০",
      status: "completed",
      notes: "ভ্যাকসিন দেওয়া হয়েছে, পুরো ঝাঁকে দেওয়ার পরামর্শ দেওয়া হয়েছে",
    },
    {
      farmerId: farmers[2].id,
      doctorId: doctors[2].id,
      animalType: "গরু",
      animalDescription: "বয়স ৫ বছর। পা ফুলে গেছে, হাঁটতে পারছে না।",
      appointmentDate: "2026-03-20",
      appointmentTime: "বিকাল ৩:০০",
      status: "confirmed",
    },
    {
      farmerId: farmers[0].id,
      doctorId: doctors[0].id,
      animalType: "গরু",
      animalDescription: "বয়স ২ বছর। টিকা দেওয়ার জন্য।",
      appointmentDate: "2026-04-15",
      appointmentTime: "সকাল ১১:০০",
      status: "pending",
    },
  ]).returning();
  console.log("অ্যাপয়েন্টমেন্ট তৈরি:", appointments.length);

  await db.insert(reviewsTable).values([
    {
      farmerId: farmers[0].id,
      doctorId: doctors[0].id,
      rating: 5,
      comment: "অত্যন্ত দক্ষ এবং সৎ ডাক্তার। গরু এখন সম্পূর্ণ সুস্থ।",
    },
    {
      farmerId: farmers[0].id,
      doctorId: doctors[0].id,
      rating: 4,
      comment: "ভালো চিকিৎসা করেছেন। দাম একটু বেশি মনে হয়েছে।",
    },
    {
      farmerId: farmers[1].id,
      doctorId: doctors[1].id,
      rating: 5,
      comment: "পোলট্রি বিষয়ে খুবই অভিজ্ঞ। আমার পুরো ফার্মের মুরগি বেঁচে গেছে।",
    },
    {
      farmerId: farmers[2].id,
      doctorId: doctors[2].id,
      rating: 4,
      comment: "সময়মতো এসেছেন এবং ভালো পরামর্শ দিয়েছেন।",
    },
  ]);
  console.log("রিভিউ তৈরি হয়েছে।");

  console.log("\nসিড সম্পন্ন!");
  console.log("লগইন তথ্য:");
  console.log("  অ্যাডমিন: 01700000000 / admin123");
  console.log("  ডাক্তার: 01711111111 / doctor123");
  console.log("  কৃষক: 01755555555 / farmer123");

  process.exit(0);
}

seed().catch((err) => {
  console.error("সিড ব্যর্থ হয়েছে:", err);
  process.exit(1);
});
