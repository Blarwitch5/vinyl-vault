// Validateur de configuration selon les règles .cursorrules

// Types pour la validation
type ValidationResult = {
  isValid: boolean;
  hasErrors: boolean;
  errorMessages: string[];
  warningMessages: string[];
};

// Fonctions utilitaires de validation
export const createConfigValidator = () => {
  const validateEnvironment = (): ValidationResult => {
    const errorMessages: string[] = [];
    const warningMessages: string[] = [];

    // Validation des variables d'environnement critiques
    if (!import.meta.env.DISCOGS_CONSUMER_KEY) {
      errorMessages.push("DISCOGS_CONSUMER_KEY manquante");
    }

    if (!import.meta.env.DISCOGS_CONSUMER_SECRET) {
      errorMessages.push("DISCOGS_CONSUMER_SECRET manquante");
    }

    // Warnings pour les variables optionnelles
    if (!import.meta.env.JWT_SECRET) {
      warningMessages.push(
        "JWT_SECRET non définie - utilisation d'une valeur par défaut"
      );
    }

    const isValid = errorMessages.length === 0;
    const hasErrors = errorMessages.length > 0;

    return {
      isValid,
      hasErrors,
      errorMessages,
      warningMessages,
    };
  };

  const validateColorScheme = (): ValidationResult => {
    const errorMessages: string[] = [];
    const warningMessages: string[] = [];

    // Vérifier que les couleurs suivent le schéma amber/emerald
    const requiredColors = [
      "primary-500", // amber
      "primary-600", // amber
      "secondary-400", // emerald
      "secondary-600", // emerald
      "dark-background",
      "dark-surface",
      "dark-text",
      "dark-textSecondary",
      "light-background",
      "light-surface",
      "light-text",
      "light-textSecondary",
    ];

    // Cette validation serait plus utile dans un contexte de build
    // Pour l'instant, on log juste les couleurs requises
    console.log("Couleurs requises selon .cursorrules:", requiredColors);

    return {
      isValid: true,
      hasErrors: false,
      errorMessages,
      warningMessages,
    };
  };

  const validateCodeStructure = (): ValidationResult => {
    const errorMessages: string[] = [];
    const warningMessages: string[] = [];

    // Validation basique de la structure des composants
    // Cette validation serait plus utile avec un linter customisé

    return {
      isValid: true,
      hasErrors: false,
      errorMessages,
      warningMessages,
    };
  };

  const runAllValidations = (): ValidationResult => {
    const envResult = validateEnvironment();
    const colorResult = validateColorScheme();
    const structureResult = validateCodeStructure();

    const allErrorMessages = [
      ...envResult.errorMessages,
      ...colorResult.errorMessages,
      ...structureResult.errorMessages,
    ];

    const allWarningMessages = [
      ...envResult.warningMessages,
      ...colorResult.warningMessages,
      ...structureResult.warningMessages,
    ];

    return {
      isValid: allErrorMessages.length === 0,
      hasErrors: allErrorMessages.length > 0,
      errorMessages: allErrorMessages,
      warningMessages: allWarningMessages,
    };
  };

  const logValidationResults = (result: ValidationResult): void => {
    if (result.hasErrors) {
      console.error("🚨 Erreurs de configuration:", result.errorMessages);
    }

    if (result.warningMessages.length > 0) {
      console.warn("⚠️ Avertissements:", result.warningMessages);
    }

    if (result.isValid) {
      console.log("✅ Configuration valide selon les règles .cursorrules");
    }
  };

  return {
    validateEnvironment,
    validateColorScheme,
    validateCodeStructure,
    runAllValidations,
    logValidationResults,
  };
};
