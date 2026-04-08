import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL ?? "PashuDoc <noreply@pashudoc.com>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

async function send(to: string, subject: string, html: string) {
  if (!resend || !to) return;
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[Resend] Email send failed:", err);
  }
}

function base(title: string, body: string) {
  return `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px}.container{max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}.header{background:#2d7a3a;padding:24px 32px;text-align:center}.header h1{color:#ffffff;margin:0;font-size:24px}.body{padding:32px}.footer{background:#f9f9f9;padding:16px 32px;text-align:center;color:#888;font-size:12px;border-top:1px solid #eee}.btn{display:inline-block;background:#2d7a3a;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px}</style></head><body><div class="container"><div class="header"><h1>🐄 পশুডক</h1></div><div class="body">${body}</div><div class="footer">পশুডক — বাংলাদেশের কৃষকদের আস্থার প্রতীক</div></div></body></html>`;
}

export async function sendWelcomeEmail(name: string, email: string, role: string) {
  const roleLabel = role === "doctor" ? "ডাক্তার" : "কৃষক";
  await send(
    email,
    "পশুডকে স্বাগতম!",
    base("স্বাগতম", `
      <h2>স্বাগতম, ${name}!</h2>
      <p>পশুডক প্ল্যাটফর্মে আপনার <strong>${roleLabel}</strong> অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।</p>
      ${role === "doctor" ? "<p>আপনার প্রোফাইল অ্যাডমিন কর্তৃক যাচাই হলে সার্চে দেখা যাবে। ২৪-৪৮ ঘণ্টার মধ্যে অনুমোদন জানানো হবে।</p>" : "<p>এখন আপনার এলাকার অভিজ্ঞ পশু ডাক্তার খুঁজুন এবং অ্যাপয়েন্টমেন্ট নিন।</p>"}
      <p>ধন্যবাদ পশুডক পরিবারের অংশ হওয়ার জন্য।</p>
    `)
  );
}

export async function sendDoctorApprovalEmail(name: string, email: string) {
  await send(
    email,
    "আপনার ডাক্তার প্রোফাইল অনুমোদিত হয়েছে!",
    base("প্রোফাইল অনুমোদন", `
      <h2>অভিনন্দন, ডাঃ ${name}!</h2>
      <p>আপনার ভেটেরিনারি ডাক্তার প্রোফাইল <strong>অনুমোদিত</strong> হয়েছে।</p>
      <p>এখন থেকে আপনার প্রোফাইল পশুডকের সার্চে দেখা যাবে এবং কৃষকরা আপনার সাথে অ্যাপয়েন্টমেন্ট নিতে পারবেন।</p>
      <p>আপনার ড্যাশবোর্ডে লগইন করে অ্যাপয়েন্টমেন্ট পরিচালনা করুন।</p>
    `)
  );
}

export async function sendDoctorRejectionEmail(name: string, email: string) {
  await send(
    email,
    "আপনার ডাক্তার প্রোফাইল সম্পর্কে আপডেট",
    base("প্রোফাইল আপডেট", `
      <h2>প্রিয় ${name},</h2>
      <p>দুঃখিত, আপনার ভেটেরিনারি ডাক্তার প্রোফাইলটি এই মুহূর্তে অনুমোদন দেওয়া সম্ভব হয়নি।</p>
      <p>আরও তথ্যের জন্য অথবা পুনরায় আবেদনের জন্য আমাদের সাথে যোগাযোগ করুন।</p>
    `)
  );
}

export async function sendAppointmentConfirmationEmail(
  farmerName: string, farmerEmail: string,
  doctorName: string, date: string, time: string, animalType: string
) {
  await send(
    farmerEmail,
    "অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে",
    base("অ্যাপয়েন্টমেন্ট নিশ্চিতকরণ", `
      <h2>অ্যাপয়েন্টমেন্ট নিশ্চিত!</h2>
      <p>প্রিয় <strong>${farmerName}</strong>, আপনার অ্যাপয়েন্টমেন্ট সফলভাবে বুক হয়েছে।</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">ডাক্তার</td><td style="padding:8px">ডাঃ ${doctorName}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">পশুর ধরন</td><td style="padding:8px">${animalType}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">তারিখ</td><td style="padding:8px">${date}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">সময়</td><td style="padding:8px">${time}</td></tr>
      </table>
      <p>নির্ধারিত সময়ে উপস্থিত থাকুন। অ্যাপয়েন্টমেন্ট বাতিল করতে হলে আপনার ড্যাশবোর্ড থেকে করুন।</p>
    `)
  );
}

export async function sendNewDoctorAdminNotification(doctorName: string, phone: string) {
  if (!ADMIN_EMAIL) return;
  await send(
    ADMIN_EMAIL,
    "নতুন ডাক্তার নিবন্ধনের অনুরোধ",
    base("নতুন ডাক্তার", `
      <h2>নতুন ডাক্তার নিবন্ধন</h2>
      <p>একজন নতুন ভেটেরিনারি ডাক্তার অনুমোদনের জন্য অপেক্ষা করছেন।</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">নাম</td><td style="padding:8px">${doctorName}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">ফোন</td><td style="padding:8px">${phone}</td></tr>
      </table>
      <p>অ্যাডমিন ড্যাশবোর্ড থেকে অনুমোদন দিন।</p>
    `)
  );
}
