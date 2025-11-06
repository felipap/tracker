import { db } from '@/db'
import { DEFAULT_USER_ID, Screenshots } from '@/db/schema'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { authMobileRequest } from '../lib'

const ScreenshotSchema = z.object({
  dataUrl: z.string(),
  timestamp: z.number(),
  displayId: z.string(),
  activeWindow: z.string().optional(),
  activeApp: z.string().optional(),
  systemInfo: z.union([z.record(z.any()), z.string()]).optional(),
})

const PostSchema = z.object({
  screenshots: z.array(ScreenshotSchema),
})

export const POST = authMobileRequest(async (request: NextRequest) => {
  console.log('POST /api/screenshots')

  const json = await request.json()

  const parsed = PostSchema.safeParse(json)
  if (!parsed.success) {
    console.warn('Invalid request body', { error: parsed.error })
    return Response.json({ error: parsed.error }, { status: 400 })
  }

  const insertedScreenshots = []

  for (const screenshot of parsed.data.screenshots) {
    const [inserted] = await db
      .insert(Screenshots)
      .values({
        userId: DEFAULT_USER_ID,
        timestamp: new Date(screenshot.timestamp),
        displayId: screenshot.displayId,
        dataUrl: screenshot.dataUrl,
        activeWindow: screenshot.activeWindow,
        activeApp: screenshot.activeApp,
        systemInfo:
          typeof screenshot.systemInfo === 'string'
            ? screenshot.systemInfo
            : screenshot.systemInfo
              ? JSON.stringify(screenshot.systemInfo)
              : null,
      })
      .returning()

    insertedScreenshots.push(inserted)
  }

  console.info(
    `Inserted ${insertedScreenshots.length} screenshot(s)`,
    insertedScreenshots.map((s) => s.id),
  )

  return Response.json({
    success: true,
    message: `Uploaded ${insertedScreenshots.length} screenshot(s)`,
    screenshotIds: insertedScreenshots.map((s) => s.id),
  })
})
