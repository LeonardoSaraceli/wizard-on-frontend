import { verifyToken } from '@/middleware/auth'
import {
  clientErrorHandler,
  getEmployeeById,
  omitPassword,
  serverErrorHandler,
} from '@/utils/helper'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const tokenCheck = verifyToken(req)

  if (tokenCheck.error) {
    return clientErrorHandler(tokenCheck.error, 403)
  }

  try {
    const id = tokenCheck.payload?.id
    const employee = await getEmployeeById(id)

    if (!employee.rowCount) {
      return clientErrorHandler('Employee not found', 404)
    }

    const employeeWithoutPassword = omitPassword(employee.rows)

    return new Response(
      JSON.stringify({ employee: employeeWithoutPassword[0] })
    )
  } catch (error) {
    return serverErrorHandler(error)
  }
}
