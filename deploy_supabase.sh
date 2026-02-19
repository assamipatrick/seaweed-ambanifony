#!/bin/bash

# ============================================
# Script de Déploiement Supabase
# Exécute tous les scripts SQL dans le bon ordre
# ============================================

echo "🚀 Démarrage du déploiement Supabase..."
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SUPABASE_URL="https://kxujxjcuyfbvmzahyzcv.supabase.co"
DB_DIR="./database"

# Vérifier que le dossier database existe
if [ ! -d "$DB_DIR" ]; then
    echo -e "${RED}❌ Erreur: Le dossier 'database' n'existe pas!${NC}"
    exit 1
fi

# Fonction pour afficher les instructions
show_instructions() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${YELLOW}📋 Instructions de Déploiement Manuel${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
    echo "Pour déployer la base de données, suivez ces étapes :"
    echo ""
    echo "1. Ouvrez votre projet Supabase :"
    echo -e "   ${GREEN}${SUPABASE_URL}${NC}"
    echo ""
    echo "2. Allez dans ${YELLOW}SQL Editor${NC} (menu de gauche)"
    echo ""
    echo "3. Exécutez les scripts dans l'ordre suivant :"
    echo ""
    echo -e "   ${BLUE}Étape 1:${NC} ${DB_DIR}/schema.sql"
    echo "   📝 Crée toutes les tables, index, et structures"
    echo ""
    echo -e "   ${BLUE}Étape 2:${NC} ${DB_DIR}/seed_data.sql"
    echo "   📝 Insère les données initiales (rôles, types, admin)"
    echo ""
    echo -e "   ${BLUE}Étape 3:${NC} ${DB_DIR}/functions_triggers.sql"
    echo "   📝 Crée les fonctions et triggers pour l'automation"
    echo ""
    echo -e "   ${BLUE}Étape 4:${NC} ${DB_DIR}/rls_policies.sql"
    echo "   📝 Configure les politiques de sécurité RLS"
    echo ""
    echo -e "   ${BLUE}Étape 5:${NC} ${DB_DIR}/realtime_config.sql"
    echo "   📝 Active les fonctionnalités Real-Time"
    echo ""
    echo "4. Activez la réplication Real-Time :"
    echo "   - Allez dans ${YELLOW}Database → Replication${NC}"
    echo "   - Activez pour les tables suivantes :"
    echo "     • modules"
    echo "     • cultivation_cycles"
    echo "     • stock_movements"
    echo "     • farmer_deliveries"
    echo "     • site_transfers"
    echo "     • incidents"
    echo "     • farmers"
    echo "     • employees"
    echo "     • periodic_tests"
    echo "     • gallery_photos"
    echo ""
    echo "5. Testez la connexion en exécutant :"
    echo -e "   ${GREEN}SELECT COUNT(*) FROM sites;${NC}"
    echo ""
    echo -e "${GREEN}✅ Une fois terminé, votre base de données sera prête !${NC}"
    echo ""
}

# Fonction pour copier le contenu d'un fichier
show_file_content() {
    local file=$1
    local step=$2
    
    echo -e "${BLUE}================================================${NC}"
    echo -e "${YELLOW}📄 Étape ${step}: $(basename $file)${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
    
    if [ -f "$file" ]; then
        local size=$(du -h "$file" | cut -f1)
        echo -e "Taille du fichier: ${GREEN}${size}${NC}"
        echo ""
        echo "Copiez et collez le contenu de ce fichier dans SQL Editor:"
        echo -e "${GREEN}${file}${NC}"
        echo ""
        read -p "Appuyez sur Entrée pour continuer vers l'étape suivante..."
        echo ""
    else
        echo -e "${RED}❌ Erreur: Fichier non trouvé: $file${NC}"
        exit 1
    fi
}

# Fonction pour vérifier les fichiers
check_files() {
    echo -e "${BLUE}🔍 Vérification des fichiers...${NC}"
    echo ""
    
    local files=(
        "schema.sql"
        "seed_data.sql"
        "functions_triggers.sql"
        "rls_policies.sql"
        "realtime_config.sql"
    )
    
    local all_ok=true
    
    for file in "${files[@]}"; do
        if [ -f "$DB_DIR/$file" ]; then
            local size=$(du -h "$DB_DIR/$file" | cut -f1)
            echo -e "   ✅ ${file} ${GREEN}(${size})${NC}"
        else
            echo -e "   ❌ ${file} ${RED}(manquant)${NC}"
            all_ok=false
        fi
    done
    
    echo ""
    
    if [ "$all_ok" = true ]; then
        echo -e "${GREEN}✅ Tous les fichiers sont présents !${NC}"
        echo ""
    else
        echo -e "${RED}❌ Certains fichiers sont manquants. Vérifiez le dossier database/.${NC}"
        exit 1
    fi
}

# Menu principal
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ${YELLOW}Déploiement Base de Données Supabase${BLUE}  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier les fichiers
check_files

# Afficher les instructions
show_instructions

# Guide interactif
echo -e "${YELLOW}📚 Voulez-vous voir le guide détaillé pour chaque étape ?${NC}"
echo ""
echo "1) Oui - Guide pas à pas"
echo "2) Non - J'ai déjà lu les instructions"
echo ""
read -p "Votre choix (1 ou 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo -e "${GREEN}Parfait ! Suivez les étapes ci-dessous.${NC}"
    echo ""
    
    # Étape 1
    show_file_content "$DB_DIR/schema.sql" "1"
    
    # Étape 2
    show_file_content "$DB_DIR/seed_data.sql" "2"
    
    # Étape 3
    show_file_content "$DB_DIR/functions_triggers.sql" "3"
    
    # Étape 4
    show_file_content "$DB_DIR/rls_policies.sql" "4"
    
    # Étape 5
    show_file_content "$DB_DIR/realtime_config.sql" "5"
    
    echo -e "${GREEN}✅ Toutes les étapes sont complétées !${NC}"
    echo ""
    echo -e "${YELLOW}N'oubliez pas d'activer la réplication Real-Time !${NC}"
    echo ""
fi

echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✅ Informations de Connexion${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "URL Supabase: ${SUPABASE_URL}"
echo "Dashboard: ${SUPABASE_URL}/project/_/editor"
echo ""
echo "Utilisateur Admin par défaut:"
echo "  Email: admin@seafarm.com"
echo "  Password: password"
echo ""
echo -e "${RED}⚠️  IMPORTANT: Changez le mot de passe admin après la première connexion !${NC}"
echo ""
echo -e "${GREEN}📖 Documentation complète: database/DEPLOYMENT_GUIDE.md${NC}"
echo ""
echo -e "${BLUE}🎉 Bon déploiement !${NC}"
