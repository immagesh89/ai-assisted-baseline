import { ProductList } from "./features/products/ProductList";
import "./App.css";

function App() {
  return (
    <main className="app">
      <header className="app-header">
        <h1>Product Catalog</h1>
      </header>
      <ProductList />
    </main>
  );
}

export default App;
