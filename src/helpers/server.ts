import ngrok from '@ngrok/ngrok'
import bodyParser from 'body-parser'
import type { Express } from 'express'
import express from 'express'
import type { Server } from '../types/local'

export async function createApiServer(): Promise<Server> {
  const server = await createExpressServer()
  const url = await createNgrokServer(server)
  return { server, url }
}

async function createExpressServer(): Promise<Express> {
  const app = express()
  app.use(bodyParser.json())
  return app
}

async function createNgrokServer(app: Express): Promise<string> {
  const session = await new ngrok.SessionBuilder().authtokenFromEnv().connect()
  const listener = await session.httpEndpoint().listen()
  ngrok.listen(app as any, listener)
  return listener.url() || ''
}
