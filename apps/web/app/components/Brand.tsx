import Image from 'next/image'
import Link from 'next/link'

export default function Brand() {
  return <Link href="/" className="brand" aria-label="Mirror Gram home">
    <Image src="/mirror-gram-logo.jpg" alt="Mirror Gram logo" width={48} height={48} className="brand-mark" priority />
    <span className="brand-wordmark"><strong>MIRROR</strong><span>GRAM</span></span>
  </Link>
}
