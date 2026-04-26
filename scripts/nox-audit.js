#!/usr/bin/env node
/**
 * NOX — Until Zero Errors (UzE)
 * Script de verificacao continua que so PARA quando nao houver erros
 * 
 * Uso: node scripts/nox-audit.js [--max-attempts N] [--delay MS]
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const MAX_ATTEMPTS = parseInt(process.argv.find(a => a.startsWith('--max-attempts'))?.split('=')[1] || '10');
const DELAY_MS = parseInt(process.argv.find(a => a.startsWith('--delay'))?.split('=')[1] || '1000');

function log(msg, color = 'white') {
  const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
  };
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function testTypeScript() {
  try {
    execSync('npm run lint', { cwd: ROOT, stdio: 'pipe' });
    log('[TS]   ✅ TypeScript OK', 'green');
    return true;
  } catch (e) {
    const output = e.stdout?.toString() || e.stderr?.toString() || '';
    const errors = output.match(/error TS\d+/g) || [];
    if (errors.length > 0) {
      log(`[TS]   ❌ ${errors.length} erros TypeScript`, 'red');
      output.split('\n').filter(l => l.includes('error TS')).forEach(l => log(`     ${l.trim()}`, 'red'));
    } else {
      log('[TS]   ❌ Erro desconhecido', 'red');
    }
    return false;
  }
}

function testBuild() {
  try {
    execSync('npm run build', { cwd: ROOT, stdio: 'pipe' });
    log('[BUILD] ✅ Build OK', 'green');
    return true;
  } catch (e) {
    log('[BUILD] ❌ Build falhou', 'red');
    return false;
  }
}

function testDist() {
  const distExists = existsSync(join(ROOT, 'dist', 'index.html'));
  if (!distExists) {
    log('[DIST]  ❌ Pasta dist nao existe', 'red');
    return false;
  }
  log('[DIST]  ✅ Dist OK', 'green');
  return true;
}

function runAudit(attempt) {
  console.log('');
  log('═══════════════════════════════════════════════', 'cyan');
  log(`  NOX — UZE Audit attempt ${attempt}/${MAX_ATTEMPTS}`, 'cyan');
  log('═══════════════════════════════════════════════', 'cyan');
  console.log('');
  
  const ts = testTypeScript();
  const build = testBuild();
  const dist = testDist();
  
  return ts && build && dist;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const start = Date.now();
  
  console.log('');
  log('═══════════════════════════════════════════════', 'cyan');
  log('  NOX — UNTIL ZERO ERRORS (UzE)', 'cyan');
  log('  Script de verificacao continua', 'gray');
  log('═══════════════════════════════════════════════', 'cyan');
  console.log('');
  
  let attempt = 1;
  
  while (attempt <= MAX_ATTEMPTS) {
    const passed = runAudit(attempt);
    
    if (passed) {
      const duration = ((Date.now() - start) / 1000).toFixed(1);
      console.log('');
      log('═══════════════════════════════════════════════', 'green');
      log('  ✅ ZERO ERROS — PRONTO PARA PRODUCAO', 'green');
      log('═══════════════════════════════════════════════', 'green');
      console.log('');
      log(`  Tentativas: ${attempt}`, 'gray');
      log(`  Tempo: ${duration}s`, 'gray');
      console.log('');
      process.exit(0);
    }
    
    if (attempt < MAX_ATTEMPTS) {
      log(`[WAIT] A esperar... ${DELAY_MS}ms`, 'yellow');
      await sleep(DELAY_MS);
    }
    attempt++;
  }
  
  console.log('');
  log('═══════════════════════════════════════════════', 'red');
  log(`  ❌ MAX ATTEMPTS EXCEDIDOS (${MAX_ATTEMPTS})`, 'red');
  log('═══════════════════════════════════════════════', 'red');
  console.log('');
  
  process.exit(1);
}

main();