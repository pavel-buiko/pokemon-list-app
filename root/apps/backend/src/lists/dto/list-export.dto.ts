import { EXPORT_SCHEMA_VERSION } from '../../shared/constants';

export interface ListExportItem {
  id: number;
  name: string;
  weight: number;
}

export interface ListExportDto {
  version: typeof EXPORT_SCHEMA_VERSION;
  name: string;
  items: ListExportItem[];
}
