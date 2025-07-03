import { JSX } from 'react'

export const Footer = (): JSX.Element => (
  <footer className='mt-14 text-center text-xs text-neutral-500'>
    <p>
      Made with ❤️ using{' '}
      <a href='https://stonejs.dev' className='text-orange-400 font-semibold'>
        Stone.js
      </a>
    </p>
    <p className='mt-2'>
      © 2025 Stone Foundation. All rights reserved.
    </p>
  </footer>
)
