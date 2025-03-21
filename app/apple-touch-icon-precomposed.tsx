import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          background: '#4f46e5',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%'
        }}
      >
        <div
          style={{
            fontSize: 96,
            background: 'white',
            width: '80%',
            height: '80%',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            fontWeight: 'bold',
            color: '#4f46e5'
          }}
        >
          MYFC
        </div>
      </div>
    ),
    {
      width: 180,
      height: 180,
    },
  );
} 