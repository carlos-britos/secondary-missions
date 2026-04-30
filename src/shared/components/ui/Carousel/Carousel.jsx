import { useState, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PropTypes from 'prop-types'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

function Carousel({
  children,
  variant = 'products',
  slidesPerView = 4,
  spaceBetween = 16,
  autoplay = false,
  loop = false,
  showArrows = true,
  showDots = false,
  className = '',
  breakpoints,
  onSlideChange,
}) {
  const [swiperInstance, setSwiperInstance] = useState(null)

  const handlePrev = useCallback(() => {
    swiperInstance?.slidePrev()
  }, [swiperInstance])

  const handleNext = useCallback(() => {
    swiperInstance?.slideNext()
  }, [swiperInstance])

  const isHero = variant === 'hero'

  const defaultBreakpoints = isHero
    ? undefined
    : breakpoints || {
        0: { slidesPerView: 1.3, spaceBetween: 12 },
        576: { slidesPerView: 2.3, spaceBetween: 12 },
        768: { slidesPerView: 3, spaceBetween: 16 },
        992: { slidesPerView: slidesPerView, spaceBetween },
      }

  const modules = [Navigation, Pagination, Autoplay]

  const classes = ['carousel', `carousel--${variant}`, className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <Swiper
        modules={modules}
        slidesPerView={isHero ? 1 : undefined}
        spaceBetween={isHero ? 0 : undefined}
        breakpoints={defaultBreakpoints}
        loop={loop}
        autoplay={
          autoplay
            ? { delay: typeof autoplay === 'number' ? autoplay : 5000, disableOnInteraction: false }
            : false
        }
        pagination={showDots ? { clickable: true, el: '.carousel__dots' } : false}
        onSwiper={setSwiperInstance}
        onSlideChange={onSlideChange}
      >
        {Array.isArray(children) ? (
          children.map((child, i) => <SwiperSlide key={i}>{child}</SwiperSlide>)
        ) : (
          <SwiperSlide>{children}</SwiperSlide>
        )}
      </Swiper>

      {showArrows && (
        <>
          <button
            className="carousel__arrow carousel__arrow--prev"
            aria-label="Anterior"
            onClick={handlePrev}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="carousel__arrow carousel__arrow--next"
            aria-label="Siguiente"
            onClick={handleNext}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {showDots && <div className="carousel__dots" />}
    </div>
  )
}

Carousel.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['hero', 'products', 'categories']),
  slidesPerView: PropTypes.number,
  spaceBetween: PropTypes.number,
  autoplay: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  loop: PropTypes.bool,
  showArrows: PropTypes.bool,
  showDots: PropTypes.bool,
  className: PropTypes.string,
  breakpoints: PropTypes.object,
  onSlideChange: PropTypes.func,
}

export default Carousel
