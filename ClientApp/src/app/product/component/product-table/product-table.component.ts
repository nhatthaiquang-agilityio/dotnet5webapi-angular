import { Component, AfterViewInit, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable,  Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { Product } from '../../core/models/product';
import { ProductParams } from '../../core/models/product-params';
import {
  selectAllProduct,
  selectProductTotal,
  selectProductError,
  selectProductLoading } from '../../store/product.selectors';
import { ProductLoadAction, ProductUpdateAction, ProductDeleteAction } from '../../store/product.actions';
import { GlobalState } from '../../store/global.states';

@Component({
  selector: 'app-product-table',
  templateUrl: './product-table.component.html',
  styleUrls: ['./product-table.component.css']
})
export class ProductTableComponent implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns: string[] = [
    'productId',
    'name',
    'code',
    'dateCreated',
    'quantity',
    'action'
  ];

  dataSource: MatTableDataSource<Product>;
  error$?: Observable<boolean>;
  noData: Product[] = [<Product>{}];
  loading?: boolean;
  productTotal?: number;
  pageEvent?: PageEvent;

  private subscription: Subscription = new Subscription();

  @ViewChild(MatPaginator, { static: true }) paginator?: MatPaginator;

  constructor(public store: Store<GlobalState>) {
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource<Product>([]);
  }

  ngOnInit(): void {
    // init selectors and subscribes: get list Products, total, loading and error
    this.store.pipe(select(selectAllProduct)).subscribe(products => this.initializeData(products));
    this.store.pipe(select(selectProductTotal)).subscribe(total => this.productTotal = total);

    this.subscription.add(this.store.pipe(select(selectProductLoading)).subscribe(loading => {
      if (loading) {
        this.dataSource = new MatTableDataSource(this.noData);
      }
      this.loading = loading;
    }));

    this.error$ = this.store.pipe(select(selectProductError));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  retry(): void {
    this.loadProducts();
  }

  ngAfterViewInit() {
    this.loadProducts();
  }

  handlePagination(event?: any) {
    this.loadProducts();
    return event;
  }

  update(productId: string): void {
    console.log("update", productId);
    // TODO: show popup model and then update values
  }

  delete(productId: string) {
    console.log("delete", productId);
    this.store.dispatch(new ProductDeleteAction(productId));
  }

  private loadProducts() {
    // call api
    this.store.dispatch(new ProductLoadAction(
      <ProductParams>{
        pageIndex: this.paginator?.pageIndex,
        pageSize: this.paginator?.pageSize
      }
    ));
  }

  // Init and render data in table
  private initializeData(products: Product[]): void {
    this.dataSource = new MatTableDataSource(products.length? products : this.noData);
  }
}
