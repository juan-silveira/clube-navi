/**
 * Helper para gerenciar breadcrumbs de navegação
 * Mantém o histórico completo da navegação para poder voltar corretamente
 */

export interface BreadcrumbItem {
  path: string;
  params?: Record<string, any>;
}

/**
 * Serializa um array de breadcrumbs para string (para passar via params)
 */
export function serializeBreadcrumb(breadcrumbs: BreadcrumbItem[]): string {
  return JSON.stringify(breadcrumbs);
}

/**
 * Desserializa uma string de breadcrumb para array
 */
export function deserializeBreadcrumb(breadcrumbString: string | undefined): BreadcrumbItem[] {
  if (!breadcrumbString) return [];
  try {
    return JSON.parse(breadcrumbString);
  } catch {
    return [];
  }
}

/**
 * Adiciona uma nova página ao breadcrumb
 */
export function addToBreadcrumb(
  currentBreadcrumb: BreadcrumbItem[],
  currentPath: string,
  currentParams?: Record<string, any>
): BreadcrumbItem[] {
  return [
    ...currentBreadcrumb,
    { path: currentPath, params: currentParams },
  ];
}

/**
 * Remove a última página do breadcrumb e retorna a anterior
 */
export function getBackPath(breadcrumbs: BreadcrumbItem[]): BreadcrumbItem | null {
  if (breadcrumbs.length === 0) return null;
  return breadcrumbs[breadcrumbs.length - 1];
}

/**
 * Remove a última página do breadcrumb
 */
export function popBreadcrumb(breadcrumbs: BreadcrumbItem[]): BreadcrumbItem[] {
  return breadcrumbs.slice(0, -1);
}
