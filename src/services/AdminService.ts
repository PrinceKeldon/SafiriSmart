
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

interface Operator {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  specializations: string[];
  is_active: boolean;
  created_at?: string;
  temporary_password?: string;
}

class AdminService {
  async getOperators(): Promise<ApiResponse<Operator[]>> {
    const mockOperators: Operator[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Safari Adventures Ltd',
        role: 'operator',
        specializations: ['Safari Tours', 'Wildlife Photography'],
        is_active: true,
        created_at: '2024-01-15'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        company: 'Mountain Expeditions',
        role: 'operator',
        specializations: ['Mountain Climbing', 'Trekking'],
        is_active: true,
        created_at: '2024-01-20'
      }
    ];

    return {
      success: true,
      data: mockOperators
    };
  }

  async createOperator(operatorData: {
    name: string;
    email: string;
    company: string;
    specializations?: string[];
  }): Promise<ApiResponse<Operator & { temporary_password?: string }>> {
    const newOperator: Operator & { temporary_password?: string } = {
      id: Date.now().toString(),
      name: operatorData.name,
      email: operatorData.email,
      company: operatorData.company,
      specializations: operatorData.specializations || [],
      role: 'operator',
      is_active: true,
      created_at: new Date().toISOString().split('T')[0],
      temporary_password: 'demo123'
    };

    return {
      success: true,
      data: newOperator
    };
  }
}

export const adminService = new AdminService();
