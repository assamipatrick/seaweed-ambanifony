#!/bin/bash

# Script pour corriger automatiquement les pages avec des protections

echo "Correction automatique des pages..."

# FarmerManagement - ligne 40
sed -i '40s/sites\.map/\(sites || []\)\.map/' pages/FarmerManagement.tsx
sed -i '44s/farmers\.filter/\(farmers || []\)\.filter/' pages/FarmerManagement.tsx

# EmployeeManagement - ligne 139
sed -i '139s/roles\.map/\(roles || []\)\.map/' pages/EmployeeManagement.tsx

# FarmerCredits - lignes 82, 86
sed -i '82s/creditTypes\.map/\(creditTypes || []\)\.map/' pages/FarmerCredits.tsx
sed -i '86s/farmerCredits\.filter/\(farmerCredits || []\)\.filter/' pages/FarmerCredits.tsx

# CuttingOperations - lignes 27, 28
sed -i '27s/sites\.map/\(sites || []\)\.map/' pages/CuttingOperations.tsx
sed -i '28s/serviceProviders\.map/\(serviceProviders || []\)\.map/' pages/CuttingOperations.tsx

# Exports - ligne 34
sed -i '34s/seaweedTypes\.map/\(seaweedTypes || []\)\.map/' pages/Exports.tsx

# Reports - ligne 45
sed -i '45s/\[\.\.\.farmers\]/\[\.\.\.\(farmers || []\)\]/' pages/Reports.tsx

echo "✓ Corrections appliquées"
