import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const serviceType = searchParams.get("serviceType")

    const institutions = await prisma.institution.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(serviceType && { serviceType }),
      },
      select: {
        id: true,
        institutionCode: true,
        name: true,
        serviceType: true,
        capacity: true,
        currentHeadcount: true,
        address: true,
        operatingHours: true,
        latitude: true,
        longitude: true,
        lastUpdatedAt: true,
      },
      orderBy: {
        lastUpdatedAt: "desc",
      },
    })

    // Calculate occupancy rate for each institution
    const institutionsWithOccupancy = institutions.map((inst) => ({
      ...inst,
      occupancyRate:
        inst.capacity && inst.currentHeadcount
          ? Math.round((inst.currentHeadcount / inst.capacity) * 100)
          : 0,
    }))

    return NextResponse.json(institutionsWithOccupancy)
  } catch (error) {
    console.error("Error fetching institutions:", error)
    return NextResponse.json(
      { error: "기관 목록을 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const institution = await prisma.institution.create({
      data: {
        institutionCode: body.institutionCode,
        name: body.name,
        serviceType: body.serviceType,
        capacity: body.capacity,
        currentHeadcount: body.currentHeadcount,
        address: body.address,
        operatingHours: body.operatingHours,
        latitude: body.latitude,
        longitude: body.longitude,
      },
    })

    return NextResponse.json(institution, { status: 201 })
  } catch (error) {
    console.error("Error creating institution:", error)
    return NextResponse.json(
      { error: "기관 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
