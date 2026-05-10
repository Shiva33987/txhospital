import fs from 'fs';

const filePath = 'C:/Users/shiva/OneDrive/Desktop/TX-final/frontend/src/styles.css';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Find the line index for .fcta-form-card {
const startIndex = lines.findIndex(line => line.includes('.fcta-form-card {'));

if (startIndex !== -1) {
    const keptLines = lines.slice(0, startIndex);
    const newContent = `.fcta-form-card {
  background: #ffffff;
  border-radius: 1.8rem;
  padding: 2rem;
  box-shadow: 0 24px 60px rgba(190,24,93,0.12), 0 8px 24px rgba(0,0,0,0.06);
  border: 1px solid rgba(190,24,93,0.1);
  width: 100%;
  max-width: 460px;
  position: relative;
}

.fcta-form-icon {
  position: absolute;
  top: -1.6rem;
  left: 50%;
  transform: translateX(-50%);
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 999px;
  background: var(--brand);
  color: #ffffff;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 20px rgba(190,24,93,0.4);
  border: 3px solid #ffffff;
}

.fcta-form-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-top: 1rem;
}

.fcta-form-kicker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--brand);
  margin-bottom: 0.4rem;
}

.fcta-fk-line {
  width: 1.5rem;
  height: 1px;
  background: var(--brand);
  border-radius: 99px;
}

.fcta-form-sub {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

.fcta-form {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.fcta-field {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: #f8fafc;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 0.85rem;
  padding: 0.7rem 1rem;
  transition: border-color 200ms ease;
}

.fcta-field:focus-within {
  border-color: var(--brand);
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(190,24,93,0.08);
}

.fcta-field-icon {
  color: var(--brand);
  flex-shrink: 0;
}

.fcta-field-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.fcta-field-inner label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.fcta-field-inner input {
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: #0f172a;
  font-family: inherit;
  outline: none;
  padding: 0;
}

.fcta-field-inner input::placeholder {
  color: #94a3b8;
}

.fcta-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--brand), #db2777);
  color: #ffffff;
  border: none;
  border-radius: 0.85rem;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  margin-top: 0.4rem;
  box-shadow: 0 8px 24px rgba(190,24,93,0.35);
  transition: all 250ms ease;
}

.fcta-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(190,24,93,0.45);
}

.fcta-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.fcta-trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  margin-top: 1.2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0,0,0,0.06);
  flex-wrap: wrap;
}

.fcta-trust-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 500;
}

.fcta-trust-item svg {
  color: var(--brand);
}

@media (max-width: 1060px) {
  .fcta-inner {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

@media (max-width: 700px) {
  .fcta-section {
    padding: 4rem 0;
  }

  .fcta-inner {
    padding: 0 1.5rem;
  }

  .fcta-form-card {
    padding: 1.8rem 1.4rem;
  }
}

/* ── Doctors header text reduce ──────────────────── */
.doctors-title {
  font-size: clamp(1.6rem, 2.8vw, 2.6rem) !important;
}

.doctors-desc {
  font-size: 0.88rem !important;
}

.doctors-stat strong {
  font-size: 1.4rem !important;
}

.doctors-stat span {
  font-size: 0.7rem !important;
}

.doctors-header {
  padding: 2rem 0 1.5rem !important;
}

/* --- SITE FOOTER --- */
.site-footer {
  background: #0f172a;
  color: #f1f5f9;
  padding-top: 3.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}

.site-footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(190, 24, 93, 0.3), transparent);
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 0.8fr 1.2fr;
  gap: 2.5rem;
  padding-bottom: 2.5rem;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-logo-mark {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-logo-mark .logo-tx {
  font-size: 2.2rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.05em;
  line-height: 1;
}

.footer-logo-mark .logo-text {
  display: flex;
  flex-direction: column;
}

.footer-logo-mark .logo-h {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: #ffffff;
}

.footer-logo-mark .logo-tag {
  font-size: 0.55rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--brand-soft);
  text-transform: uppercase;
}

.footer-about {
  color: #94a3b8;
  font-size: 0.92rem;
  line-height: 1.7;
  margin: 0;
}

.footer-social {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  place-items: center;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--brand);
  border-color: var(--brand);
  color: #ffffff;
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(190, 24, 93, 0.3);
}

.footer-title {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  position: relative;
  padding-bottom: 0.75rem;
}

.footer-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 30px;
  height: 2px;
  background: var(--brand);
  border-radius: 99px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.footer-links a {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-block;
}

.footer-links a:hover {
  color: #ffffff;
  transform: translateX(5px);
}

.footer-contact-items {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.contact-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.contact-icon {
  color: var(--brand-soft);
  flex-shrink: 0;
  margin-top: 0.2rem;
}

.contact-item p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.5;
}

.emergency-badge {
  background: rgba(190, 24, 93, 0.1);
  border: 1px solid rgba(190, 24, 93, 0.2);
  padding: 1rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  animation: pulseGlow 3s infinite;
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 rgba(190, 24, 93, 0); }
  50% { box-shadow: 0 0 20px rgba(190, 24, 93, 0.2); }
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 2rem 0;
  background: rgba(0, 0, 0, 0.2);
}

.footer-bottom-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.copyright {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0;
}

.footer-sep {
  margin: 0 0.75rem;
  opacity: 0.3;
}

.footer-legal {
  display: flex;
  gap: 1.5rem;
}

.footer-legal a {
  color: #64748b;
  font-size: 0.85rem;
  transition: color 0.2s ease;
}

.footer-legal a:hover {
  color: #ffffff;
}

@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
  }
}

@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  .footer-bottom-inner {
    flex-direction: column;
    text-align: center;
    gap: 1.2rem;
  }
  .site-footer {
    padding-top: 4rem;
  }
}
`;
    keptLines.push(newContent);
    fs.writeFileSync(filePath, keptLines.join('\n'));
    console.log('Successfully fixed styles.css');
} else {
    console.error('Could not find start marker');
}
