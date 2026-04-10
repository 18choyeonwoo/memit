import styles from './Footer.module.css';

const links = ['PRIVACY', 'TERMS', 'ABOUT', 'MEME API'];

export default function Footer() {
  return (
    <footer className={styles['footer']}>
      <div className={styles['footer-links']}>
        {links.map((link) => (
          <a key={link} href="#" className={styles['footer-link']}>
            {link}
          </a>
        ))}
      </div>
      <p className={styles['footer-copy']}>&copy; 2024 MEMIT INC.</p>
    </footer>
  );
}
