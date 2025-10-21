import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { spawn } from "child_process"
import path from "path"

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

    // Path to the crawler script (adjust based on your project structure)
    const crawlerPath = path.join(process.cwd(), "..", "crawler", "main.py")
    const pythonPath = path.join(process.cwd(), "..", "crawler", "venv", "bin", "python")

    // Start the crawler process
    const crawlerProcess = spawn(pythonPath, [crawlerPath])

    let output = ""
    let error = ""

    crawlerProcess.stdout.on("data", (data) => {
      output += data.toString()
      console.log(`Crawler output: ${data}`)
    })

    crawlerProcess.stderr.on("data", (data) => {
      error += data.toString()
      console.error(`Crawler error: ${data}`)
    })

    // Return immediately with a success message
    // The crawler will run in the background
    return NextResponse.json({
      message: "크롤링이 시작되었습니다",
      status: "started",
    })
  } catch (error) {
    console.error("Error starting crawler:", error)
    return NextResponse.json(
      { error: "크롤러 시작 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
