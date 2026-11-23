import './FamilyAndQuote.css';

export default function FamilyAndQuote({ quote, familySection }) {
  const showQuote = quote?.enabled;
  const activeGroups = (familySection?.groups || []).filter(
    (g) => g.enabled !== false && (g.role?.trim() || g.members?.some((m) => m.trim()))
  );
  const showFamily = familySection?.enabled !== false && activeGroups.length > 0;

  if (!showQuote && !showFamily) return null;

  return (
    <section className="section-container">
      {showQuote && (
        <div className="quote-block">
          <blockquote className="quote-text">{quote.text}</blockquote>
          {quote.author && (
            <span className="quote-author">— {quote.author}</span>
          )}
        </div>
      )}

      {showFamily && (
        <div>
          <span className="section-subtitle">{familySection.subtitle}</span>
          <div className="family-grid">
            {activeGroups.map((group, idx) => (
              <div key={group.id || idx} className="family-group">
                <h3>{group.role}</h3>
                {group.members
                  .filter((m) => m.trim() !== '')
                  .map((member, mIdx) => (
                    <p key={mIdx}>{member}</p>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
