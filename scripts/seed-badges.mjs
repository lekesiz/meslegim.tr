import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const BADGES = [
  // === MILESTONE (Kilometre Taşı) ===
  { slug: "first-stage", name: "İlk Adım", description: "İlk etabınızı tamamladınız! Kariyer yolculuğunuz başladı.", icon: "rocket", color: "blue", category: "milestone", rarity: "common", xpReward: 10, sortOrder: 1 },
  { slug: "three-stages", name: "Kararlı Yolcu", description: "3 etabı tamamladınız. Kararlılığınız takdire şayan!", icon: "footprints", color: "green", category: "milestone", rarity: "rare", xpReward: 30, sortOrder: 2 },
  { slug: "all-stages", name: "Tam Tamamlama", description: "Tüm etapları tamamladınız! Kariyer profiliniz hazır.", icon: "trophy", color: "amber", category: "milestone", rarity: "legendary", xpReward: 100, sortOrder: 3 },
  { slug: "first-report", name: "İlk Rapor", description: "İlk AI destekli kariyer raporunuzu aldınız.", icon: "file-text", color: "purple", category: "milestone", rarity: "common", xpReward: 15, sortOrder: 4 },
  { slug: "profile-complete", name: "Profil Uzmanı", description: "Kariyer profili özetinizi oluşturdunuz.", icon: "user-check", color: "indigo", category: "milestone", rarity: "rare", xpReward: 25, sortOrder: 5 },
  { slug: "certificate-earned", name: "Sertifika Sahibi", description: "Başarı sertifikanızı kazandınız!", icon: "award", color: "amber", category: "milestone", rarity: "legendary", xpReward: 50, sortOrder: 6 },

  // === SPEED (Hız) ===
  { slug: "speed-stage", name: "Hız Kurşunu", description: "Bir etabı 10 dakikadan kısa sürede tamamladınız!", icon: "zap", color: "yellow", category: "speed", rarity: "rare", xpReward: 20, sortOrder: 10 },
  { slug: "daily-streak-3", name: "3 Gün Serisi", description: "3 gün üst üste platforma giriş yaptınız.", icon: "flame", color: "orange", category: "speed", rarity: "common", xpReward: 15, sortOrder: 11 },
  { slug: "daily-streak-7", name: "Haftalık Seri", description: "7 gün üst üste platforma giriş yaptınız!", icon: "flame", color: "red", category: "speed", rarity: "rare", xpReward: 35, sortOrder: 12 },
  { slug: "early-bird", name: "Erken Kuş", description: "Kayıt olduktan sonra ilk 24 saat içinde bir etap tamamladınız.", icon: "sunrise", color: "orange", category: "speed", rarity: "rare", xpReward: 25, sortOrder: 13 },

  // === MASTERY (Ustalık) ===
  { slug: "riasec-master", name: "RIASEC Uzmanı", description: "RIASEC ilgi alanları testini tamamladınız.", icon: "compass", color: "teal", category: "mastery", rarity: "common", xpReward: 15, sortOrder: 20 },
  { slug: "values-master", name: "Değerler Kaşifi", description: "Kariyer Değerleri Envanteri'ni tamamladınız.", icon: "heart", color: "rose", category: "mastery", rarity: "common", xpReward: 15, sortOrder: 21 },
  { slug: "risk-master", name: "Risk Analizcisi", description: "Kariyer Risk Analizi testini tamamladınız.", icon: "shield", color: "slate", category: "mastery", rarity: "common", xpReward: 15, sortOrder: 22 },
  { slug: "personality-master", name: "Kişilik Uzmanı", description: "Kişilik envanteri testini tamamladınız.", icon: "brain", color: "violet", category: "mastery", rarity: "common", xpReward: 15, sortOrder: 23 },

  // === SOCIAL (Sosyal) ===
  { slug: "feedback-giver", name: "Geri Bildirimci", description: "Pilot geri bildirim formunu doldurdunuz. Teşekkürler!", icon: "message-circle", color: "cyan", category: "social", rarity: "common", xpReward: 10, sortOrder: 30 },
  { slug: "mentor-approved", name: "Mentor Onaylı", description: "Mentorunuz tarafından onaylandınız.", icon: "check-circle", color: "green", category: "social", rarity: "common", xpReward: 10, sortOrder: 31 },

  // === SPECIAL (Özel) ===
  { slug: "pioneer", name: "Öncü", description: "Platformun ilk 100 kullanıcısından birisiniz!", icon: "star", color: "amber", category: "special", rarity: "epic", xpReward: 50, sortOrder: 40 },
  { slug: "explorer", name: "Kaşif", description: "Tüm test kategorilerinden en az birini tamamladınız.", icon: "map", color: "emerald", category: "special", rarity: "epic", xpReward: 40, sortOrder: 41 },
];

async function seed() {
  const conn = await mysql.createConnection(DATABASE_URL);

  for (const badge of BADGES) {
    // Check if badge already exists
    const [existing] = await conn.execute(
      "SELECT id FROM badges WHERE slug = ?",
      [badge.slug]
    );
    if (existing.length > 0) {
      console.log(`  ⏭️  Badge "${badge.slug}" already exists, skipping.`);
      continue;
    }

    await conn.execute(
      `INSERT INTO badges (slug, name, description, icon, color, category, rarity, xpReward, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [badge.slug, badge.name, badge.description, badge.icon, badge.color, badge.category, badge.rarity, badge.xpReward, badge.sortOrder]
    );
    console.log(`  ✅ Badge "${badge.name}" (${badge.slug}) added.`);
  }

  // Verify
  const [rows] = await conn.execute("SELECT COUNT(*) as cnt FROM badges");
  console.log(`\n🎖️  Total badges in database: ${rows[0].cnt}`);

  await conn.end();
}

seed().catch(console.error);
