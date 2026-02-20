#!/usr/bin/env node

/**
 * Vérification de toutes les pages pour identifier celles qui ont des erreurs
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('='.repeat(80));
console.log('VÉRIFICATION DES PAGES - RECHERCHE D\'ERREURS');
console.log('='.repeat(80));

// Liste des pages à vérifier
const pages = [
  'SiteManagement',
  'SeaweedTypeManagement',
  'FarmerManagement',
  'EmployeeManagement',
  'ServiceProviders',
  'ModuleTracking',
  'CultivationCycle',
  'FarmerDeliveries',
  'FarmerCredits',
  'CuttingOperations',
  'Exports',
  'IncidentManagement',
  'PeriodicTests',
  'StockManagement',
  'Reports'
];

let errors = [];

for (const page of pages) {
  try {
    console.log(`\n→ Vérification ${page}...`);
    const filePath = `pages/${page}.tsx`;
    
    // Lire le fichier
    const content = readFileSync(filePath, 'utf8');
    
    // Vérifier des patterns d'erreurs courantes
    const checks = [
      { pattern: /\.map\([^)]*\)/, name: 'map without guard', check: (line) => !line.includes('?.map') && !line.includes('|| []') },
      { pattern: /\.find\([^)]*\)/, name: 'find without guard', check: (line) => !line.includes('?.find') },
      { pattern: /\.filter\([^)]*\)/, name: 'filter without guard', check: (line) => !line.includes('?.filter') && !line.includes('|| []') },
      { pattern: /\[\w+\]/, name: 'array access', check: (line) => line.includes('[') && !line.includes('?.[') }
    ];
    
    const lines = content.split('\n');
    let pageErrors = [];
    
    lines.forEach((line, index) => {
      checks.forEach(check => {
        if (check.pattern.test(line) && check.check && check.check(line)) {
          // Ignorer les commentaires et imports
          if (!line.trim().startsWith('//') && !line.trim().startsWith('import') && !line.trim().startsWith('*')) {
            const trimmed = line.trim();
            if (trimmed.length > 10 && trimmed.includes('.')) {
              pageErrors.push({
                line: index + 1,
                issue: check.name,
                code: trimmed.substring(0, 80)
              });
            }
          }
        }
      });
    });
    
    if (pageErrors.length > 0) {
      console.log(`  ⚠️ ${pageErrors.length} problèmes potentiels trouvés`);
      errors.push({ page, errors: pageErrors });
    } else {
      console.log(`  ✓ Aucun problème détecté`);
    }
    
  } catch (error) {
    console.log(`  ✗ Erreur lors de la lecture: ${error.message}`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('RÉSUMÉ');
console.log('='.repeat(80));
console.log(`Pages vérifiées: ${pages.length}`);
console.log(`Pages avec problèmes: ${errors.length}`);

if (errors.length > 0) {
  console.log('\nPAGES NÉCESSITANT ATTENTION:');
  errors.forEach(({ page, errors: pageErrors }) => {
    console.log(`\n${page}: ${pageErrors.length} problème(s)`);
    pageErrors.slice(0, 3).forEach(err => {
      console.log(`  Ligne ${err.line}: ${err.issue}`);
      console.log(`    ${err.code}`);
    });
    if (pageErrors.length > 3) {
      console.log(`  ... et ${pageErrors.length - 3} autre(s)`);
    }
  });
}

process.exit(0);
