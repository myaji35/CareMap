import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin permissions
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      )
    }

    if (session.user.userType !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      )
    }

    // For demo purposes, simulate crawler execution
    // In production, you would actually call the Python crawler here

    // Simulate updating institution data
    const institutions = await prisma.institution.findMany()

    let updated = 0
    let failed = 0

    for (const inst of institutions) {
      try {
        // Simulate random headcount change
        const change = Math.floor(Math.random() * 5) - 2
        const newHeadcount = Math.max(
          0,
          Math.min(inst.capacity || 0, (inst.currentHeadcount || 0) + change)
        )

        await prisma.institution.update({
          where: { id: inst.id },
          data: {
            currentHeadcount: newHeadcount,
            lastUpdatedAt: new Date()
          },
        })

        // Add history record
        await prisma.institutionHistory.create({
          data: {
            institutionId: inst.id,
            recordedDate: new Date(),
            name: inst.name,
            address: inst.address,
            capacity: inst.capacity,
            currentHeadcount: newHeadcount,
          },
        })

        updated++
      } catch (err) {
        console.error(`Failed to update institution ${inst.id}:`, err)
        failed++
      }
    }

    return NextResponse.json({
      message: "크롤링이 완료되었습니다",
      status: "completed",
      stats: {
        total: institutions.length,
        updated,
        failed,
      },
    })
  } catch (error) {
    console.error("Error in crawler:", error)
    return NextResponse.json(
      { error: "크롤러 실행 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
