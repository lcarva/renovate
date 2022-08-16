export interface Resources {
  data: ResourceDataCollection;
}

export type ResourceDataCollection = ResourceData[];

export interface Catalog {
  id: number;
  name: string;
  type: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface ResourceVersionData {
  id: number;
  version: string;
  displayName: string;
  description: string;
  minPipelinesVersion: string;
  rawURL: string;
  webURL: string;
  hubURLPath: string;
  updatedAt: string;
  platforms: Category[];
  resource: ResourceData;
}

export interface ResourceData {
  id: number;
  name: string;
  catalog: Catalog;
  categories: Category[];
  kind: string;
  hubURLPath: string;
  latestVersion: ResourceVersionData;
  platforms: Category[];
  rating: number;
  tags: Category[];
  versions: ResourceVersionData[];
}
