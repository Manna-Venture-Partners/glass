interface TestimonialProps {
  quote: string
  author: string
}

export default function Testimonial({ quote, author }: TestimonialProps) {
  return (
    <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-lg">
      <div className="text-2xl font-medium text-gray-900 mb-6 leading-relaxed">
        "{quote}"
      </div>
      <div className="text-lg font-semibold text-gray-900">— {author}</div>
    </div>
  )
}

