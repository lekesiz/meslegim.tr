# Meslegim.tr - Liste des Tâches

## Phase 1: Base de Données et Schéma
- [x] Mettre à jour `drizzle/schema.ts` avec toutes les tables nécessaires
- [x] Ajouter table `students` (extension de users avec champs spécifiques)
- [x] Ajouter table `stages` (étapes d'évaluation par groupe d'âge)
- [x] Ajouter table `questions` (questions liées aux étapes)
- [x] Ajouter table `answers` (réponses des étudiants)
- [x] Ajouter table `user_stages` (progression des étudiants dans les étapes)
- [x] Ajouter table `reports` (rapports générés)
- [x] Exécuter `pnpm db:push` pour appliquer les migrations

## Phase 2: Système d'Authentification et Autorisation
- [x] Mettre à jour le schéma users pour inclure les 3 rôles (student, mentor, admin)
- [ ] Ajouter champ `status` (pending, active, inactive) pour les étudiants
- [ ] Ajouter champ `mentor_id` pour l'attribution de mentor
- [ ] Ajouter champ `age_group` (14-17, 18-21, 22-24)
- [ ] Ajouter champs TC Kimlik, téléphone
- [x] Créer middleware d'autorisation par rôle dans `server/routers.ts`
- [ ] Créer `protectedProcedure` pour chaque rôle (studentProcedure, mentorProcedure, adminProcedure)
- [ ] Implémenter le formulaire d'inscription avec consentement KVKK

## Phase 3: Panneau Super Admin
- [x] Créer page `/dashboard/admin` avec DashboardLayout
- [ ] Implémenter liste de tous les utilisateurs avec filtres
- [ ] Créer interface d'attribution de mentors aux étudiants
- [ ] Créer interface CRUD pour les questions
- [ ] Créer interface CRUD pour les étapes
- [ ] Ajouter statistiques système (nombre d'utilisateurs, étapes complétées, etc.)
- [ ] Créer tRPC procedures: `admin.getUsers`, `admin.updateUser`, `admin.assignMentor`
- [ ] Créer tRPC procedures: `admin.getQuestions`, `admin.createQuestion`, `admin.updateQuestion`, `admin.deleteQuestion`
- [ ] Créer tRPC procedures: `admin.getStages`, `admin.createStage`, `admin.updateStage`, `admin.deleteStage`

## Phase 4: Panneau Mentor
- [x] Créer page `/dashboard/mentor` avec DashboardLayout
- [ ] Implémenter liste des inscriptions en attente (status: pending)
- [ ] Créer bouton d'activation des étudiants (pending → active)
- [ ] Implémenter liste des étudiants assignés avec progression
- [ ] Créer page de détails d'un étudiant (réponses, progression)
- [ ] Implémenter liste des rapports en attente d'approbation
- [ ] Créer interface d'approbation de rapports
- [ ] Créer formulaire d'ajout de nouvel étudiant
- [ ] Créer tRPC procedures: `mentor.getPendingStudents`, `mentor.activateStudent`
- [ ] Créer tRPC procedures: `mentor.getMyStudents`, `mentor.getStudentDetails`
- [ ] Créer tRPC procedures: `mentor.getPendingReports`, `mentor.approveReport`
- [ ] Créer tRPC procedures: `mentor.addStudent`

## Phase 5: Tableau de Bord Étudiant
- [x] Créer page `/dashboard/student` avec DashboardLayout
- [ ] Implémenter indicateur de progression des étapes (progress bar)
- [ ] Créer page de formulaire de l'étape active
- [ ] Implémenter différents types de questions (choix multiples, Likert, classement)
- [ ] Créer système de sauvegarde des réponses
- [ ] Implémenter validation et soumission de l'étape
- [ ] Créer page de visualisation des rapports terminés
- [ ] Créer page de gestion du profil
- [ ] Créer tRPC procedures: `student.getMyProgress`, `student.getActiveStage`
- [ ] Créer tRPC procedures: `student.saveAnswers`, `student.submitStage`
- [ ] Créer tRPC procedures: `student.getMyReports`

## Phase 6: Système d'Activation Automatique des Étapes
- [ ] Créer fonction cron pour vérifier les étapes à activer
- [ ] Implémenter logique: activer prochaine étape 7 jours après complétion de la précédente
- [ ] Mettre à jour `user_stages.status` (locked → active) automatiquement
- [ ] Enregistrer `user_stages.unlocked_at` lors de l'activation
- [ ] Créer tRPC procedure: `system.checkAndActivateStages` (appelée par cron)

## Phase 7: Intégration Manus AI pour Rapports
- [ ] Créer helper `/server/lib/manus-report.ts` pour appeler Manus API
- [ ] Implémenter fonction de génération de rapport intermédiaire (après chaque étape)
- [ ] Implémenter fonction de génération de rapport final (après toutes les étapes)
- [ ] Formater les réponses de l'étudiant pour Manus API
- [ ] Sauvegarder le PDF généré dans Vercel Blob Storage
- [ ] Enregistrer l'URL du rapport dans la table `reports`
- [ ] Mettre `reports.status` à 'pending_approval' après génération
- [ ] Créer tRPC procedures: `system.generateStageReport`, `system.generateFinalReport`

## Phase 8: Système de Notifications par E-mail
- [ ] Configurer Resend API avec la clé fournie
- [ ] Créer helper `/server/lib/email.ts` pour envoyer des e-mails
- [ ] Implémenter notification: nouvelle étape activée
- [ ] Implémenter notification: rapport prêt
- [ ] Créer templates d'e-mails en turc
- [ ] Créer tRPC procedures: `system.sendStageActivationEmail`, `system.sendReportReadyEmail`

## Phase 9: Banque de Questions Initiale
- [ ] Créer script de seed pour les questions du groupe 14-17 ans (Etap 1, 2, 3)
- [ ] Créer script de seed pour les questions du groupe 18-21 ans (Etap 1, 2, 3)
- [ ] Créer script de seed pour les questions du groupe 22-24 ans (Etap 1, 2, 3)
- [ ] Exécuter les scripts de seed

## Phase 10: UI/UX et Design
- [ ] Choisir palette de couleurs et thème (light/dark)
- [ ] Mettre à jour `client/src/index.css` avec les couleurs
- [ ] Créer composants réutilisables (StageCard, ProgressIndicator, QuestionForm)
- [ ] Implémenter design responsive (mobile, tablet, desktop)
- [ ] Ajouter loading states et skeletons
- [ ] Implémenter gestion des erreurs avec toast notifications

## Phase 11: Tests et Validation
- [ ] Tester le flux complet d'inscription étudiant
- [ ] Tester l'approbation par mentor
- [ ] Tester la complétion d'une étape
- [ ] Tester l'activation automatique après 7 jours
- [ ] Tester la génération de rapports
- [ ] Tester l'approbation de rapports par mentor
- [ ] Tester le panneau admin
- [ ] Vérifier la conformité KVKK

## Phase 12: Déploiement
- [ ] Créer premier checkpoint
- [ ] Configurer variables d'environnement sur Vercel
- [ ] Déployer sur Vercel
- [ ] Configurer le domaine meslegim.tr
- [ ] Vérifier le SSL
- [ ] Tester en production

## Notes Importantes
- **Statuts étudiants:** `pending` (en attente d'approbation), `active` (approuvé), `inactive` (désactivé)
- **Statuts étapes:** `locked` (verrouillée), `active` (en cours), `completed` (terminée)
- **Statuts rapports:** `pending_approval` (en attente d'approbation mentor), `approved` (approuvé)
- **Délai activation:** Exactement 7 jours (604800000 ms) après complétion de l'étape précédente
- **Groupes d'âge:** `14-17`, `18-21`, `22-24` (enum strict)
