import React from 'react';
import { useTranslation } from 'react-i18next';
import './ExploreAbout.scss';

export default function ExploreAbout() {
  const { t } = useTranslation();

  const features = [
    {
      id: 1,
      icon: 'fa-solid fa-book-open',
      titleKey: 'exploreAbout.f1Title',
      descKey: 'exploreAbout.f1Desc',
      bgColor: '#ffeaa7'
    },
    {
      id: 2,
      icon: 'fa-solid fa-users',
      titleKey: 'exploreAbout.f2Title',
      descKey: 'exploreAbout.f2Desc',
      bgColor: '#80d8ff'
    },
    {
      id: 3,
      icon: 'fa-solid fa-gift',
      titleKey: 'exploreAbout.f3Title',
      descKey: 'exploreAbout.f3Desc',
      bgColor: '#ffb8b8'
    }
  ];

  return (
    <section className="explore-about">
      <div className="container">
        <div className="about-header">
          <h2 className="section-title">{t('exploreAbout.title')}</h2>
          <p className="section-desc">{t('exploreAbout.desc')}</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.id} style={{ backgroundColor: feature.bgColor }}>
              <div className="feature-icon">
                <i className={feature.icon}></i>
              </div>
              <h3 className="feature-title">{t(feature.titleKey)}</h3>
              <p className="feature-desc">{t(feature.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
