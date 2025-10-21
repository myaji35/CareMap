import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    const institution = await prisma.institution.findUnique({
      where: { id },
      include: {
        history: {
          orderBy: {
            recordedDate: "desc",
          },
          take: 12, // Last 12 months
        },
      },
    })

    if (!institution) {
      return NextResponse.json(
        { error: "기관을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    return NextResponse.json(institution)
  } catch (error) {
    console.error("Error fetching institution:", error)
    return NextResponse.json(
      { error: "기관 정보를 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()

    const institution = await prisma.institution.update({
      where: { id },
      data: {
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

    return NextResponse.json(institution)
  } catch (error) {
    console.error("Error updating institution:", error)
    return NextResponse.json(
      { error: "기관 수정 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    await prisma.institution.delete({
      where: { id },
    })

    return NextResponse.json({ message: "기관이 삭제되었습니다" })
  } catch (error) {
    console.error("Error deleting institution:", error)
    return NextResponse.json(
      { error: "기관 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
