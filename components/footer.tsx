export default function Footer() {
  return (
    <footer className='py-4'>
      <div className='container flex justify-center items-center'>
        <p className='text-center text-xs'>
          &copy; Sketch-MQ {new Date().getFullYear()}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

