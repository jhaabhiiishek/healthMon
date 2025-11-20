import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pulse AI Fitness',
    short_name: 'Pulse AI',
    description: 'AI-powered workout and diet planner',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#10b981',
    icons: [
      {
        src: 'public/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}