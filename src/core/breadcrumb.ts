import { BreadcrumbItem, CoreOptions } from "@/types";

export class Breadcrumb {
  private readonly maxBreadcrumbs: number;
  private stack: BreadcrumbItem[] = [];

  constructor(options: CoreOptions) {
    this.maxBreadcrumbs = options?.breadcrumbOptions?.maxBreadcrumbs || 10;
    this.stack = [];
  }
  /**
   * 添加用户行为栈
   * @param {BreadcrumbItem} data
   */
  unshift(data: BreadcrumbItem) {
    if (this.stack.length >= this.maxBreadcrumbs) {
      this.pop();
    }
    this.stack.unshift(data);
    return this.stack;
  }

  private pop(): boolean {
    return this.stack.pop() !== undefined;
  }

  clear(): void {
    this.stack = [];
  }

  getStack() {
    return this.stack.slice(0);
  }
}
