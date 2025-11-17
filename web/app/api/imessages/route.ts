import { NextRequest } from 'next/server'
import { db } from '@/db'
import { DEFAULT_USER_ID, iMessages } from '@/db/schema'
import { authMobileRequest } from '../lib'
import { z } from 'zod'
import { and, eq, gte } from 'drizzle-orm'

const FormattediMessageSchema = z.object({
  id: z.number(),
  guid: z.string(),
  text: z.string().nullable(),
  contact: z.string(),
  subject: z.string().nullable(),
  date: z.string().nullable(),
  isFromMe: z.boolean(),
  isRead: z.boolean(),
  isSent: z.boolean(),
  isDelivered: z.boolean(),
  hasAttachments: z.boolean(),
  service: z.string(),
  chatId: z.string().optional(),
  chatName: z.string().nullable().optional(),
})

const PostSchema = z.object({
  messages: z.array(FormattediMessageSchema),
  syncTime: z.string(),
  deviceId: z.string(),
  messageCount: z.number(),
})

export const GET = authMobileRequest(async (request: NextRequest) => {
  console.log('GET /api/imessages')

  const { searchParams } = new URL(request.url)
  const afterParam = searchParams.get('after')

  const conditions = [eq(iMessages.userId, DEFAULT_USER_ID)]

  if (afterParam) {
    const afterDate = new Date(afterParam)
    if (isNaN(afterDate.getTime())) {
      return Response.json(
        { error: 'Invalid date format for "after" parameter' },
        { status: 400 },
      )
    }
    conditions.push(gte(iMessages.date, afterDate))
  }

  const messages = await db.query.iMessages.findMany({
    where: and(...conditions),
    orderBy: (iMessages, { desc }) => [desc(iMessages.date)],
    limit: 1000,
  })

  console.info(`Retrieved ${messages.length} iMessages`)

  return Response.json({
    success: true,
    messages,
    count: messages.length,
  })
})

export const POST = authMobileRequest(async (request: NextRequest) => {
  console.log('POST /api/imessages')

  const json = await request.json()

  const parsed = PostSchema.safeParse(json)
  if (!parsed.success) {
    console.warn('Invalid request body', { error: parsed.error })
    return Response.json({ error: parsed.error }, { status: 400 })
  }

  const { messages, syncTime, deviceId, messageCount } = parsed.data

  console.log(
    `Received ${messageCount} iMessages from device ${deviceId} at ${syncTime}`,
  )

  if (messages.length === 0) {
    return Response.json({
      success: true,
      message: 'No messages to sync',
      messageCount: 0,
      syncedAt: new Date().toISOString(),
    })
  }

  const insertedMessages = []

  for (const message of messages) {
    const result = await db
      .insert(iMessages)
      .values({
        userId: DEFAULT_USER_ID,
        messageId: message.id,
        guid: message.guid,
        text: message.text,
        contact: message.contact,
        subject: message.subject,
        date: message.date ? new Date(message.date) : null,
        isFromMe: message.isFromMe ? 1 : 0,
        isRead: message.isRead ? 1 : 0,
        isSent: message.isSent ? 1 : 0,
        isDelivered: message.isDelivered ? 1 : 0,
        hasAttachments: message.hasAttachments ? 1 : 0,
        service: message.service,
        chatId: message.chatId || null,
        chatName: message.chatName || null,
        deviceId,
        syncTime: new Date(syncTime),
      })
      .onConflictDoNothing()
      .returning()

    if (result.length > 0) {
      insertedMessages.push(result[0])
    }
  }

  const skippedCount = messages.length - insertedMessages.length

  console.info(`Inserted ${insertedMessages.length} iMessages`)
  console.info(`Skipped ${skippedCount} duplicate messages`)
  console.info('Inserted message IDs:', insertedMessages.map((m) => m.id))

  return Response.json({
    success: true,
    message: `Stored ${insertedMessages.length} iMessages`,
    messageCount: insertedMessages.length,
    syncedAt: new Date().toISOString(),
  })
})

