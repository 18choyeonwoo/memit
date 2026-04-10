import styles from './Skeleton.module.css';

export default function Skeleton({ width, height, borderRadius, className = '' }) {
  const customStyles = {
    width: width || '100%',
    height: height || '20px',
    borderRadius: borderRadius || '4px',
  };

  return (
    <div 
      className={`${styles['skeleton-base']} ${className}`} 
      style={customStyles}
    />
  );
}
