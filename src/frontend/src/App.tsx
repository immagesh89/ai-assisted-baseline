import "./App.css";
import { ProductList } from "./features/products/ProductList";
import { SavedItemList } from "./features/savedItems/SavedItemList";
import { SavedItemsProvider } from "./features/savedItems/SavedItemsProvider";
import { usePathname } from "./usePathname";

const CATALOG_ROUTE = "/";
const SAVED_ROUTE = "/saved";

function App() {
  const [pathname, navigate] = usePathname();
  const showSaved = pathname === SAVED_ROUTE;

  return (
    <SavedItemsProvider>
      <main className="app">
        <header className="app-header">
          <h1>Product Catalog</h1>
          <nav className="app-nav">
            <a
              href={CATALOG_ROUTE}
              aria-current={showSaved ? undefined : "page"}
              onClick={(event) => {
                event.preventDefault();
                navigate(CATALOG_ROUTE);
              }}
            >
              Products
            </a>
            <a
              href={SAVED_ROUTE}
              aria-current={showSaved ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                navigate(SAVED_ROUTE);
              }}
            >
              Saved
            </a>
          </nav>
        </header>
        {showSaved ? <SavedItemList /> : <ProductList />}
      </main>
    </SavedItemsProvider>
  );
}

export default App;
