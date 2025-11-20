
import { ImageResponse } from 'next/og'
import { Dumbbell } from 'lucide-react'
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '5px', // Rounded corners
        }}
      >
        {/* You can simply use text or a simple SVG path here */}
        <Dumbbell size={24} />
      </div>
    ),
    // ...size metadata
    { ...size }
  )
}