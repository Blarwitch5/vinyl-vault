// Utilitaires pour la gestion des avatars

export function getAvatarUrl(avatar: string | null | undefined): string {
  return avatar || "/default-avatar.svg";
}

export function getGradientForColor(color: string): string {
  const gradients: { [key: string]: string } = {
    blue: "linear-gradient(135deg, #60a5fa, #2563eb)",
    emerald: "linear-gradient(135deg, #6ee7b7, #059669)",
    purple: "linear-gradient(135deg, #c084fc, #9333ea)",
    red: "linear-gradient(135deg, #f87171, #dc2626)",
    orange: "linear-gradient(135deg, #fb923c, #ea580c)",
    pink: "linear-gradient(135deg, #f472b6, #ec4899)",
    indigo: "linear-gradient(135deg, #818cf8, #4f46e5)",
  };
  return gradients[color] || gradients.blue;
}

export function isColorAvatar(avatar: string): boolean {
  return !avatar.startsWith("/");
}

export function generateAvatarElement(
  avatar: string,
  size: "sm" | "md" | "lg" = "md"
): string {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const avatarUrl = getAvatarUrl(avatar);

  if (isColorAvatar(avatarUrl)) {
    // Avatar coloré (gradient)
    const gradient = getGradientForColor(avatarUrl);
    return `<div class="${sizeClasses[size]} rounded-xl border-2 border-white/20" style="background: ${gradient}"></div>`;
  } else {
    // Avatar par défaut (image)
    return `<img src="${avatarUrl}" alt="Avatar" class="${sizeClasses[size]} rounded-xl border-2 border-white/20 object-cover" />`;
  }
}
