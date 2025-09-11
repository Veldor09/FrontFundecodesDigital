import API from './api';

export interface DashboardMetrics {
  metrics: {
    users: {
      total: number;
      label: string;
    };
    projects: {
      total: number;
      active: number;
      draft: number;
      finished: number;
      label: string;
    };
    files: {
      total: number;
      documents: number;
      images: number;
      lastUpload: {
        name: string;
        date: string;
      } | null;
      label: string;
    };
    volunteering: {
      total: number;
      thisMonth: number;
      label: string;
    };
    accounting: {
      total: number;
      label: string;
    };
    billing: {
      total: number;
      label: string;
    };
  };
  recap: {
    monthlyActivities: number;
    lastActivity: string | null;
  };
  quickAccess: Array<{
    name: string;
    href: string;
    icon: string;
  }>;
  timestamp: string;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const response = await API.get('/dashboard/metrics');
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al cargar métricas: ${error.message}`);
    } else {
      throw new Error('Error desconocido al cargar métricas');
    }
  }
}

export async function getProjectStats() {
  try {
    const response = await API.get('/dashboard/stats/projects');
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al cargar estadísticas: ${error.message}`);
    } else {
      throw new Error('Error desconocido al cargar estadísticas');
    }
  }
}