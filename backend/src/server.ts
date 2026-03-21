import 'dotenv/config'
import { createApp } from './app/app'

const app = createApp()

const port = process.env.PORT ? Number(process.env.PORT) : 4000

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[by-celeste] backend running on http://localhost:${port}`)
})

