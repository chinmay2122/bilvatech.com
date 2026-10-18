'use client';

import React from 'react';

/**
 * Service pseudocode examples stored in separate configuration entries
 */
export const PSEUDOCODE_CONFIG = {
  kernel: {
    serviceLabel: 'Separation Kernel & Hypervisor',
    title: 'Isolation logic',
    caption: 'Controlled workload access and resource isolation.',
    code: `function handle_request(source, resource):
    if not authorised(source, resource):
        deny_access()
    if not within_bounds(source, resource):
        reject_request()
    return enforce_isolation(source, resource)`,
  },
  iot: {
    serviceLabel: 'Connected Operations & IoT',
    title: 'Device data pipeline',
    caption: 'Validated telemetry and secure device communication.',
    code: `function process_telemetry(device, data):
    if not authenticate(device):
        reject_device()
    validated = validate_payload(data)
    protected = encrypt(validated)
    transmit_securely(protected)
    record_device_status(device)`,
  },
  security: {
    serviceLabel: 'Embedded & Connected Security',
    title: 'Threat response',
    caption: 'Identify suspicious activity and initiate containment.',
    code: `function evaluate_event(event):
    context = inspect_event(event)
    risk = assess_risk(context)
    if risk > risk_threshold:
        contain_affected_component()
        alert_security_team(context)
    record_security_event(event, risk)`,
  },
  governance: {
    serviceLabel: 'Governance, Risk & Resilience',
    title: 'Risk management',
    caption: 'Translate identified risks into accountable remediation.',
    code: `function assess_security_posture(asset):
    risks = identify_risks(asset)
    controls = evaluate_controls(asset)
    gaps = map_control_gaps(risks, controls)
    actions = prioritise_remediation(gaps)
    assign_owners(actions)
    track_remediation(actions)`,
  },
};

/**
 * Reusable PseudocodePanel Component
 */
export function PseudocodePanel({
  title,
  caption,
  code,
  serviceLabel,
  badge = 'PSEUDOCODE',
  className = '',
}) {
  const lines = (code || '').split('\n');

  return (
    <div className={`pseudocode-panel-wrap ${className}`} style={{ borderRadius: 0 }}>
      <div
        className="pseudocode-panel"
        role="region"
        aria-label={`${title} pseudocode`}
        style={{
          background: '#0d0c12',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 0,
        }}
      >
        <div
          className="pseudocode-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            background: '#111017',
            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'inline-flex', gap: '5px' }} aria-hidden="true">
              <span style={{ width: 6, height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 0 }} />
              <span style={{ width: 6, height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 0 }} />
              <span style={{ width: 6, height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 0 }} />
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#f4f3f6',
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              {title}
            </h3>
          </div>
          <span
            style={{
              padding: '2px 7px',
              fontSize: '10px',
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
              color: '#8e8a9d',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 0,
            }}
          >
            {badge}
          </span>
        </div>

        <div
          className="pseudocode-body"
          style={{
            display: 'flex',
            padding: '18px 20px',
            background: '#0d0c12',
            borderRadius: 0,
            overflowX: 'auto',
          }}
        >
          <div
            className="pseudocode-lines"
            aria-hidden="true"
            style={{
              userSelect: 'none',
              textAlign: 'right',
              paddingRight: '16px',
              marginRight: '16px',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              color: '#4b4859',
              fontFamily: 'monospace',
              fontSize: '13px',
              lineHeight: 1.85,
            }}
          >
            {lines.map((_, i) => (
              <div key={i}>{String(i + 1).padStart(2, '0')}</div>
            ))}
          </div>
          <pre
            style={{
              margin: 0,
              padding: 0,
              fontFamily: 'monospace',
              fontSize: '13px',
              lineHeight: 1.85,
              color: '#e2e0ea',
              whiteSpace: 'pre',
              flex: 1,
            }}
          >
            <code>{code}</code>
          </pre>
        </div>

        <div
          className="pseudocode-caption"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 18px',
            background: '#0a090e',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 0,
            fontSize: '12.5px',
            color: '#8e8a9d',
          }}
        >
          <span style={{ display: 'inline-flex', color: '#716d82' }} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
          <p style={{ margin: 0 }}>{caption}</p>
        </div>
      </div>
    </div>
  );
}

export default PseudocodePanel;
