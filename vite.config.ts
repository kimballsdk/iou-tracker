
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/iou-tracker/', // <-- IMPORTANT: Change 'iou-tracker' to your GitHub repository name
})
