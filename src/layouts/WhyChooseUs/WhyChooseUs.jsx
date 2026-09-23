import { useTranslation } from 'react-i18next';
import './WhyChooseUs.scss';
import boyImage from '../../assets/Images/boyinachair.png';
import boySpeakingImage from '../../assets/Images/mastery_boy.jpg';
import discoverBoyImage from '../../assets/Images/discover_boy.jpg';

export default function WhyChooseUs() {
  const { t } = useTranslation();
  
  const steps = t('journey.steps', { returnObjects: true });
  const stepImages = [discoverBoyImage, boyImage, boySpeakingImage];
  
  // SVG Icons for the 3 steps
  const getStepIcon = (index) => {
    switch(index) {
      case 0:
        return (
          <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        );
      case 1:
        return (
          <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
        );
      case 2:
        return (
          <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        );
      default: return null;
    }
  };

  return (
    <section className="why-choose-us journey-section">
      <div className="container">
        <h2 className="section-title">
          <span className="highlight">{t('journey.titlePart1')}</span> {t('journey.titlePart2')}
        </h2>
        
        <div className="journey-grid">
          {Array.isArray(steps) && steps.map((step, index) => (
            <div className="journey-card" key={index}>
              <div className="card-inner">
                <div className="card-image-wrapper">
                  <img src={stepImages[index]} alt={step.title} className="card-image" />
                  <div className="step-badge">{index + 1}</div>
                </div>
                <div className="card-content">
                  <div className="icon-wrapper">
                    {getStepIcon(index)}
                  </div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
