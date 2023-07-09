export class PageT<T> {
  readonly pageNum: number;
  readonly pageSize: number;
  readonly itemTotal: number;
  readonly items: T[];

  constructor(pageNum: number, pageSize: number, itemTotal?: number, items?: T[]) {
    this.pageNum = Math.max(1, pageNum);
    this.pageSize = Math.max(1, pageSize);
    this.itemTotal = itemTotal ?? 0;
    this.items = items ?? [];
  }

  get pageTotal() {
    return Math.ceil(this.itemTotal / this.pageSize);
  }

}
