import { ArrowRight } from 'lucide-react'
import PropTypes from 'prop-types'
import Button from '@/components/ui/Button/Button'
import Carousel from '@/components/ui/Carousel/Carousel'
import './HeroCarousel.scss'

function HeroCarousel({ slides, loop = true, className = '' }) {
  const classes = ['hero-carousel', className].filter(Boolean).join(' ')

  return (
    <section className={classes}>
      <Carousel variant="hero" loop={loop} showArrows showDots>
        {slides.map((slide) => (
          <div key={slide.id} className="hero-carousel__slide">
            <img src={slide.image} alt={slide.title} className="hero-carousel__bg" />
            <div className="hero-carousel__overlay" />
            <div className="hero-carousel__content">
              <h1 className="hero-carousel__title">{slide.title}</h1>
              <p className="hero-carousel__subtitle">{slide.subtitle}</p>
              {slide.cta && (
                <Button
                  to={slide.ctaLink}
                  variant="filled"
                  color="primary"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  {slide.cta}
                </Button>
              )}
            </div>
            <img src={slide.image} alt="" aria-hidden="true" className="hero-carousel__shadow" />
          </div>
        ))}
      </Carousel>
    </section>
  )
}

HeroCarousel.propTypes = {
  slides: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string,
      cta: PropTypes.string,
      ctaLink: PropTypes.string,
      image: PropTypes.string.isRequired,
    })
  ).isRequired,
  loop: PropTypes.bool,
  className: PropTypes.string,
}

export default HeroCarousel
