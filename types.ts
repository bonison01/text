
export interface ExtractedData {
  id?: string;
  [key: string]: string | undefined;
  name?: string;
  company?: string;
  email?: string;
  address?: string;
  phone?: string;
  dateAdded?: string;
}

export interface ColumnConfig {
  key: string;
  header: string;
  visible: boolean;
}
