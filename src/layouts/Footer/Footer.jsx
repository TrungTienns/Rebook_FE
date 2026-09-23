import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { path } from '../../common/path';
import './Footer.scss';
import Logo from '../../components/Logo/Logo';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="cartoon-footer">
      <div className="footer-container">

        {/* Cột 1: Thương hiệu */}
        <div className="footer-brand">
          <Logo variant="footer" />
          <p className="footer-tagline">
            {t('footer.tagline')}
          </p>
          <div className="footer-socials">
            <a href="#" className="social-btn" title="Facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="#" className="social-btn" title="Instagram">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="#" className="social-btn" title="Tiktok">
              <i className="fa-brands fa-tiktok"></i>
            </a>
          </div>
        </div>

        {/* Cột 2: Khám phá */}
        <div className="footer-col">
          <h4 className="footer-title">{t('footer.explore')}</h4>
          <ul className="footer-links">
            <li><Link to={path.HOME}>{t('footer.allBooks')}</Link></li>
            <li><Link to={path.HOME}>{t('footer.trending')}</Link></li>
            <li><Link to={path.HOME}>{t('footer.newRelease')}</Link></li>
            <li><Link to={path.HOME}>{t('footer.categories')}</Link></li>
          </ul>
        </div>

        {/* Cột 3: Hỗ trợ */}
        <div className="footer-col">
          <h4 className="footer-title">{t('footer.support')}</h4>
          <ul className="footer-links">
            <li><Link to={path.HOME}>{t('footer.faq')}</Link></li>
            <li><Link to={path.HOME}>{t('footer.contact')}</Link></li>
            <li><Link to={path.HOME}>{t('footer.privacy')}</Link></li>
            <li><Link to={path.HOME}>{t('footer.terms')}</Link></li>
          </ul>
        </div>

        {/* Cột 4: Newsletter */}
        <div className="footer-col footer-newsletter">
          <h4 className="footer-title">{t('footer.newsletter')}</h4>
          <p className="footer-newsletter-desc">{t('footer.newsletterDesc')}</p>
          <div className="newsletter-form">
            <input
              type="email"
              className="newsletter-input"
              placeholder={t('footer.emailPlaceholder')}
            />
            <button className="newsletter-btn">{t('footer.subscribe')}</button>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <span>{t('footer.copyright')}</span>
        <span className="footer-made">
          {t('footer.madeWith')} by <strong>Rebook Team</strong>
        </span>
      </div>
    </footer>
  );
}
