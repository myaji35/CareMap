import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Create Admin user
  const hashedPassword = await bcrypt.hash('admdnjs!00', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'Admin' },
    update: {},
    create: {
      username: 'Admin',
      email: 'admin@caremap.com',
      password: hashedPassword,
      userType: 'ADMIN',
      isActive: true,
      isStaff: true,
      isSuperuser: true,
    },
  })

  console.log('✅ Admin user created:', { id: admin.id, username: admin.username })

  // 2. Create sample institutions
  const institutions = [
    {
      institutionCode: 'INST001',
      name: '서울 행복요양원',
      serviceType: '노인요양시설',
      capacity: 50,
      currentHeadcount: 42,
      address: '서울특별시 강남구 테헤란로 123',
      operatingHours: '24시간 운영',
      latitude: 37.5665,
      longitude: 126.9780,
    },
    {
      institutionCode: 'INST002',
      name: '경기 사랑요양센터',
      serviceType: '노인요양시설',
      capacity: 40,
      currentHeadcount: 37,
      address: '경기도 수원시 영통구 광교로 456',
      operatingHours: '24시간 운영',
      latitude: 37.2911,
      longitude: 127.0089,
    },
    {
      institutionCode: 'INST003',
      name: '인천 평화요양원',
      serviceType: '노인요양시설',
      capacity: 60,
      currentHeadcount: 41,
      address: '인천광역시 남동구 논현동 789',
      operatingHours: '24시간 운영',
      latitude: 37.4563,
      longitude: 126.7052,
    },
    {
      institutionCode: 'INST004',
      name: '부산 희망요양센터',
      serviceType: '노인요양시설',
      capacity: 45,
      currentHeadcount: 34,
      address: '부산광역시 해운대구 센텀중앙로 101',
      operatingHours: '24시간 운영',
      latitude: 35.1796,
      longitude: 129.0756,
    },
    {
      institutionCode: 'INST005',
      name: '대전 건강요양원',
      serviceType: '노인요양시설',
      capacity: 55,
      currentHeadcount: 48,
      address: '대전광역시 유성구 대학로 202',
      operatingHours: '24시간 운영',
      latitude: 36.3504,
      longitude: 127.3845,
    },
    {
      institutionCode: 'INST006',
      name: '광주 미래요양센터',
      serviceType: '노인요양시설',
      capacity: 35,
      currentHeadcount: 33,
      address: '광주광역시 북구 첨단과기로 303',
      operatingHours: '24시간 운영',
      latitude: 35.1595,
      longitude: 126.8526,
    },
  ]

  for (const inst of institutions) {
    const institution = await prisma.institution.upsert({
      where: { institutionCode: inst.institutionCode },
      update: {},
      create: inst,
    })
    console.log(`✅ Institution created: ${institution.name}`)

    // Add sample history data (last 6 months)
    const historyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      date.setDate(1)

      // Simulate some variation in headcount
      const variation = Math.floor(Math.random() * 5) - 2
      const headcount = Math.max(
        0,
        Math.min(inst.capacity!, (inst.currentHeadcount || 0) + variation)
      )

      historyData.push({
        institutionId: institution.id,
        recordedDate: date,
        name: institution.name,
        address: institution.address,
        capacity: institution.capacity,
        currentHeadcount: headcount,
      })
    }

    await prisma.institutionHistory.createMany({
      data: historyData,
      skipDuplicates: true,
    })
    console.log(`  ✅ Added ${historyData.length} history records`)
  }

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
