import { CHECKLIST, type ChecklistStatus } from '../shared/checklist';
import { audienceOf, ruleText, ruleTitle } from '../shared/rule-texts';
import { compareRules, summarize } from '../shared/summary';
import type { Locale, RuleResult, ScanResult, Target } from '../shared/types';
import { criteriaOf, enClause, getCriterion } from '../shared/wcag';
import { translate } from './i18n';
import { AUTHOR_NAME, AUTHOR_URL } from '../shared/meta';
import { logoSvg } from '../shared/brand';
import { rate } from '../shared/perf-thresholds';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

export function targetToString(target: Target): string {
  return target.map((part) => (Array.isArray(part) ? part.join(' >>> ') : part)).join(' | ');
}

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv(result: ScanResult, locale: Locale): string {
  const header = ['outcome', 'impact', 'rule', 'title', 'wcag', 'en301549', 'selector', 'html', 'in_viewport'];
  const rows: Array<Array<string | number>> = [header];
  const rules = result.rules.filter((rule) => rule.outcome !== 'pass').sort(compareRules);
  for (const rule of rules) {
    const criteria = criteriaOf(rule.tags);
    const base = [
      rule.outcome,
      rule.impact ?? '',
      rule.id,
      ruleTitle(rule, locale),
      criteria.join(' '),
      criteria.map(enClause).join(' '),
    ];
    if (rule.nodes.length === 0) rows.push([...base, '', '', '']);
    for (const node of rule.nodes) {
      rows.push([...base, targetToString(node.target), node.html, node.inViewport === null ? '' : String(node.inViewport)]);
    }
  }
  // BOM so that Excel detects UTF-8 (umlauts).
  return `﻿${rows.map((row) => row.map(csvCell).join(';')).join('\r\n')}`;
}

export function buildJson(result: ScanResult, checklist: Record<string, ChecklistStatus>): string {
  return JSON.stringify({ generator: 'BFSG Check', ...result, checklist }, null, 2);
}

function ruleSection(rules: RuleResult[], locale: Locale, t: (key: string, params?: Record<string, string | number>) => string): string {
  return rules
    .map((rule) => {
      const text = ruleText(rule, locale);
      const criteria = criteriaOf(rule.tags)
        .map((id) => {
          const sc = getCriterion(id);
          return sc ? `${id} ${escapeHtml(sc.name[locale])} (${sc.level}) · EN ${enClause(id)}` : id;
        })
        .join('<br>');
      const nodes = rule.nodes
        .map(
          (node) =>
            `<li><code>${escapeHtml(targetToString(node.target))}</code><pre>${escapeHtml(node.html)}</pre>${
              node.summary ? `<p class="summary">${escapeHtml(node.summary)}</p>` : ''
            }</li>`,
        )
        .join('');
      const more = rule.nodeCount > rule.nodes.length ? `<p>${escapeHtml(t('detailed.moreNodes', { count: rule.nodeCount - rule.nodes.length }))}</p>` : '';
      return `<article class="rule">
  <h3>${escapeHtml(ruleTitle(rule, locale))} ${rule.impact ? `<span class="impact ${rule.impact}">${escapeHtml(t(`impact.${rule.impact}`))}</span>` : ''}</h3>
  <p class="meta">${escapeHtml(t('detailed.rule'))}: <code>${escapeHtml(rule.id)}</code> · ${escapeHtml(t(`audience.${audienceOf(rule)}`))}${criteria ? `<br>${criteria}` : ''}</p>
  ${text.why ? `<p><strong>${escapeHtml(t('simple.why'))}</strong> ${escapeHtml(text.why)}</p>` : ''}
  ${text.fix ? `<p><strong>${escapeHtml(t('simple.fix'))}:</strong> ${escapeHtml(text.fix)}</p>` : ''}
  ${nodes ? `<ol class="nodes">${nodes}</ol>${more}` : ''}
</article>`;
    })
    .join('\n');
}

export function buildHtmlReport(result: ScanResult, checklist: Record<string, ChecklistStatus>, locale: Locale): string {
  const t = (key: string, params?: Record<string, string | number>) => translate(locale, key, params);
  const summary = summarize(result.rules);
  const date = new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', { dateStyle: 'long', timeStyle: 'short' }).format(result.scannedAt);
  const violations = result.rules.filter((rule) => rule.outcome === 'violation').sort(compareRules);
  const review = result.rules.filter((rule) => rule.outcome === 'review').sort(compareRules);
  const m = result.perf.metrics;
  const metric = (key: keyof typeof m, label: string, format: (v: number) => string) => {
    const value = m[key];
    const rating = rate(key, value);
    return `<tr><th scope="row">${escapeHtml(label)}</th><td>${value === null ? escapeHtml(t('perf.notAvailable')) : escapeHtml(format(value))}</td><td>${rating ? escapeHtml(t(`perf.${rating}`)) : ''}</td></tr>`;
  };
  const ms = (v: number) => `${Math.round(v)} ms`;
  const checklistRows = CHECKLIST.map(
    (item) =>
      `<tr><td>${escapeHtml(item.text[locale].title)}</td><td>${escapeHtml(item.criteria.join(', '))}</td><td>${escapeHtml(t(`checklist.${checklist[item.id] ?? 'open'}`))}</td></tr>`,
  ).join('');

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(t('export.reportTitle'))} – ${escapeHtml(result.title || result.url)}</title>
<style>
  :root { --brand: #0036ff; --navy: #0f1426; --text: #171d2e; --muted: #535c73; --border: #e1e5ee; --soft: #f5f7fc; }
  body { font: 15px/1.6 'Inter Variable', Inter, system-ui, -apple-system, 'Segoe UI', sans-serif; color: var(--text); margin: 0; background: #fff; }
  .wrap { max-width: 960px; margin: 0 auto; padding: 0 24px 40px; }
  .hero { position: relative; overflow: hidden; background: var(--navy); color: #e6eaf4; padding: 28px 0 32px; margin-bottom: 28px;
    background-image: radial-gradient(40rem 20rem at 100% 0%, rgba(0, 54, 255, .38), transparent 70%), radial-gradient(30rem 16rem at 0% 120%, rgba(0, 54, 255, .25), transparent 70%); }
  .hero .wrap { padding-bottom: 0; }
  .hero a { color: #fff; }
  .hero .meta { color: #b9c1d6; }
  h1, h2, h3 { font-family: 'Outfit Variable', Outfit, system-ui, sans-serif; font-weight: 600; letter-spacing: -.01em; line-height: 1.25; }
  h1 { font-size: 32px; margin: 22px 0 6px; color: #fff; } h2 { font-size: 22px; margin-top: 40px; padding-bottom: 8px; border-bottom: 1px solid var(--border); } h3 { font-size: 17px; margin: 0 0 6px; }
  .meta { color: var(--muted); font-size: 13px; } code { font: 12.5px 'JetBrains Mono', ui-monospace, monospace; background: var(--soft); padding: 1px 5px; border-radius: 4px; word-break: break-all; }
  pre { white-space: pre-wrap; word-break: break-all; background: var(--soft); border: 1px solid var(--border); padding: 8px 10px; border-radius: 6px; font: 12px 'JetBrains Mono', ui-monospace, monospace; }
  .rule { border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; margin: 14px 0; break-inside: avoid; }
  .impact { font-size: 12px; font-weight: 600; padding: 2px 9px; border-radius: 99px; vertical-align: middle; }
  .critical { color: #a5143c; background: #fbe9ee; } .serious { color: #a8341a; background: #fbede7; } .moderate { color: #865006; background: #fdf3df; } .minor { color: #4f586d; background: #eef0f5; }
  .light { display: inline-block; padding: 6px 14px; border-radius: 99px; font-weight: 600; color: #fff; }
  .light.red { background: #b42318; } .light.yellow { background: #8f4a04; } .light.green { background: #067647; }
  table { border-collapse: collapse; width: 100%; } th, td { text-align: left; padding: 8px; border-bottom: 1px solid var(--border); vertical-align: top; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin: 18px 0; }
  .stats div { background: var(--soft); border-radius: 10px; padding: 12px 14px; font-size: 13px; color: var(--muted); }
  .stats strong { display: block; font: 600 28px/1.2 'Outfit Variable', Outfit, system-ui, sans-serif; color: var(--text); }
  .disclaimer { background: #fff7e6; border: 1px solid #f2d39b; padding: 12px 14px; border-radius: 8px; }
  .summary { color: var(--muted); font-size: 13px; white-space: pre-line; }
  .credit { margin-top: 56px; padding: 20px 22px; border-radius: 12px; background: var(--navy); color: #c9d0e2; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; }
  .credit a { color: #fff; font-weight: 600; }
  @media print { .hero, .credit { -webkit-print-color-adjust: exact; print-color-adjust: exact; } a { color: inherit; } }
</style>
</head>
<body>
<header class="hero"><div class="wrap">
  <a href="${AUTHOR_URL}" aria-label="BlueBranch">${logoSvg('#ffffff', '#5276ff', 22)}</a>
  <h1>${escapeHtml(t('export.reportTitle'))}</h1>
  <p class="meta">${escapeHtml(t('export.generated', { date }))}<br>
  ${escapeHtml(t('export.url'))}: <a href="${escapeHtml(result.url)}">${escapeHtml(result.url)}</a><br>
  ${escapeHtml(t('export.standard'))}: ${escapeHtml(t(`settings.${result.options.standard}`))} · ${escapeHtml(t('scan.engine', { engine: result.engine.name, version: result.engine.version }))}</p>
</div></header>
<main class="wrap">
<p><span class="light ${summary.light}">${escapeHtml(t(`summary.${summary.light}`))}</span></p>
<p>${escapeHtml(t(`summary.${summary.light}Text`))}</p>
<div class="stats">
  <div><strong>${summary.violations}</strong>${escapeHtml(t('summary.violations'))}</div>
  <div><strong>${summary.affectedNodes}</strong>${escapeHtml(t('summary.affected'))}</div>
  <div><strong>${summary.review}</strong>${escapeHtml(t('summary.review'))}</div>
  <div><strong>${summary.recommendations}</strong>${escapeHtml(t('summary.recommendations'))}</div>
  <div><strong>${summary.passes}</strong>${escapeHtml(t('summary.passes'))}</div>
</div>
<p class="disclaimer">${escapeHtml(t('summary.disclaimer'))}</p>

<h2>${escapeHtml(t('detailed.violations'))} (${violations.length})</h2>
${ruleSection(violations, locale, t) || `<p>${escapeHtml(t('simple.noIssues'))}</p>`}

<h2>${escapeHtml(t('detailed.review'))} (${review.length})</h2>
${ruleSection(review, locale, t)}

<h2>${escapeHtml(t('tabs.checklist'))}</h2>
<table><thead><tr><th scope="col">${escapeHtml(t('tabs.checklist'))}</th><th scope="col">WCAG</th><th scope="col">Status</th></tr></thead><tbody>${checklistRows}</tbody></table>

<h2>${escapeHtml(t('tabs.performance'))}</h2>
<p class="meta">${escapeHtml(t('perf.intro'))}</p>
<table><tbody>
${metric('lcp', t('perf.lcp'), ms)}
${metric('cls', t('perf.cls'), (v) => v.toFixed(3))}
${metric('inp', t('perf.inp'), ms)}
${metric('ttfb', t('perf.ttfb'), ms)}
${metric('fcp', t('perf.fcp'), ms)}
${metric('blockingTime', t('perf.blockingTime'), ms)}
${metric('load', t('perf.load'), ms)}
</tbody></table>
${result.perf.hints.length ? `<ul>${result.perf.hints.map((hint) => `<li><strong>${escapeHtml(t(`hints.${hint.id}.title`, { count: result.perf.domSize }))}</strong> – ${escapeHtml(t(`hints.${hint.id}.text`))}</li>`).join('')}</ul>` : ''}
<footer class="credit">${logoSvg('#ffffff', '#5276ff', 16)}<span>${escapeHtml(t('export.credit'))} <a href="${AUTHOR_URL}">${AUTHOR_NAME}</a></span></footer>
</main>
</body>
</html>`;
}

export function download(filename: string, content: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function reportBaseName(result: ScanResult): string {
  let host = 'page';
  try {
    host = new URL(result.url).hostname.replace(/^www\./, '');
  } catch {
    /* keep default */
  }
  const date = new Date(result.scannedAt).toISOString().slice(0, 10);
  return `bfsg-check_${host}_${date}`;
}
