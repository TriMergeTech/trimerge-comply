export default function SecurityPage() {
  return (
    <section className="security-card">
      <div className="security-head">
        <h3>Secure. Compliant. Trusted.</h3>
        <p>
          TriMerge Comply is built with enterprise-grade security
          <br />
          to protect your sensitive data.
        </p>
      </div>

      <div className="feature-grid">
        <div className="feature">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <path d="m8 12 3 3 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <h4>Secure Encryption</h4>
          <p>All data is encrypted in transit and at rest.</p>
        </div>

        <div className="feature">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" fill="none" stroke="currentColor" strokeWidth="2.2" />
            </svg>
          </div>
          <h4>Role-Based Access</h4>
          <p>Granular permissions for your team.</p>
        </div>

        <div className="feature">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <path d="M14 3v6h6M9 15l2 2 4-5" fill="none" stroke="currentColor" strokeWidth="2.2" />
            </svg>
          </div>
          <h4>Audit Logging</h4>
          <p>All activities are logged for compliance.</p>
        </div>

        <div className="feature">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="8" cy="15" r="4" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <path d="m11 12 8-8 3 3-2 2 2 2-2 2-2-2-4 4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <h4>Session Security</h4>
          <p>Automatic session timeout and secure tokens.</p>
        </div>

        <div className="feature">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17 18H7a5 5 0 0 1 .8-9.9A7 7 0 0 1 21 11a4 4 0 0 1-4 7Z" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <path d="M12 12v6M9 15l3-3 3 3" fill="none" stroke="currentColor" strokeWidth="2.2" />
            </svg>
          </div>
          <h4>Data Backup</h4>
          <p>Regular backups ensure data availability.</p>
        </div>

        <div className="feature">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <path d="m8 12 3 3 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <h4>Compliance Ready</h4>
          <p>Built to meet government security standards.</p>
        </div>
      </div>
    </section>
  );
}
