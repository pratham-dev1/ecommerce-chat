export type ProductSummary = {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
};

export type ProductsResponse = {
  data: ProductSummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ProductsQueryParams = {
  page: number;
  pageSize: number;
  search?: string;
};
