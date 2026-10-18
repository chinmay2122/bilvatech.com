/**
 * Bilva Tech — Service Pseudocode Panel Component & Configurations
 *
 * Implements an editor-style technical pseudocode panel for the
 * Architecture / Context & Capabilities section of the service pages.
 * Supports standard browser script tags, UMD and CommonJS/Node environments.
 */

(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    global = typeof globalThis !== 'undefined' ? globalThis : global || self;
    factory((global.BilvaPseudocode = {}));
  }
})(this, function (exports) {
  'use strict';

  var PSEUDOCODE_SERVICES = {
    kernel: {
      id: 'kernel',
      title: 'Isolation logic',
      caption: 'Controlled workload access and resource isolation.',
      serviceLabel: 'Separation Kernel & Hypervisor',
      badge: 'PSEUDOCODE',
      code: [
        'function handle_request(source, resource):',
        '    if not authorised(source, resource):',
        '        deny_access()',
        '    if not within_bounds(source, resource):',
        '        reject_request()',
        '    return enforce_isolation(source, resource)',
      ].join('\n'),
    },

    iot: {
      id: 'iot',
      title: 'Device data pipeline',
      caption: 'Validated telemetry and secure device communication.',
      serviceLabel: 'Connected Operations & IoT',
      badge: 'PSEUDOCODE',
      code: [
        'function process_telemetry(device, data):',
        '    if not authenticate(device):',
        '        reject_device()',
        '    validated = validate_payload(data)',
        '    protected = encrypt(validated)',
        '    transmit_securely(protected)',
        '    record_device_status(device)',
      ].join('\n'),
    },

    security: {
      id: 'security',
      title: 'Threat response',
      caption: 'Identify suspicious activity and initiate containment.',
      serviceLabel: 'Embedded & Connected Security',
      badge: 'PSEUDOCODE',
      code: [
        'function evaluate_event(event):',
        '    context = inspect_event(event)',
        '    risk = assess_risk(context)',
        '    if risk > risk_threshold:',
        '        contain_affected_component()',
        '        alert_security_team(context)',
        '    record_security_event(event, risk)',
      ].join('\n'),
    },

    governance: {
      id: 'governance',
      title: 'Risk management',
      caption: 'Translate identified risks into accountable remediation.',
      serviceLabel: 'Governance, Risk & Resilience',
      badge: 'PSEUDOCODE',
      code: [
        'function assess_security_posture(asset):',
        '    risks = identify_risks(asset)',
        '    controls = evaluate_controls(asset)',
        '    gaps = map_control_gaps(risks, controls)',
        '    actions = prioritise_remediation(gaps)',
        '    assign_owners(actions)',
        '    track_remediation(actions)',
      ].join('\n'),
    },
  };

  /**
   * Escapes HTML characters safely.
   */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Applies restrained syntax highlighting to a line of pseudocode.
   */
  function highlightLine(line) {
    var indentMatch = line.match(/^(\s*)/);
    var indent = indentMatch ? indentMatch[1] : '';
    var trimmed = line.slice(indent.length);

    if (!trimmed) return indent;

    // Function declaration: function name(args):
    var fnDeclMatch = trimmed.match(/^function\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*:/);
    if (fnDeclMatch) {
      var fnName = fnDeclMatch[1];
      var params = fnDeclMatch[2]
        .split(',')
        .map(function (p) {
          return '<span class="pc-var">' + escapeHtml(p.trim()) + '</span>';
        })
        .join('<span class="pc-op">, </span>');

      return (
        indent +
        '<span class="pc-kw">function</span> <span class="pc-fn">' +
        escapeHtml(fnName) +
        '</span><span class="pc-op">(</span>' +
        params +
        '<span class="pc-op">):</span>'
      );
    }

    // If statement:
    if (trimmed.startsWith('if ')) {
      var rest = trimmed.slice(3);
      var hasColon = false;
      if (rest.endsWith(':')) {
        hasColon = true;
        rest = rest.slice(0, -1);
      }

      var formattedCondition = '';
      var isNegated = false;
      if (rest.startsWith('not ')) {
        isNegated = true;
        rest = rest.slice(4);
      }

      var compMatch = rest.match(/^([a-zA-Z0-9_]+)\s*([><!=]+)\s*([a-zA-Z0-9_]+)$/);
      if (compMatch) {
        formattedCondition =
          '<span class="pc-var">' +
          escapeHtml(compMatch[1]) +
          '</span> <span class="pc-op">' +
          escapeHtml(compMatch[2]) +
          '</span> <span class="pc-var">' +
          escapeHtml(compMatch[3]) +
          '</span>';
      } else {
        var callMatch = rest.match(/^([a-zA-Z0-9_]+)\s*\((.*?)\)$/);
        if (callMatch) {
          var callFn = callMatch[1];
          var callArgs = callMatch[2]
            .split(',')
            .filter(Boolean)
            .map(function (a) {
              return '<span class="pc-var">' + escapeHtml(a.trim()) + '</span>';
            })
            .join('<span class="pc-op">, </span>');
          formattedCondition =
            '<span class="pc-call">' +
            escapeHtml(callFn) +
            '</span><span class="pc-op">(</span>' +
            callArgs +
            '<span class="pc-op">)</span>';
        } else {
          formattedCondition = '<span class="pc-var">' + escapeHtml(rest) + '</span>';
        }
      }

      return (
        indent +
        '<span class="pc-kw">if</span> ' +
        (isNegated ? '<span class="pc-kw">not</span> ' : '') +
        formattedCondition +
        (hasColon ? '<span class="pc-op">:</span>' : '')
      );
    }

    // Return statement:
    if (trimmed.startsWith('return ')) {
      var returnRest = trimmed.slice(7);
      var returnCallMatch = returnRest.match(/^([a-zA-Z0-9_]+)\s*\((.*?)\)$/);
      if (returnCallMatch) {
        var retFn = returnCallMatch[1];
        var retArgs = returnCallMatch[2]
          .split(',')
          .filter(Boolean)
          .map(function (a) {
            return '<span class="pc-var">' + escapeHtml(a.trim()) + '</span>';
          })
          .join('<span class="pc-op">, </span>');
        return (
          indent +
          '<span class="pc-kw">return</span> <span class="pc-call">' +
          escapeHtml(retFn) +
          '</span><span class="pc-op">(</span>' +
          retArgs +
          '<span class="pc-op">)</span>'
        );
      }
      return indent + '<span class="pc-kw">return</span> <span class="pc-var">' + escapeHtml(returnRest) + '</span>';
    }

    // Assignment: var = fn(args)
    var assignMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*\((.*?)\)$/);
    if (assignMatch) {
      var leftVar = assignMatch[1];
      var assignFn = assignMatch[2];
      var assignArgs = assignMatch[3]
        .split(',')
        .filter(Boolean)
        .map(function (a) {
          return '<span class="pc-var">' + escapeHtml(a.trim()) + '</span>';
        })
        .join('<span class="pc-op">, </span>');

      return (
        indent +
        '<span class="pc-var">' +
        escapeHtml(leftVar) +
        '</span> <span class="pc-op">=</span> <span class="pc-call">' +
        escapeHtml(assignFn) +
        '</span><span class="pc-op">(</span>' +
        assignArgs +
        '<span class="pc-op">)</span>'
      );
    }

    // Simple call: fn(args)
    var simpleCallMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*\((.*?)\)$/);
    if (simpleCallMatch) {
      var sFn = simpleCallMatch[1];
      var sArgs = simpleCallMatch[2]
        .split(',')
        .filter(Boolean)
        .map(function (a) {
          return '<span class="pc-var">' + escapeHtml(a.trim()) + '</span>';
        })
        .join('<span class="pc-op">, </span>');

      return (
        indent +
        '<span class="pc-call">' +
        escapeHtml(sFn) +
        '</span><span class="pc-op">(</span>' +
        sArgs +
        '<span class="pc-op">)</span>'
      );
    }

    return indent + escapeHtml(trimmed);
  }

  /**
   * Builds the inner HTML for the pseudocode panel from service config.
   */
  function buildPseudocodePanelHtml(config) {
    var lines = config.code.split('\n');
    var lineNumbersHtml = lines
      .map(function (_, i) {
        return '<span class="pc-line-num">' + String(i + 1).padStart(2, '0') + '</span>';
      })
      .join('');
    var codeLinesHtml = lines
      .map(function (line) {
        return highlightLine(line);
      })
      .join('\n');

    return (
      '<div class="pseudocode-panel" role="region" aria-label="' +
      escapeHtml(config.title) +
      ' pseudocode">' +
      '<div class="pseudocode-header">' +
      '<div class="pseudocode-header-left">' +
      '<div class="pseudocode-terminal-dots" aria-hidden="true">' +
      '<span class="pseudocode-dot"></span>' +
      '<span class="pseudocode-dot"></span>' +
      '<span class="pseudocode-dot"></span>' +
      '</div>' +
      '<h3 class="pseudocode-title">' +
      escapeHtml(config.title) +
      '</h3>' +
      '</div>' +
      '<span class="pseudocode-badge">' +
      escapeHtml(config.badge || 'PSEUDOCODE') +
      '</span>' +
      '</div>' +
      '<div class="pseudocode-body">' +
      '<div class="pseudocode-lines" aria-hidden="true">' +
      lineNumbersHtml +
      '</div>' +
      '<pre class="pseudocode-code"><code>' +
      codeLinesHtml +
      '</code></pre>' +
      '</div>' +
      '<div class="pseudocode-caption">' +
      '<span class="pseudocode-caption-icon" aria-hidden="true">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="10"></circle>' +
      '<line x1="12" y1="16" x2="12" y2="12"></line>' +
      '<line x1="12" y1="8" x2="12.01" y2="8"></line>' +
      '</svg>' +
      '</span>' +
      '<p class="pseudocode-caption-text">' +
      escapeHtml(config.caption) +
      '</p>' +
      '</div>' +
      '</div>'
    );
  }

  /**
   * Reusable component renderer.
   */
  function renderPseudocodePanel(container, serviceKeyOrConfig) {
    if (!container) return;
    var config =
      typeof serviceKeyOrConfig === 'string'
        ? PSEUDOCODE_SERVICES[serviceKeyOrConfig]
        : serviceKeyOrConfig;

    if (!config) {
      console.warn('Pseudocode configuration not found for: ' + serviceKeyOrConfig);
      return;
    }

    container.innerHTML = buildPseudocodePanelHtml(config);
  }

  /**
   * Auto-initialize any containers with [data-pseudocode-service].
   */
  function initPseudocodePanels() {
    var containers = document.querySelectorAll('[data-pseudocode-service]');
    containers.forEach(function (container) {
      var serviceKey = container.getAttribute('data-pseudocode-service');
      if (serviceKey && PSEUDOCODE_SERVICES[serviceKey]) {
        renderPseudocodePanel(container, serviceKey);
      }
    });
  }

  // Export properties
  exports.PSEUDOCODE_SERVICES = PSEUDOCODE_SERVICES;
  exports.highlightLine = highlightLine;
  exports.buildPseudocodePanelHtml = buildPseudocodePanelHtml;
  exports.renderPseudocodePanel = renderPseudocodePanel;
  exports.initPseudocodePanels = initPseudocodePanels;

  // Direct global bindings
  if (typeof window !== 'undefined') {
    window.PSEUDOCODE_SERVICES = PSEUDOCODE_SERVICES;
    window.highlightLine = highlightLine;
    window.buildPseudocodePanelHtml = buildPseudocodePanelHtml;
    window.renderPseudocodePanel = renderPseudocodePanel;
    window.initPseudocodePanels = initPseudocodePanels;

    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPseudocodePanels);
      } else {
        initPseudocodePanels();
      }
    }
  }
});
