import HeroSection from '../HeroSection';
import heroImage from '@assets/generated_images/Amazon_canopy_sunlight_hero_975fbf35.png';

export default function HeroSectionExample() {
  return (
    <HeroSection 
      backgroundImage={heroImage}
      onSearch={(location, date, guests) => {
        console.log('Search:', { location, date, guests });
      }}
    />
  );
}
