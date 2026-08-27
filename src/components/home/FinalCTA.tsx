import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

export default function FinalCTA() {
  return (
    <section
      className="section-py bg-brand-sky/40 border-t border-brand-sky/70 relative overflow-hidden"
      aria-labelledby="final-cta-heading"
    >
      <Container className="relative z-10">
        <div className="text-center max-w-2xl mx-auto">

          {/* Eyebrow */}
          <span className="eyebrow block mb-2">
            Together, We Can
          </span>

          {/* Heading */}
          <h2
            id="final-cta-heading"
            className="text-brand-navy text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-balance mb-3 tracking-tight"
          >
            Start Something <span className="text-brand-green">That Matters</span>
          </h2>

          {/* Supporting text */}
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-6 max-w-xl mx-auto">
            Whether you volunteer your time, support our programmes, or help spread
            the word — you are helping young people connect with the environment and
            build the skills to lead real change in their communities.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-3.5">
            <Button href="/get-involved" variant="primary" size="lg" className="shadow-sm">
              Get Involved
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              Contact Us
            </Button>
          </div>

          {/* Domain */}
          <p className="text-text-secondary/70 text-xs mt-6 font-semibold tracking-wider uppercase">
            bridgeofcompassion.org
          </p>

        </div>
      </Container>
    </section>
  )
}
