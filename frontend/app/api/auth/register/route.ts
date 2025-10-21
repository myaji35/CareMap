import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { z } from "zod"

const registerSchema = z.object({
  username: z.string().min(3, "아이디는 최소 3자 이상이어야 합니다"),
  email: z.string().email("올바른 이메일 주소를 입력하세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  passwordConfirm: z.string(),
  phoneNumber: z.string().optional(),
  organization: z.string().optional(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["passwordConfirm"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: validatedData.username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 사용 중인 아이디입니다" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        phoneNumber: validatedData.phoneNumber,
        organization: validatedData.organization,
        userType: "USER", // Default user type
      },
      select: {
        id: true,
        username: true,
        email: true,
        userType: true,
        phoneNumber: true,
        organization: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      user,
      message: "회원가입이 완료되었습니다",
    })
  } catch (error) {
    console.error("Registration error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
