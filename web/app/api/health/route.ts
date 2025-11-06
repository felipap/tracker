import { NextRequest } from 'next/server'
import { authMobileRequest } from '../lib'

export const GET = authMobileRequest(async (request: NextRequest) => {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})
