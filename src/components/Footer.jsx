export default function Footer({ footer, dateDisplay }) {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-light)',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '2.2rem',
          color: 'var(--accent-primary)',
          marginBottom: '0.5rem',
        }}
      >
        {footer.monogram}
      </p>
      <p
        style={{
          fontSize: '0.75rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
        }}
      >
        {footer.closingText} — {dateDisplay}
      </p>
    </footer>
  );
}
